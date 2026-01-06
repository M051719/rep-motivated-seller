import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Send, Sparkles, Loader2, Calculator, FileText, Home, TrendingUp } from "lucide-react";
import { dappierService } from '../services/dappierService';


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tool_calls?: Array<{
    name: string;
    result: any;
  }>;
}

interface SuggestedQuestion {
  text: string;
  icon: React.ReactNode;
  category: string;
}

const suggestedQuestions: SuggestedQuestion[] = [
  {
    text: "How much time do I have before foreclosure?",
    icon: <Home className="w-4 h-4" />,
    category: "Timeline"
  },
  {
    text: "Calculate my monthly savings options",
    icon: <Calculator className="w-4 h-4" />,
    category: "Finance"
  },
  {
    text: "What's the difference between short sale and foreclosure?",
    icon: <FileText className="w-4 h-4" />,
    category: "Options"
  },
  {
    text: "Analyze my property value and equity",
    icon: <TrendingUp className="w-4 h-4" />,
    category: "Property"
  }
];

export default function AIChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      // Get the most recent session
      const { data: session, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (sessionError && sessionError.code !== "PGRST116") {
        console.error("Error loading session:", sessionError);
        return;
      }

      if (session) {
        setSessionId(session.id);

        // Load messages from this session
        const { data: messagesData, error: messagesError } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", session.id)
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error("Error loading messages:", messagesError);
          return;
        }

        if (messagesData) {
          setMessages(
            messagesData.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.created_at),
              tool_calls: msg.tool_calls || undefined
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const createNewSession = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title: "New Chat"
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;
    if (!user) {
      alert("Please sign in to use the AI assistant");
      return;
    }

    // Clear input
    setInput("");

    // Add user message to UI
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create session if needed
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await createNewSession();
        if (!currentSessionId) {
          throw new Error("Failed to create chat session");
        }
        setSessionId(currentSessionId);
      }

      // Call AI chat function
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: textToSend,
          session_id: currentSessionId,
          user_id: user.id
        }
      });

      if (error) throw error;

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: data.message_id || `temp-${Date.now()}-assistant`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        tool_calls: data.tool_calls
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const startNewChat = async () => {
    setMessages([]);
    setSessionId(null);
    const newSessionId = await createNewSession();
    setSessionId(newSessionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Foreclosure Assistant
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get instant answers about foreclosure timelines, options, and calculations. 
            Powered by advanced AI with access to your property data and tools.
          </p>
          {messages.length > 0 && (
            <button
              onClick={startNewChat}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Start New Chat
            </button>
          )}
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Sparkles className="w-16 h-16 text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  How can I help you today?
                </h3>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                  Ask me anything about foreclosure, your property, financial options, or use the suggested questions below.
                </p>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {suggestedQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSuggestedQuestion(question.text)}
                      className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 transition-colors">
                        {question.icon}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">{question.category}</div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                          {question.text}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* Tool Calls Display */}
                      {message.tool_calls && message.tool_calls.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                          {message.tool_calls.map((tool, idx) => (
                            <div key={idx} className="text-xs bg-white/50 rounded-lg p-2">
                              <div className="font-semibold mb-1 flex items-center gap-1">
                                <Calculator className="w-3 h-3" />
                                Used: {tool.name}
                              </div>
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(tool.result, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-xs mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about foreclosure, your options, or calculations..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI responses are informational. For legal advice, consult a professional.
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <Calculator className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold mb-1">Smart Calculations</h3>
            <p className="text-sm text-gray-600">
              Instant mortgage, equity, and savings calculations
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold mb-1">Document Analysis</h3>
            <p className="text-sm text-gray-600">
              Upload and analyze foreclosure notices
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold mb-1">Property Insights</h3>
            <p className="text-sm text-gray-600">
              Get market data and equity analysis
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
