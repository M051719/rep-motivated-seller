import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";

interface SMSMessage {
  id: string;
  phone_number: string;
  message_body: string;
  direction: "inbound" | "outbound";
  status: string;
  created_at: string;
  message_sid?: string;
}

interface SMSConversation {
  id: string;
  phone_number: string;
  contact_name?: string;
  contact_type:
    | "real_estate_professional"
    | "investor"
    | "prospect"
    | "client"
    | "unknown";
  status: "new" | "active" | "pending" | "resolved" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  category?: string;
  message_count: number;
  unread_count: number;
  last_message_at?: string;
  last_message_preview?: string;
  last_message_direction?: "inbound" | "outbound";
  ai_sentiment?: string;
  keywords?: string[];
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface QuickReply {
  id: string;
  title: string;
  message_template: string;
  category?: string;
}

const AdminSMSDashboard = () => {
  const [conversations, setConversations] = useState<SMSConversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<SMSConversation | null>(null);
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterContactType, setFilterContactType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load conversations
  useEffect(() => {
    loadConversations();
    loadQuickReplies();

    // Set up realtime subscription
    const channel = supabase
      .channel("sms_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sms_conversations" },
        (payload) => {
          console.log("Conversation update:", payload);
          loadConversations();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sms_message_log" },
        (payload) => {
          console.log("New message:", payload);
          if (selectedConversation) {
            loadMessages(selectedConversation.phone_number);
          }
          loadConversations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      let query = supabase
        .from("sms_conversations")
        .select("*")
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      // Apply filters
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }
      if (filterContactType !== "all") {
        query = query.eq("contact_type", filterContactType);
      }
      if (searchQuery) {
        query = query.or(
          `phone_number.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (phoneNumber: string) => {
    try {
      const { data, error } = await supabase
        .from("sms_message_log")
        .select("*")
        .eq("phone_number", phoneNumber)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark as read
      if (selectedConversation) {
        await supabase.rpc("mark_conversation_read", {
          p_conversation_id: selectedConversation.id,
        });
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const loadQuickReplies = async () => {
    try {
      const { data, error } = await supabase
        .from("sms_quick_replies")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setQuickReplies(data || []);
    } catch (error) {
      console.error("Error loading quick replies:", error);
    }
  };

  const selectConversation = async (conversation: SMSConversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.phone_number);
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    setSending(true);
    try {
      // Call Twilio via Edge Function to send SMS
      const { data, error } = await supabase.functions.invoke("sms-handler", {
        body: {
          action: "send",
          to: selectedConversation.phone_number,
          message: newMessage,
        },
      });

      if (error) throw error;

      toast.success("Message sent successfully");
      setNewMessage("");
      await loadMessages(selectedConversation.phone_number);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const updateConversation = async (updates: Partial<SMSConversation>) => {
    if (!selectedConversation) return;

    try {
      const { error } = await supabase
        .from("sms_conversations")
        .update(updates)
        .eq("id", selectedConversation.id);

      if (error) throw error;

      toast.success("Conversation updated");
      setSelectedConversation({ ...selectedConversation, ...updates });
      loadConversations();
    } catch (error) {
      console.error("Error updating conversation:", error);
      toast.error("Failed to update conversation");
    }
  };

  const useQuickReply = (reply: QuickReply) => {
    let message = reply.message_template;

    // Replace variables
    if (selectedConversation) {
      message = message.replace("{phone}", selectedConversation.phone_number);
      message = message.replace(
        "{name}",
        selectedConversation.contact_name || "there",
      );
    }

    setNewMessage(message);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 font-bold";
      case "high":
        return "text-orange-600 font-semibold";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case "real_estate_professional":
        return "🏢";
      case "investor":
        return "💼";
      case "prospect":
        return "🏠";
      case "client":
        return "⭐";
      default:
        return "❓";
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getTotalUnread = () => {
    return conversations.reduce((sum, conv) => sum + conv.unread_count, 0);
  };

  return (
    <>
      <Helmet>
        <title>SMS Dashboard - Admin | RepMotivatedSeller</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          <BackButton />
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              SMS Monitoring Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor and respond to SMS conversations • {getTotalUnread()}{" "}
              unread messages
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search phone or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={() => loadConversations()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    loadConversations();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <select
                  value={filterContactType}
                  onChange={(e) => {
                    setFilterContactType(e.target.value);
                    loadConversations();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Contact Types</option>
                  <option value="real_estate_professional">
                    Real Estate Professionals
                  </option>
                  <option value="investor">Investors</option>
                  <option value="prospect">Prospects (Foreclosure)</option>
                  <option value="client">Clients</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <button
                  onClick={loadConversations}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Conversations ({conversations.length})
                  </h2>
                </div>
                <div
                  className="overflow-y-auto"
                  style={{ maxHeight: "calc(100vh - 300px)" }}
                >
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No conversations found
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <motion.div
                        key={conv.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conv.id
                            ? "bg-blue-50 border-l-4 border-l-blue-600"
                            : ""
                        }`}
                        onClick={() => selectConversation(conv)}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">
                              {getContactTypeIcon(conv.contact_type)}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {conv.contact_name ||
                                  formatPhoneNumber(conv.phone_number)}
                              </p>
                              {conv.contact_name && (
                                <p className="text-xs text-gray-500">
                                  {formatPhoneNumber(conv.phone_number)}
                                </p>
                              )}
                            </div>
                          </div>
                          {conv.unread_count > 0 && (
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {conv.last_message_preview || "No messages"}
                        </p>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full ${getStatusColor(conv.status)}`}
                            >
                              {conv.status}
                            </span>
                            <span className={getPriorityColor(conv.priority)}>
                              {conv.priority}
                            </span>
                          </div>
                          <span className="text-gray-500">
                            {conv.last_message_at
                              ? formatTimestamp(conv.last_message_at)
                              : formatTimestamp(conv.created_at)}
                          </span>
                        </div>

                        {conv.keywords && conv.keywords.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {conv.keywords.slice(0, 3).map((keyword, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Conversation Detail */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {selectedConversation.contact_name ||
                            formatPhoneNumber(
                              selectedConversation.phone_number,
                            )}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {getContactTypeIcon(
                            selectedConversation.contact_type,
                          )}{" "}
                          {selectedConversation.contact_type.replace(/_/g, " ")}{" "}
                          • {selectedConversation.message_count} messages
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={`tel:${selectedConversation.phone_number}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          📞 Call
                        </a>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <select
                        value={selectedConversation.status}
                        onChange={(e) =>
                          updateConversation({ status: e.target.value as any })
                        }
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="new">New</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>

                      <select
                        value={selectedConversation.priority}
                        onChange={(e) =>
                          updateConversation({
                            priority: e.target.value as any,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>

                      <select
                        value={selectedConversation.contact_type}
                        onChange={(e) =>
                          updateConversation({
                            contact_type: e.target.value as any,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="unknown">Unknown</option>
                        <option value="real_estate_professional">
                          Professional
                        </option>
                        <option value="investor">Investor</option>
                        <option value="prospect">Prospect</option>
                        <option value="client">Client</option>
                      </select>

                      <select
                        value={selectedConversation.category || ""}
                        onChange={(e) =>
                          updateConversation({ category: e.target.value })
                        }
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="">No Category</option>
                        <option value="foreclosure_assistance">
                          Foreclosure Help
                        </option>
                        <option value="loan_application">Loan Inquiry</option>
                        <option value="membership_question">Membership</option>
                        <option value="general_inquiry">General</option>
                        <option value="complaint">Complaint</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    style={{ maxHeight: "calc(100vh - 500px)" }}
                  >
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.direction === "outbound"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {msg.message_body}
                          </p>
                          <p
                            className={`text-xs mt-1 ${msg.direction === "outbound" ? "text-blue-100" : "text-gray-600"}`}
                          >
                            {new Date(msg.created_at).toLocaleString()}
                            {msg.status && ` • ${msg.status}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Replies */}
                  {quickReplies.length > 0 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Quick Replies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply) => (
                          <button
                            key={reply.id}
                            onClick={() => useQuickReply(reply)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                          >
                            {reply.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {sending ? "Sending..." : "Send"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-6xl mb-4">💬</p>
                    <p className="text-xl font-semibold">
                      Select a conversation
                    </p>
                    <p className="text-sm">
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSMSDashboard;
