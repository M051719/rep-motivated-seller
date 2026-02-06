import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Welcome message that integrates with your existing system
    if (messages.length === 0) {
      const welcomeMessage = {
        id: "1",
        type: "ai",
        content: `🏠 Hi! I'm your RepMotivatedSeller AI assistant. I can help you with:

• **Foreclosure Questions** - Timeline, process, options
• **Your Questionnaire** - Navigate your foreclosure questionnaire
• **Education** - Recommend courses and learning paths
• **Legal Documents** - Explain notices and paperwork
• **Resources** - Find local assistance programs
• **Marketing** - For admin users, campaign insights

**Quick Actions:**
Type "questionnaire" to start your assessment
Type "education" to see learning options
Type "emergency" for immediate help

What can I help you with today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Generate AI response based on your existing system
    setTimeout(() => {
      const aiResponse = generateContextualResponse(inputValue);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);

    // Track interaction in your existing database
    trackInteraction(inputValue);
  };

  const generateContextualResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    // Integration with your existing ForeclosureQuestionnaire
    if (
      lowerInput.includes("questionnaire") ||
      lowerInput.includes("assessment")
    ) {
      return `📝 **Perfect! Let's get you started with our foreclosure assessment.**

Our questionnaire will help determine:
• Your specific situation and timeline
• Available options for your case
• Recommended next steps
• Resources in your area

**[Start Questionnaire](/foreclosure-questionnaire)**

This usually takes 5-10 minutes and provides personalized recommendations. Would you like me to guide you through it, or do you have specific questions first?`;
    }

    // Integration with your existing education system
    if (
      lowerInput.includes("education") ||
      lowerInput.includes("learn") ||
      lowerInput.includes("course")
    ) {
      return `🎓 **Great choice! Education is your best defense against foreclosure.**

Based on your situation, I recommend:

**Beginner Path:**
1. Foreclosure Prevention 101 (45 min)
2. Understanding Legal Documents (30 min)
3. Timeline and Deadlines (25 min)

**Advanced Path:**
4. Loan Modification Strategies
5. Credit Repair Fundamentals
6. Legal Rights and Protections

**[Access Education Platform](/education)**

Would you like me to recommend specific courses based on your current situation?`;
    }

    // Emergency/crisis response
    if (
      lowerInput.includes("emergency") ||
      lowerInput.includes("urgent") ||
      lowerInput.includes("help now")
    ) {
      return `🆘 **IMMEDIATE HELP AVAILABLE**

**Right Now:**
📞 **Call: (877) 806-4677** - Emergency hotline
💬 **Live Chat** - Connect with specialist immediately
📋 **Quick Assessment** - Get instant recommendations

**Your Options:**
• Loan modification programs
• Emergency assistance funds
• Legal aid resources
• Temporary payment relief

**IMPORTANT:** Don't ignore any notices! Every day matters when facing foreclosure.

**[Get Emergency Help](/foreclosure-help)**

Would you like me to connect you with someone immediately?`;
    }

    // Integration with existing admin/marketing features
    if (lowerInput.includes("marketing") || lowerInput.includes("campaign")) {
      return `📬 **Marketing & Outreach Tools**

**Direct Mail System:**
• AI-powered targeting
• Canva design integration
• Automated follow-ups
• ROI tracking

**Campaign Analytics:**
• Response rates
• Cost per acquisition
• Geographic performance
• Demographic insights

**[Access Marketing Dashboard](/marketing/dashboard)**

Are you looking to create a new campaign or review existing performance?`;
    }

    // Default helpful response
    return `I understand you're asking about "${input}".

**I can help with:**
• **Foreclosure Process** - Timeline, legal steps, your rights
• **Assessment Tools** - Take our questionnaire for personalized help
• **Education** - Free courses and certificates
• **Emergency Resources** - Immediate assistance options
• **Document Help** - Explain legal notices and forms

**Quick Commands:**
• Type "questionnaire" - Start your assessment
• Type "emergency" - Get immediate help
• Type "education" - Browse learning options
• Type "timeline" - Understand foreclosure process

What specific area would you like to explore?`;
  };

  const trackInteraction = async (message: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Use your existing database structure
      await supabase.from("ai_interactions").insert({
        user_id: user?.id || null,
        message: message.substring(0, 500),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error tracking interaction:", error);
    }
  };

  const quickActions = [
    {
      text: "📝 Take Assessment",
      action: "Start the foreclosure questionnaire",
    },
    { text: "🎓 Learn More", action: "Show me education options" },
    { text: "🆘 Emergency Help", action: "I need immediate assistance" },
    { text: "📞 Contact Expert", action: "Connect me with a specialist" },
  ];

  return (
    <>
      {/* AI Chat Button */}
      <motion.button
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all ${isOpen ? "scale-95" : "scale-100"}`}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        {isOpen ? (
          <span className="text-2xl">✕</span>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-2xl">🤖</span>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse absolute -top-1 -right-1"></div>
          </div>
        )}
      </motion.button>

      {/* Enhanced Chat Window - Integrates with your existing system */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-40 w-96 h-[32rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="font-semibold">RepMotivatedSeller AI</h3>
                    <p className="text-xs text-blue-100">
                      Connected to your account
                    </p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-xs p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-2 border-t">
              <div className="grid grid-cols-2 gap-1 mb-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(action.action);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors text-left"
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask about your foreclosure situation..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
