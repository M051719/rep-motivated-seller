#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Tool schemas
const MortgageCalculatorSchema = z.object({
  principal: z.number().positive().describe("Loan amount in dollars"),
  annualRate: z
    .number()
    .positive()
    .describe("Annual interest rate (e.g., 4.5 for 4.5%)"),
  years: z.number().positive().describe("Loan term in years"),
});

const ForeclosureTimelineSchema = z.object({
  state: z.string().describe("State abbreviation (e.g., CA, TX, FL)"),
  missedPayments: z.number().int().min(0).describe("Number of missed payments"),
  loanType: z
    .enum(["conventional", "fha", "va"])
    .describe("Type of mortgage loan"),
});

const EquityCalculatorSchema = z.object({
  propertyValue: z
    .number()
    .positive()
    .describe("Current property market value"),
  mortgageBalance: z
    .number()
    .nonnegative()
    .describe("Remaining mortgage balance"),
});

const ShortSaleAnalysisSchema = z.object({
  propertyValue: z.number().positive().describe("Current property value"),
  mortgageBalance: z.number().positive().describe("Total mortgage debt"),
  monthlyPayment: z
    .number()
    .positive()
    .describe("Current monthly mortgage payment"),
  missedPayments: z.number().int().min(0).describe("Number of missed payments"),
});

const PropertyComparablesSchema = z.object({
  address: z.string().describe("Property address"),
  bedrooms: z.number().int().positive().describe("Number of bedrooms"),
  bathrooms: z.number().positive().describe("Number of bathrooms"),
  squareFeet: z.number().positive().describe("Square footage"),
  zipCode: z.string().describe("ZIP code"),
});

// Tool implementations
class ForeclosureTools {
  // Mortgage calculator
  calculateMortgage(params: z.infer<typeof MortgageCalculatorSchema>) {
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

  // Foreclosure timeline calculator
  calculateForeclosureTimeline(
    params: z.infer<typeof ForeclosureTimelineSchema>,
  ) {
    const { state, missedPayments, loanType } = params;

    // State-specific timelines (in months)
    const stateTimelines: Record<
      string,
      { judicial: number; nonJudicial: number }
    > = {
      CA: { judicial: 12, nonJudicial: 4 },
      FL: { judicial: 6, nonJudicial: 0 },
      TX: { judicial: 0, nonJudicial: 2 },
      NY: { judicial: 15, nonJudicial: 0 },
      AZ: { judicial: 3, nonJudicial: 3 },
    };

    const timeline = stateTimelines[state.toUpperCase()] || {
      judicial: 8,
      nonJudicial: 4,
    };
    const isJudicial =
      state.toUpperCase() === "FL" || state.toUpperCase() === "NY";
    const timelineMonths = isJudicial
      ? timeline.judicial
      : timeline.nonJudicial;

    // Calculate stages
    const preForeclosure = 3; // Typically 90 days after first missed payment
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
      currentStage:
        missedPayments < 3
          ? "Early Default"
          : missedPayments < preForeclosure + 2
            ? "Pre-Foreclosure"
            : "Foreclosure Process",
      urgencyLevel:
        monthsRemaining < 2
          ? "Critical"
          : monthsRemaining < 4
            ? "High"
            : "Moderate",
      nextSteps: [
        "Contact lender immediately",
        "Explore loan modification options",
        "Consider short sale or deed in lieu",
        "Consult with foreclosure attorney",
        "Review state-specific homeowner protections",
      ],
    };
  }

  // Equity calculator
  calculateEquity(params: z.infer<typeof EquityCalculatorSchema>) {
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
      loanToValue:
        Math.round((mortgageBalance / propertyValue) * 100 * 100) / 100,
      recommendation:
        equity > 0
          ? "You have positive equity. Short sale may not be ideal. Consider selling traditionally or loan modification."
          : "You're underwater. Short sale or deed in lieu may be better options than foreclosure.",
    };
  }

  // Short sale analysis
  analyzeShortSale(params: z.infer<typeof ShortSaleAnalysisSchema>) {
    const { propertyValue, mortgageBalance, monthlyPayment, missedPayments } =
      params;

    const deficit = mortgageBalance - propertyValue;
    const arrearsAmount = monthlyPayment * missedPayments;
    const totalOwed = mortgageBalance + arrearsAmount;

    // Calculate foreclosure costs
    const foreclosureCosts = {
      legalFees: 2500,
      creditImpact: 150, // points
      timeDamage: 7, // years on credit
      deficiencyJudgment: deficit > 0 ? deficit : 0,
    };

    // Calculate short sale costs
    const shortSaleCosts = {
      realtorCommission: propertyValue * 0.06,
      closingCosts: propertyValue * 0.02,
      creditImpact: 100, // points
      timeDamage: 2, // years on credit
      potentialDeficiency: deficit * 0.3, // Lenders may forgive 70%
    };

    return {
      propertyValue,
      mortgageBalance,
      deficit: Math.max(0, deficit),
      arrearsAmount,
      totalOwed,
      foreclosureOption: {
        estimatedCosts:
          foreclosureCosts.legalFees + foreclosureCosts.deficiencyJudgment,
        creditScoreImpact: foreclosureCosts.creditImpact,
        creditReportYears: foreclosureCosts.timeDamage,
        deficiencyRisk: foreclosureCosts.deficiencyJudgment,
      },
      shortSaleOption: {
        estimatedCosts:
          shortSaleCosts.realtorCommission + shortSaleCosts.closingCosts,
        creditScoreImpact: shortSaleCosts.creditImpact,
        creditReportYears: shortSaleCosts.timeDamage,
        deficiencyRisk: shortSaleCosts.potentialDeficiency,
      },
      recommendation:
        deficit < 0
          ? "Traditional sale recommended - you have equity"
          : "Short sale is likely better than foreclosure. Less credit damage and potential deficiency forgiveness.",
      savings: {
        creditScorePoints:
          foreclosureCosts.creditImpact - shortSaleCosts.creditImpact,
        yearsOnCredit: foreclosureCosts.timeDamage - shortSaleCosts.timeDamage,
        financialSavings:
          foreclosureCosts.deficiencyJudgment -
          shortSaleCosts.potentialDeficiency,
      },
    };
  }

  // Property comparables (mock data - in production would call real API)
  getPropertyComparables(params: z.infer<typeof PropertyComparablesSchema>) {
    const { address, bedrooms, bathrooms, squareFeet, zipCode } = params;

    // Generate realistic mock comparables
    const baseValue = squareFeet * 200; // $200/sqft baseline
    const variance = 0.15; // 15% variance

    const generateComp = (offset: number) => ({
      address: `${1000 + offset} Similar St, Same City, ${zipCode}`,
      bedrooms: bedrooms + (Math.random() > 0.5 ? 1 : 0),
      bathrooms: bathrooms + (Math.random() > 0.7 ? 0.5 : 0),
      squareFeet: Math.round(squareFeet * (0.9 + Math.random() * 0.2)),
      soldPrice: Math.round(baseValue * (1 + (Math.random() - 0.5) * variance)),
      soldDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      daysOnMarket: Math.round(20 + Math.random() * 40),
      pricePerSqft: Math.round(200 * (1 + (Math.random() - 0.5) * variance)),
    });

    const comparables = [
      generateComp(1),
      generateComp(2),
      generateComp(3),
      generateComp(4),
      generateComp(5),
    ];

    const avgPrice =
      comparables.reduce((sum, comp) => sum + comp.soldPrice, 0) /
      comparables.length;
    const avgPricePerSqft =
      comparables.reduce((sum, comp) => sum + comp.pricePerSqft, 0) /
      comparables.length;

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
}

// MCP Server
class ForeclosureAssistantServer {
  private server: Server;
  private tools: ForeclosureTools;

  constructor() {
    this.server = new Server(
      {
        name: "foreclosure-assistant-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.tools = new ForeclosureTools();
    this.setupHandlers();

    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: "calculate_mortgage",
          description:
            "Calculate monthly mortgage payments, total interest, and payment schedule",
          inputSchema: {
            type: "object",
            properties: {
              principal: {
                type: "number",
                description: "Loan amount in dollars",
              },
              annualRate: {
                type: "number",
                description: "Annual interest rate (e.g., 4.5 for 4.5%)",
              },
              years: {
                type: "number",
                description: "Loan term in years",
              },
            },
            required: ["principal", "annualRate", "years"],
          },
        },
        {
          name: "calculate_foreclosure_timeline",
          description:
            "Estimate foreclosure timeline based on state laws and current status",
          inputSchema: {
            type: "object",
            properties: {
              state: {
                type: "string",
                description: "State abbreviation (e.g., CA, TX, FL)",
              },
              missedPayments: {
                type: "number",
                description: "Number of missed mortgage payments",
              },
              loanType: {
                type: "string",
                enum: ["conventional", "fha", "va"],
                description: "Type of mortgage loan",
              },
            },
            required: ["state", "missedPayments", "loanType"],
          },
        },
        {
          name: "calculate_equity",
          description:
            "Calculate home equity, loan-to-value ratio, and determine if underwater",
          inputSchema: {
            type: "object",
            properties: {
              propertyValue: {
                type: "number",
                description: "Current property market value",
              },
              mortgageBalance: {
                type: "number",
                description: "Remaining mortgage balance",
              },
            },
            required: ["propertyValue", "mortgageBalance"],
          },
        },
        {
          name: "analyze_short_sale",
          description:
            "Compare short sale vs foreclosure options with financial impact analysis",
          inputSchema: {
            type: "object",
            properties: {
              propertyValue: {
                type: "number",
                description: "Current property value",
              },
              mortgageBalance: {
                type: "number",
                description: "Total mortgage debt",
              },
              monthlyPayment: {
                type: "number",
                description: "Current monthly mortgage payment",
              },
              missedPayments: {
                type: "number",
                description: "Number of missed payments",
              },
            },
            required: [
              "propertyValue",
              "mortgageBalance",
              "monthlyPayment",
              "missedPayments",
            ],
          },
        },
        {
          name: "get_property_comparables",
          description:
            "Get comparable property sales data for market value estimation",
          inputSchema: {
            type: "object",
            properties: {
              address: {
                type: "string",
                description: "Property address",
              },
              bedrooms: {
                type: "number",
                description: "Number of bedrooms",
              },
              bathrooms: {
                type: "number",
                description: "Number of bathrooms",
              },
              squareFeet: {
                type: "number",
                description: "Square footage",
              },
              zipCode: {
                type: "string",
                description: "ZIP code",
              },
            },
            required: [
              "address",
              "bedrooms",
              "bathrooms",
              "squareFeet",
              "zipCode",
            ],
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "calculate_mortgage": {
            const params = MortgageCalculatorSchema.parse(args);
            const result = this.tools.calculateMortgage(params);
            return {
              content: [
                { type: "text", text: JSON.stringify(result, null, 2) },
              ],
            };
          }

          case "calculate_foreclosure_timeline": {
            const params = ForeclosureTimelineSchema.parse(args);
            const result = this.tools.calculateForeclosureTimeline(params);
            return {
              content: [
                { type: "text", text: JSON.stringify(result, null, 2) },
              ],
            };
          }

          case "calculate_equity": {
            const params = EquityCalculatorSchema.parse(args);
            const result = this.tools.calculateEquity(params);
            return {
              content: [
                { type: "text", text: JSON.stringify(result, null, 2) },
              ],
            };
          }

          case "analyze_short_sale": {
            const params = ShortSaleAnalysisSchema.parse(args);
            const result = this.tools.analyzeShortSale(params);
            return {
              content: [
                { type: "text", text: JSON.stringify(result, null, 2) },
              ],
            };
          }

          case "get_property_comparables": {
            const params = PropertyComparablesSchema.parse(args);
            const result = this.tools.getPropertyComparables(params);
            return {
              content: [
                { type: "text", text: JSON.stringify(result, null, 2) },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(
            `Invalid arguments: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
          );
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Foreclosure Assistant MCP Server running on stdio");
  }
}

// Start server
const server = new ForeclosureAssistantServer();
server.run().catch(console.error);
