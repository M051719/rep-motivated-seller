import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

interface QuestionnaireEnhancementProps {
  existingData?: any; // From your current ForeclosureQuestionnaire
  onEnhancedComplete?: (data: any) => void;
}

const ForeclosureQuestionnaireEnhancement: React.FC<
  QuestionnaireEnhancementProps
> = ({ existingData, onEnhancedComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState({});
  const [aiRecommendations, setAIRecommendations] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [urgencyLevel, setUrgencyLevel] = useState("medium");
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Enhanced questionnaire steps building on your existing structure
  const enhancedSteps = useMemo(
    () => [
      {
        id: 1,
        title: "🏠 Property Information",
        description: "Tell us about your property situation",
        questions: [
          {
            id: "property_value",
            text: "What is your estimated property value?",
            type: "number",
            required: true,
            aiWeight: 0.2,
          },
          {
            id: "mortgage_balance",
            text: "What is your current mortgage balance?",
            type: "number",
            required: true,
            aiWeight: 0.25,
          },
          {
            id: "monthly_payment",
            text: "What is your monthly mortgage payment?",
            type: "number",
            required: true,
            aiWeight: 0.15,
          },
        ],
      },
      {
        id: 2,
        title: "⏰ Timeline & Status",
        description: "Help us understand your current situation",
        questions: [
          {
            id: "months_behind",
            text: "How many months behind are you on payments?",
            type: "select",
            options: [
              { value: "0", label: "Current on payments" },
              { value: "1", label: "1 month behind" },
              { value: "2", label: "2 months behind" },
              { value: "3", label: "3 months behind" },
              { value: "4+", label: "4 or more months behind" },
            ],
            required: true,
            aiWeight: 0.3,
          },
          {
            id: "notice_received",
            text: "Have you received any foreclosure notices?",
            type: "select",
            options: [
              { value: "none", label: "No notices received" },
              { value: "intent", label: "Notice of Intent to Foreclose" },
              { value: "default", label: "Notice of Default" },
              { value: "sale", label: "Notice of Sale" },
              { value: "other", label: "Other legal notice" },
            ],
            required: true,
            aiWeight: 0.25,
          },
        ],
      },
      {
        id: 3,
        title: "💰 Financial Situation",
        description: "Your income and expenses",
        questions: [
          {
            id: "monthly_income",
            text: "What is your total monthly household income?",
            type: "number",
            required: true,
            aiWeight: 0.2,
          },
          {
            id: "job_stability",
            text: "How would you describe your employment situation?",
            type: "select",
            options: [
              { value: "stable", label: "Stable full-time employment" },
              { value: "unstable", label: "Unstable or part-time work" },
              { value: "unemployed", label: "Currently unemployed" },
              { value: "retired", label: "Retired/Fixed income" },
              { value: "self_employed", label: "Self-employed" },
            ],
            required: true,
            aiWeight: 0.15,
          },
        ],
      },
    ],
    [],
  );

  const calculateRiskScore = useCallback(() => {
    let score = 0;
    let totalWeight = 0;

    enhancedSteps.forEach((step) => {
      step.questions.forEach((question) => {
        const response = responses[question.id];
        const weight = question.aiWeight || 0;
        totalWeight += weight;

        if (response) {
          // Risk scoring logic based on responses
          switch (question.id) {
            case "months_behind":
              const months = parseInt(response);
              score += months * 25 * weight; // Higher months = higher risk
              break;
            case "notice_received":
              const noticeRisk = {
                none: 0,
                intent: 40,
                default: 70,
                sale: 90,
                other: 60,
              };
              score += (noticeRisk[response] || 0) * weight;
              break;
            case "property_value":
            case "mortgage_balance":
              const propertyValue = parseInt(responses["property_value"]) || 0;
              const mortgageBalance =
                parseInt(responses["mortgage_balance"]) || 0;
              if (propertyValue > 0 && mortgageBalance > 0) {
                const ltv = mortgageBalance / propertyValue;
                score += (ltv > 0.9 ? 50 : ltv > 0.8 ? 30 : 10) * weight;
              }
              break;
            case "job_stability":
              const jobRisk = {
                stable: 10,
                unstable: 40,
                unemployed: 80,
                retired: 20,
                self_employed: 30,
              };
              score += (jobRisk[response] || 0) * weight;
              break;
          }
        }
      });
    });

    const finalScore = Math.min(100, Math.round(score / totalWeight));
    setRiskScore(finalScore);

    // Set urgency level based on score
    if (finalScore >= 70) setUrgencyLevel("high");
    else if (finalScore >= 40) setUrgencyLevel("medium");
    else setUrgencyLevel("low");
  }, [enhancedSteps, responses]);

  const generateAIRecommendations = useCallback(() => {
    const recommendations = [];

    // AI-powered recommendations based on responses
    const monthsBehind = parseInt(responses["months_behind"]) || 0;
    const noticeReceived = responses["notice_received"];
    const jobStability = responses["job_stability"];

    if (monthsBehind >= 3) {
      recommendations.push({
        priority: "high",
        title: "Immediate Action Required",
        description:
          "Contact your lender immediately to discuss loss mitigation options",
        action: "Call lender today",
        icon: "🚨",
      });
    }

    if (noticeReceived === "sale") {
      recommendations.push({
        priority: "critical",
        title: "Critical Timeline Alert",
        description: "You may have very limited time before foreclosure sale",
        action: "Seek legal counsel immediately",
        icon: "⚠️",
      });
    }

    if (jobStability === "unemployed") {
      recommendations.push({
        priority: "high",
        title: "Explore Unemployment Forbearance",
        description: "Special programs available for unemployed homeowners",
        action: "Apply for forbearance",
        icon: "💼",
      });
    }

    // Add education recommendations
    recommendations.push({
      priority: "medium",
      title: "Complete Foreclosure Prevention Course",
      description:
        "Learn your options and rights through our free education program",
      action: "Start learning now",
      icon: "🎓",
    });

    setAIRecommendations(recommendations);
  }, [responses]);

  useEffect(() => {
    calculateRiskScore();
    generateAIRecommendations();
  }, [calculateRiskScore, generateAIRecommendations]);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < enhancedSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      completeQuestionnaire();
    }
  };

  const completeQuestionnaire = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Enhanced data structure building on your existing system
      const enhancedData = {
        ...existingData, // Your existing questionnaire data
        responses,
        aiAnalysis: {
          riskScore,
          urgencyLevel,
          recommendations: aiRecommendations,
          generatedAt: new Date().toISOString(),
        },
        enhancedMetrics: {
          propertyEquity: calculateEquity(),
          debtToIncomeRatio: calculateDTI(),
          foreclosureTimeline: estimateTimeline(),
        },
      };

      // Save to your existing table structure
      const { error } = await supabase.from("foreclosure_responses").insert({
        user_id: user?.id,
        responses: enhancedData,
        risk_score: riskScore,
        urgency_level: urgencyLevel,
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Trigger AI recommendations display
      setShowAIInsights(true);

      // Call your existing completion handler
      onEnhancedComplete?.(enhancedData);
    } catch (error) {
      console.error("Error saving enhanced questionnaire:", error);
    }
  };

  const calculateEquity = () => {
    const propertyValue = parseInt(responses["property_value"]) || 0;
    const mortgageBalance = parseInt(responses["mortgage_balance"]) || 0;
    return propertyValue - mortgageBalance;
  };

  const calculateDTI = () => {
    const monthlyPayment = parseInt(responses["monthly_payment"]) || 0;
    const monthlyIncome = parseInt(responses["monthly_income"]) || 0;
    return monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0;
  };

  const estimateTimeline = () => {
    const noticeReceived = responses["notice_received"];
    const timelineEstimates = {
      none: "3-6 months to first notice",
      intent: "30-60 days to Notice of Default",
      default: "90-120 days to foreclosure sale",
      sale: "10-30 days to foreclosure sale",
      other: "Varies by notice type",
    };
    return timelineEstimates[noticeReceived] || "Unable to estimate";
  };

  const currentStepData = enhancedSteps[currentStep - 1];

  return (
    <div className="questionnaire-enhancement max-w-4xl mx-auto p-6">
      {/* AI-Enhanced Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            🤖 AI-Enhanced Foreclosure Assessment
          </h1>
          <div className="text-sm text-gray-600">
            Step {currentStep} of {enhancedSteps.length}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / enhancedSteps.length) * 100}%` }}
          ></div>
        </div>

        {/* Real-time Risk Indicator */}
        {riskScore > 0 && (
          <motion.div
            className={`p-4 rounded-lg mb-6 ${
              urgencyLevel === "high"
                ? "bg-red-50 border border-red-200"
                : urgencyLevel === "medium"
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-green-50 border border-green-200"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {urgencyLevel === "high"
                    ? "🚨"
                    : urgencyLevel === "medium"
                      ? "⚠️"
                      : "✅"}
                </span>
                <div>
                  <h3
                    className={`font-semibold ${
                      urgencyLevel === "high"
                        ? "text-red-900"
                        : urgencyLevel === "medium"
                          ? "text-yellow-900"
                          : "text-green-900"
                    }`}
                  >
                    Risk Level:{" "}
                    {urgencyLevel.charAt(0).toUpperCase() +
                      urgencyLevel.slice(1)}
                  </h3>
                  <p
                    className={`text-sm ${
                      urgencyLevel === "high"
                        ? "text-red-700"
                        : urgencyLevel === "medium"
                          ? "text-yellow-700"
                          : "text-green-700"
                    }`}
                  >
                    AI Analysis Score: {riskScore}/100
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIInsights(!showAIInsights)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  urgencyLevel === "high"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : urgencyLevel === "medium"
                      ? "bg-yellow-600 text-white hover:bg-yellow-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {showAIInsights ? "Hide" : "Show"} AI Insights
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Insights Panel */}
      <AnimatePresence>
        {showAIInsights && aiRecommendations.length > 0 && (
          <motion.div
            className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg font-semibold text-purple-900 mb-4">
              🤖 AI Recommendations Based on Your Responses
            </h3>

            <div className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === "critical"
                      ? "bg-red-50 border-red-500"
                      : rec.priority === "high"
                        ? "bg-orange-50 border-orange-500"
                        : "bg-blue-50 border-blue-500"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {rec.title}
                      </h4>
                      <p className="text-gray-700 text-sm mb-2">
                        {rec.description}
                      </p>
                      <button
                        className={`text-sm font-medium px-3 py-1 rounded ${
                          rec.priority === "critical"
                            ? "bg-red-600 text-white"
                            : rec.priority === "high"
                              ? "bg-orange-600 text-white"
                              : "bg-blue-600 text-white"
                        }`}
                      >
                        {rec.action}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Question Interface */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        <div className="space-y-6">
          {currentStepData.questions.map((question, index) => (
            <motion.div
              key={question.id}
              className="border border-gray-200 rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {question.text}
                {question.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>

              {question.type === "select" ? (
                <select
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={question.required}
                >
                  <option value="">Select an option...</option>
                  {question.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={question.type}
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={question.required}
                  placeholder={
                    question.type === "number"
                      ? "Enter amount"
                      : "Your response"
                  }
                />
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {currentStep === enhancedSteps.length
              ? "Complete Assessment"
              : "Next"}
          </button>
        </div>
      </div>

      {/* Enhanced Completion View */}
      {showAIInsights && currentStep === enhancedSteps.length && (
        <motion.div
          className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Assessment Complete!
            </h2>
            <p className="text-gray-700 mb-6">
              Our AI has analyzed your situation and generated personalized
              recommendations.
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => (window.location.href = "/education")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                🎓 Start Learning
              </button>
              <button
                onClick={() => (window.location.href = "/foreclosure-help")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
              >
                💬 Get Help Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ForeclosureQuestionnaireEnhancement;
