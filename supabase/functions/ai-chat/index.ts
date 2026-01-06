import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const DAPPIER_API_KEY = Deno.env.get("DAPPIER_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// MCP Tools definitions (matching the MCP server)
const AVAILABLE_TOOLS = [
  {
    type: "function",
    function: {
      name: "calculate_mortgage",
      description: "Calculate monthly mortgage payments, total interest, and payment schedule",
      parameters: {
        type: "object",
        properties: {
          principal: { type: "number", description: "Loan amount in dollars" },
          annualRate: { type: "number", description: "Annual interest rate (e.g., 4.5 for 4.5%)" },
          years: { type: "number", description: "Loan term in years" },
        },
        required: ["principal", "annualRate", "years"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_foreclosure_timeline",
      description: "Estimate foreclosure timeline based on state laws and current status",
      parameters: {
        type: "object",
        properties: {
          state: { type: "string", description: "State abbreviation (e.g., CA, TX, FL)" },
          missedPayments: { type: "number", description: "Number of missed mortgage payments" },
          loanType: { type: "string", enum: ["conventional", "fha", "va"], description: "Type of mortgage loan" },
        },
        required: ["state", "missedPayments", "loanType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_equity",
      description: "Calculate home equity, loan-to-value ratio, and determine if underwater",
      parameters: {
        type: "object",
        properties: {
          propertyValue: { type: "number", description: "Current property market value" },
          mortgageBalance: { type: "number", description: "Remaining mortgage balance" },
        },
        required: ["propertyValue", "mortgageBalance"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_short_sale",
      description: "Compare short sale vs foreclosure options with financial impact analysis",
      parameters: {
        type: "object",
        properties: {
          propertyValue: { type: "number", description: "Current property value" },
          mortgageBalance: { type: "number", description: "Total mortgage debt" },
          monthlyPayment: { type: "number", description: "Current monthly mortgage payment" },
          missedPayments: { type: "number", description: "Number of missed payments" },
        },
        required: ["propertyValue", "mortgageBalance", "monthlyPayment", "missedPayments"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_property_comparables",
      description: "Get comparable property sales data for market value estimation",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "Property address" },
          bedrooms: { type: "number", description: "Number of bedrooms" },
          bathrooms: { type: "number", description: "Number of bathrooms" },
          squareFeet: { type: "number", description: "Square footage" },
          zipCode: { type: "string", description: "ZIP code" },
        },
        required: ["address", "bedrooms", "bathrooms", "squareFeet", "zipCode"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_real_time_market_data",
      description: "Get real-time, licensed market data and foreclosure insights from Dappier",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Market data query (e.g., 'foreclosure trends in California 2025')" },
          location: { type: "string", description: "City, state, or ZIP code" },
        },
        required: ["query"],
      },
    },
  },
];

// Dappier integration for real-time licensed data
async function getDappierData(query: string, location?: string) {
  if (!DAPPIER_API_KEY) {
    return { error: "Dappier API key not configured", fallback: true };
  }

  try {
    const searchQuery = location ? `${query} in ${location}` : query;
    const response = await fetch(`https://mcp.dappier.com/sse?apiKey=${DAPPIER_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        domains: ["real-estate", "legal", "finance"],
        freshness: "recent", // Last 30 days
        limit: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Dappier API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      sources: data.sources || [],
      lastUpdated: new Date().toISOString(),
      dataProvider: "Dappier - Licensed Real-Time Data",
    };
  } catch (error) {
    console.error("Dappier API error:", error);
    return { error: error.message, fallback: true };
  }
}

// Tool execution functions (implementing the same logic as MCP server)
function calculateMortgage(params: any) {
  const { principal, annualRate, years } = params;
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  const totalPaid = monthlyPayment * numberOfPayments;
  const totalInterest = totalPaid - principal;
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    principal,
    interestRate: annualRate,
    loanTerm: years,
  };
}

function calculateForeclosureTimeline(params: any) {
  const { state, missedPayments, loanType } = params;
  
  const stateTimelines: Record<string, { judicial: number; nonJudicial: number }> = {
    CA: { judicial: 12, nonJudicial: 4 },
    FL: { judicial: 6, nonJudicial: 0 },
    TX: { judicial: 0, nonJudicial: 2 },
    NY: { judicial: 15, nonJudicial: 0 },
    AZ: { judicial: 3, nonJudicial: 3 },
  };
  
  const timeline = stateTimelines[state.toUpperCase()] || { judicial: 8, nonJudicial: 4 };
  const isJudicial = state.toUpperCase() === "FL" || state.toUpperCase() === "NY";
  const timelineMonths = isJudicial ? timeline.judicial : timeline.nonJudicial;
  
  const preForeclosure = 3;
  const foreclosureProcess = timelineMonths;
  const totalTimeline = preForeclosure + foreclosureProcess;
  const monthsRemaining = Math.max(0, totalTimeline - missedPayments);
  
  return {
    state: state.toUpperCase(),
    loanType,
    missedPayments,
    processType: isJudicial ? "Judicial" : "Non-Judicial",
    preForeclosureMonths: preForeclosure,
    foreclosureProcessMonths: foreclosureProcess,
    totalTimelineMonths: totalTimeline,
    monthsRemainingEstimate: monthsRemaining,
    currentStage: missedPayments < 3 ? "Early Default" : 
                  missedPayments < preForeclosure + 2 ? "Pre-Foreclosure" : "Foreclosure Process",
    urgencyLevel: monthsRemaining < 2 ? "Critical" : monthsRemaining < 4 ? "High" : "Moderate",
    nextSteps: [
      "Contact lender immediately",
      "Explore loan modification options",
      "Consider short sale or deed in lieu",
      "Consult with foreclosure attorney",
      "Review state-specific homeowner protections",
    ],
  };
}

function calculateEquity(params: any) {
  const { propertyValue, mortgageBalance } = params;
  const equity = propertyValue - mortgageBalance;
  const equityPercentage = (equity / propertyValue) * 100;
  
  return {
    propertyValue,
    mortgageBalance,
    equity: Math.round(equity * 100) / 100,
    equityPercentage: Math.round(equityPercentage * 100) / 100,
    hasPositiveEquity: equity > 0,
    isUnderwater: equity < 0,
    loanToValue: Math.round((mortgageBalance / propertyValue) * 100 * 100) / 100,
    recommendation: equity > 0 
      ? "You have positive equity. Short sale may not be ideal. Consider selling traditionally or loan modification."
      : "You're underwater. Short sale or deed in lieu may be better options than foreclosure.",
  };
}

function analyzeShortSale(params: any) {
  const { propertyValue, mortgageBalance, monthlyPayment, missedPayments } = params;
  
  const deficit = mortgageBalance - propertyValue;
  const arrearsAmount = monthlyPayment * missedPayments;
  const totalOwed = mortgageBalance + arrearsAmount;
  
  const foreclosureCosts = {
    legalFees: 2500,
    creditImpact: 150,
    timeDamage: 7,
    deficiencyJudgment: deficit > 0 ? deficit : 0,
  };
  
  const shortSaleCosts = {
    realtorCommission: propertyValue * 0.06,
    closingCosts: propertyValue * 0.02,
    creditImpact: 100,
    timeDamage: 2,
    potentialDeficiency: deficit * 0.3,
  };
  
  return {
    propertyValue,
    mortgageBalance,
    deficit: Math.max(0, deficit),
    arrearsAmount,
    totalOwed,
    foreclosureOption: {
      estimatedCosts: foreclosureCosts.legalFees + foreclosureCosts.deficiencyJudgment,
      creditScoreImpact: foreclosureCosts.creditImpact,
      creditReportYears: foreclosureCosts.timeDamage,
      deficiencyRisk: foreclosureCosts.deficiencyJudgment,
    },
    shortSaleOption: {
      estimatedCosts: shortSaleCosts.realtorCommission + shortSaleCosts.closingCosts,
      creditScoreImpact: shortSaleCosts.creditImpact,
      creditReportYears: shortSaleCosts.timeDamage,
      deficiencyRisk: shortSaleCosts.potentialDeficiency,
    },
    recommendation: deficit < 0 
      ? "Traditional sale recommended - you have equity"
      : "Short sale is likely better than foreclosure. Less credit damage and potential deficiency forgiveness.",
    savings: {
      creditScorePoints: foreclosureCosts.creditImpact - shortSaleCosts.creditImpact,
      yearsOnCredit: foreclosureCosts.timeDamage - shortSaleCosts.timeDamage,
      financialSavings: (foreclosureCosts.deficiencyJudgment - shortSaleCosts.potentialDeficiency),
    },
  };
}

function getPropertyComparables(params: any) {
  const { address, bedrooms, bathrooms, squareFeet, zipCode } = params;
  
  const baseValue = squareFeet * 200;
  const variance = 0.15;
  
  const generateComp = (offset: number) => ({
    address: `${1000 + offset} Similar St, Same City, ${zipCode}`,
    bedrooms: bedrooms + (Math.random() > 0.5 ? 1 : 0),
    bathrooms: bathrooms + (Math.random() > 0.7 ? 0.5 : 0),
    squareFeet: Math.round(squareFeet * (0.9 + Math.random() * 0.2)),
    soldPrice: Math.round(baseValue * (1 + (Math.random() - 0.5) * variance)),
    soldDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysOnMarket: Math.round(20 + Math.random() * 40),
    pricePerSqft: Math.round(200 * (1 + (Math.random() - 0.5) * variance)),
  });
  
  const comparables = [generateComp(1), generateComp(2), generateComp(3), generateComp(4), generateComp(5)];
  
  const avgPrice = comparables.reduce((sum: number, comp: any) => sum + comp.soldPrice, 0) / comparables.length;
  const avgPricePerSqft = comparables.reduce((sum: number, comp: any) => sum + comp.pricePerSqft, 0) / comparables.length;
  
  return {
    subject: { address, bedrooms, bathrooms, squareFeet, zipCode },
    comparables,
    analysis: {
      averageSoldPrice: Math.round(avgPrice),
      averagePricePerSqft: Math.round(avgPricePerSqft),
      estimatedValue: Math.round(squareFeet * avgPricePerSqft),
      marketTrend: "Stable",
      confidenceLevel: "Moderate (based on limited data)",
    },
    note: "These are sample comparables. In production, this would use Attom Data, Zillow, or MLS APIs for real data.",
  };
}

// Execute tool calls
async function executeTool(toolName: string, params: any) {
  switch (toolName) {
    case "calculate_mortgage":
      return calculateMortgage(params);
    case "calculate_foreclosure_timeline":
      return calculateForeclosureTimeline(params);
    case "calculate_equity":
      return calculateEquity(params);
    case "analyze_short_sale":
      return analyzeShortSale(params);
    case "get_property_comparables":
      return getPropertyComparables(params);
    case "get_real_time_market_data":
      return await getDappierData(params.query, params.location);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { message, session_id, user_id } = await req.json();

    if (!message || !session_id || !user_id) {
      throw new Error("Missing required fields: message, session_id, user_id");
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get chat history for context
    const { data: history, error: historyError } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true })
      .limit(10);

    if (historyError) {
      console.error("Error fetching history:", historyError);
    }

    // Build messages array for OpenAI
    const messages = [
      {
        role: "system",
        content: `You are a compassionate and knowledgeable foreclosure assistance AI. Your goal is to help homeowners facing foreclosure understand their options, timelines, and make informed decisions.

Key guidelines:
- Be empathetic and non-judgmental
- Provide accurate information about foreclosure processes
- Use available tools to calculate specific scenarios
- Explain financial concepts in simple terms
- Always recommend consulting with professionals for legal/financial advice
- Focus on practical, actionable steps
- When using real-time market data (Dappier), cite sources and mention data freshness

Available tools:
- calculate_mortgage: For payment calculations
- calculate_foreclosure_timeline: State-specific timeline estimates
- calculate_equity: Home equity and LTV analysis
- analyze_short_sale: Compare short sale vs foreclosure
- get_property_comparables: Market value estimates (mock data)
- get_real_time_market_data: Real-time, licensed market insights from Dappier (when available)

When users ask about market trends, recent foreclosure statistics, or current laws, use get_real_time_market_data to provide up-to-date, licensed information.
When users ask about specific numbers or their situation, use the calculator tools to provide accurate calculations.`,
      },
    ];

    // Add chat history
    if (history && history.length > 0) {
      messages.push(...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })));
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Save user message to database
    await supabase.from("chat_messages").insert({
      session_id,
      role: "user",
      content: message,
    });

    // Call OpenAI with tools
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages,
        tools: AVAILABLE_TOOLS,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const completion = await openaiResponse.json();
    const assistantMessage = completion.choices[0].message;

    // Handle tool calls if present
    let toolResults = [];
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall: any) => {
          const toolName = toolCall.function.name;
          const toolParams = JSON.parse(toolCall.function.arguments);
          const result = await executeTool(toolName, toolParams);
          
          return {
            name: toolName,
            result,
          };
        })
      );

      // Make a second call to OpenAI with tool results
      const toolMessages = [
        ...messages,
        assistantMessage,
        ...assistantMessage.tool_calls.map((toolCall: any, idx: number) => ({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResults[idx].result),
        })),
      ];

      const finalResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: toolMessages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const finalCompletion = await finalResponse.json();
      assistantMessage.content = finalCompletion.choices[0].message.content;
    }

    // Save assistant message to database
    const { data: savedMessage } = await supabase
      .from("chat_messages")
      .insert({
        session_id,
        role: "assistant",
        content: assistantMessage.content,
        tool_calls: toolResults.length > 0 ? toolResults : null,
        tokens_used: completion.usage?.total_tokens || 0,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        response: assistantMessage.content,
        tool_calls: toolResults.length > 0 ? toolResults : undefined,
        message_id: savedMessage?.id,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
