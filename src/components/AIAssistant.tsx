/**
 * AI Assistant with Knowledge Base + Dappier Integration
 * Searches KB first, then enhances with real-time Dappier data
 */

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Loader, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { dappierService } from '../services/dappierService';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasRealTimeData?: boolean;
  hasKBData?: boolean;
  kbArticles?: Array<{ id: string; title: string }>;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hi! I'm your AI assistant with access to our Knowledge Base AND real-time market data. I can help with foreclosure prevention, property analysis, credit repair, DSCR loans, and more. Ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userTier, setUserTier] = useState<'basic' | 'premium' | 'elite'>('basic');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserTier();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUserTier = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Prefer explicit user_tiers table
      const { data: tierData } = await supabase
        .from('user_tiers')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      if (tierData?.tier) {
        setUserTier(tierData.tier);
        return;
      }

      // Fallbacks for older schemas
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single();

      if (profile?.tier) {
        setUserTier(profile.tier);
        return;
      }

      const { data: userRecord } = await supabase
        .from('users')
        .select('tier')
        .eq('id', user.id)
        .single();

      if (userRecord?.tier) {
        setUserTier(userRecord.tier);
      }
    } catch (error) {
      console.error('Error fetching user tier:', error);
    }
  };

  const processMessage = async (
    userMessage: string,
  ): Promise<{
    response: string;
    kbArticles: Array<{ id: string; title: string }>;
    hasRealTime: boolean;
    hasKB: boolean;
  }> => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let kbArticles: Array<{ id: string; title: string }> = [];
    let hasRealTime = false;
    let hasKB = false;

    // STEP 1: Search Knowledge Base first
    try {
      const kbResults = await knowledgeBaseService.searchArticles(userMessage, userTier);

      if (kbResults.hasResults && kbResults.articles.length > 0) {
        hasKB = true;
        const topArticle = kbResults.articles[0];
        kbArticles = kbResults.articles.slice(0, 3).map((a) => ({ id: a.id, title: a.title }));

        const contentPreview =
          topArticle.excerpt || topArticle.content?.substring(0, 300)?.replace(/#+/g, '').trim() || '';

        response = `📚 **From our Knowledge Base:**\n\n${contentPreview}`;

        if (kbResults.articles.length > 1) {
          response += `\n\n**Related Articles:**\n`;
          kbResults.articles.slice(0, 3).forEach((article, idx) => {
            response += `${idx + 1}. ${article.title}\n`;
          });
          response += `\nVisit the Knowledge Base page to read full articles!`;
        }
      }
    } catch (error) {
      console.error('Knowledge Base search error:', error);
    }

    // STEP 2: Check if real-time data is needed
    const needsRealTimeData =
      lowerMessage.includes('market') ||
      lowerMessage.includes('rate') ||
      lowerMessage.includes('current') ||
      lowerMessage.includes('price') ||
      lowerMessage.includes('trend');

    if (needsRealTimeData && dappierService.isConfigured()) {
      try {
        const realTimeData = await dappierService.enhanceWithRealTimeData(userMessage);
        if (realTimeData) {
          hasRealTime = true;
          response += response ? `\n\n${realTimeData}` : realTimeData;
        }
      } catch (error) {
        console.error('Real-time data error:', error);
      }
    }

    // STEP 3: Add contextual guidance if no KB results
    if (!hasKB) {
      if (lowerMessage.includes('roi') || lowerMessage.includes('return on investment')) {
        response =
          '💡 **ROI (Return on Investment):**\n\n' +
          'ROI shows how much profit you make compared to your investment.\n\n' +
          '**Formula:** (Profit - Cost) ÷ Cost × 100%\n\n' +
          'Our calculators show:\n' +
          '• Cash-on-Cash Return\n' +
          '• Total ROI\n' +
          '• Cap Rate\n' +
          '• DSCR\n\n' +
          'Visit our Knowledge Base for detailed ROI guides!';
      } else if (lowerMessage.includes('1%') || lowerMessage.includes('one percent')) {
        response =
          '📊 **The 1% Rule:**\n\n' +
          'Monthly rent should be ≥1% of purchase price\n\n' +
          'Example: $200K property needs $2,000/mo rent\n\n' +
          'Use our Rental Analyzer to check any property!\n\n' +
          'Check Knowledge Base for complete 1% Rule guide.';
      } else if (lowerMessage.includes('dscr')) {
        response =
          '🏦 **DSCR (Debt Service Coverage Ratio):**\n\n' +
          'Formula: NOI ÷ Annual Debt Payment\n\n' +
          'Lender Requirements:\n' +
          '• 1.25x = Excellent\n' +
          '• 1.0-1.24x = Acceptable\n' +
          '<1.0x = Rejected\n\n' +
          'See Knowledge Base for DSCR loan details!';
      } else if (lowerMessage.includes('calculator')) {
        response =
          '🧮 **Our Calculators:**\n\n' +
          '• Rental Analyzer (Basic & Full)\n' +
          '• Fix & Flip Analyzer\n' +
          '• ROI Calculator\n' +
          '• DSCR Calculator\n' +
          '• 1% Rule Checker\n\n' +
          'All calculators integrate with Knowledge Base articles!';
      } else {
        response =
          'I can help you with:\n\n' +
          '🏠 **Foreclosure Prevention** - Stop foreclosure\n' +
          '💳 **Credit Repair** - Improve credit scores\n' +
          '📊 **Property Analysis** - ROI, DSCR, 1% Rule\n' +
          '💰 **Financing** - DSCR loans, private money\n' +
          '📬 **Direct Mail** - Send campaigns\n' +
          '📚 **Knowledge Base** - 100+ educational articles\n\n' +
          'What would you like to learn about?';
      }
    }

    // STEP 4: Log conversation for analytics
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await knowledgeBaseService.logAIConversation(
          user.id,
          userMessage,
          response,
          kbArticles.map((a) => a.id),
        );
      }
    } catch (error) {
      console.error('Error logging conversation:', error);
    }

    return { response, kbArticles, hasRealTime, hasKB };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await processMessage(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        hasRealTimeData: aiResponse.hasRealTime,
        hasKBData: aiResponse.hasKB,
        kbArticles: aiResponse.kbArticles,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'DSCR Calculator', query: 'How do I calculate DSCR?' },
    { label: '1% Rule', query: 'What is the 1% rule?' },
    { label: 'Stop Foreclosure', query: 'How can I stop foreclosure?' },
    { label: 'Credit Repair', query: 'How do I repair my credit?' },
  ];

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg z-50 hover:shadow-xl transition-shadow"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-96 max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-semibold">AI Assistant</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    KB
                  </span>
                  {dappierService.isConfigured() && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Live Data</span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    {(message.hasRealTimeData || message.hasKBData) && (
                      <div className="mt-2 text-xs opacity-75 flex items-center gap-2">
                        {message.hasKBData && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Knowledge Base
                          </span>
                        )}
                        {message.hasRealTimeData && <span>✓ Real-time data</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <Loader className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <div className="text-xs text-gray-500 mb-2">Quick actions:</div>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(action.query);
                        setTimeout(() => handleSend(), 100);
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
