import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Bot, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FloatingAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant for RepMotivatedSeller. I can help you with foreclosure prevention, property analysis, investment strategies, and more. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { label: 'Property Analysis', icon: '🏠' },
    { label: 'Investment ROI', icon: '💰' },
    { label: 'Foreclosure Help', icon: '🆘' },
    { label: 'Market Trends', icon: '📈' },
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('property') || input.includes('analysis')) {
      return "I can help you analyze properties! Use our Professional Underwriting calculator for detailed investment analysis including IRR, cash flow projections, and 3-scenario modeling. Would you like me to guide you through it?";
    } else if (input.includes('roi') || input.includes('return')) {
      return "Great question about ROI! We have 4 calculators to help: ROI Calculator for basic returns, Cap Rate for income properties, Cash-on-Cash for leveraged deals, and DSCR for lender qualification. Which interests you most?";
    } else if (input.includes('foreclosure') || input.includes('help')) {
      return "I understand this can be stressful. We offer foreclosure prevention resources including hardship letter templates, government assistance programs, and free consultation scheduling. You can also explore our credit repair services. What would help you most right now?";
    } else if (input.includes('market') || input.includes('trend')) {
      return "Market insights are crucial! Check our Knowledge Base for current LA County market data, government resources from HUD and CFPB, and educational materials on real estate trends. I can also connect you to live market data via our MCP integrations.";
    } else if (input.includes('contract')) {
      return "We have professional contract generators for both Wholesale and Fix-and-Flip deals. They include all necessary clauses and can be downloaded as PDFs. Navigate to Contracts in the main menu to get started!";
    } else if (input.includes('calculator')) {
      return "We have 12 professional calculators: Flip Analysis, Rental Income (Basic & Full), Amortization, Professional Underwriting, Portfolio Analysis, Repair Estimates, Flip vs Rent Comparison, ROI, Cap Rate, Cash-on-Cash, and DSCR. Which would you like to explore?";
    } else {
      return "I'm here to help with real estate investing, foreclosure prevention, property analysis, and more. You can ask about our calculators, contract templates, educational resources, or get specific guidance on your situation. What would you like to know?";
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center z-[9999] group"
            style={{ position: 'fixed', bottom: '24px', right: '24px' }}
          >
            <MessageCircle className="w-8 h-8" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
              <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                Chat with AI Assistant
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed ${
              isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'
            } w-96 bg-white rounded-2xl shadow-2xl z-[9999] border border-gray-200 flex flex-col`}
            style={{ 
              maxHeight: isMinimized ? '60px' : '600px', 
              height: isMinimized ? '60px' : '600px',
              position: 'fixed',
              bottom: '24px',
              right: '24px'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Assistant</h3>
                  <p className="text-xs text-purple-100 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    Online & Ready
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/30 to-white">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-purple-200' : 'text-gray-400'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Quick Actions */}
                {messages.length === 1 && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action.label)}
                          className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg text-sm font-medium text-purple-700 hover:from-purple-100 hover:to-indigo-100 transition-all"
                        >
                          <span>{action.icon}</span>
                          <span className="text-xs">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(inputValue);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask me anything..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Powered by AI • Always here to help
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAIChat;
