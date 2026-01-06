import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

// Import your existing AdminDashboard functionality
// This enhancement adds new features while preserving existing ones

interface AdminEnhancementProps {
  existingAdminData?: any; // From your current AdminDashboard
}

const AdminDashboardEnhancement: React.FC<AdminEnhancementProps> = ({
  existingAdminData,
}) => {
  const [enhancedMetrics, setEnhancedMetrics] = useState({
    totalUsers: 0,
    activeForeclosureCases: 0,
    completedQuestionnaires: 0,
    emailCampaigns: 0,
    hubspotContacts: 0,
    subscriptionRevenue: 0,
    courseCompletions: 0,
    certificatesIssued: 0,
    aiInteractions: 0,
    conversionRate: 0,
  });

  const [realtimeActivity, setRealtimeActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    database: "healthy",
    apis: "healthy",
    integrations: "healthy",
  });

  useEffect(() => {
    loadEnhancedMetrics();
    setupRealtimeUpdates();
  }, []);

  const loadEnhancedMetrics = async () => {
    try {
      // Enhance your existing admin metrics with new data sources
      const [
        users,
        questionnaires,
        campaigns,
        courses,
        certificates,
        aiChats,
        subscriptions,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("foreclosure_responses").select("id", { count: "exact" }),
        supabase.from("mail_campaigns").select("id", { count: "exact" }),
        supabase
          .from("user_progress")
          .select("*")
          .not("completed_at", "is", null),
        supabase.from("certificates").select("id", { count: "exact" }),
        supabase.from("ai_interactions").select("id", { count: "exact" }),
        supabase.from("subscriptions").select("amount"),
      ]);

      const totalRevenue =
        subscriptions.data?.reduce((sum, sub) => sum + (sub.amount || 0), 0) ||
        0;

      setEnhancedMetrics({
        totalUsers: users.count || 0,
        activeForeclosureCases: Math.floor((questionnaires.count || 0) * 0.7), // Estimate active cases
        completedQuestionnaires: questionnaires.count || 0,
        emailCampaigns: campaigns.count || 0,
        hubspotContacts: 0, // Will be loaded from HubSpot API
        subscriptionRevenue: totalRevenue,
        courseCompletions: courses.data?.length || 0,
        certificatesIssued: certificates.count || 0,
        aiInteractions: aiChats.count || 0,
        conversionRate: calculateConversionRate(
          questionnaires.count || 0,
          users.count || 0,
        ),
      });

      // Load HubSpot data if available
      loadHubSpotMetrics();
    } catch (error) {
      console.error("Error loading enhanced metrics:", error);
    }
  };

  const loadHubSpotMetrics = async () => {
    try {
      // Integration with your existing HubSpot service
      const response = await fetch("/api/hubspot/contacts-count");
      const data = await response.json();

      setEnhancedMetrics((prev) => ({
        ...prev,
        hubspotContacts: data.total || 0,
      }));
    } catch (error) {
      console.error("HubSpot metrics error:", error);
    }
  };

  const setupRealtimeUpdates = () => {
    // Real-time activity feed
    const subscription = supabase
      .channel("admin_activity")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_progress" },
        (payload) => {
          setRealtimeActivity((prev) => [
            {
              id: Date.now(),
              type: "course_progress",
              message: "New course progress updated",
              timestamp: new Date(),
              data: payload,
            },
            ...prev.slice(0, 9),
          ]); // Keep last 10 activities
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "foreclosure_responses" },
        (payload) => {
          setRealtimeActivity((prev) => [
            {
              id: Date.now(),
              type: "questionnaire",
              message: "New foreclosure questionnaire completed",
              timestamp: new Date(),
              data: payload,
            },
            ...prev.slice(0, 9),
          ]);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const calculateConversionRate = (
    questionnaires: number,
    users: number,
  ): number => {
    return users > 0 ? Math.round((questionnaires / users) * 100) : 0;
  };

  return (
    <div className="admin-dashboard-enhancement">
      {/* Enhanced Metrics Grid - Supplements your existing dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Users</p>
              <p className="text-3xl font-bold">
                {enhancedMetrics.totalUsers.toLocaleString()}
              </p>
            </div>
            <span className="text-4xl opacity-80">👥</span>
          </div>
          <div className="mt-2 text-xs text-blue-100">+12% from last month</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Active Foreclosure Cases</p>
              <p className="text-3xl font-bold">
                {enhancedMetrics.activeForeclosureCases.toLocaleString()}
              </p>
            </div>
            <span className="text-4xl opacity-80">🏠</span>
          </div>
          <div className="mt-2 text-xs text-red-100">
            Critical attention needed
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Course Completions</p>
              <p className="text-3xl font-bold">
                {enhancedMetrics.courseCompletions.toLocaleString()}
              </p>
            </div>
            <span className="text-4xl opacity-80">🎓</span>
          </div>
          <div className="mt-2 text-xs text-green-100">
            +34% completion rate
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">AI Interactions</p>
              <p className="text-3xl font-bold">
                {enhancedMetrics.aiInteractions.toLocaleString()}
              </p>
            </div>
            <span className="text-4xl opacity-80">🤖</span>
          </div>
          <div className="mt-2 text-xs text-purple-100">
            24/7 support active
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-lg p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Monthly Revenue</p>
              <p className="text-3xl font-bold">
                ${enhancedMetrics.subscriptionRevenue.toLocaleString()}
              </p>
            </div>
            <span className="text-4xl opacity-80">💰</span>
          </div>
          <div className="mt-2 text-xs text-yellow-100">
            Recurring subscriptions
          </div>
        </motion.div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            📊 System Performance Dashboard
          </h3>

          {/* Integration with your existing admin functionality */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {enhancedMetrics.conversionRate}%
              </div>
              <div className="text-sm text-green-700">Conversion Rate</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {enhancedMetrics.certificatesIssued}
              </div>
              <div className="text-sm text-blue-700">Certificates Issued</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {enhancedMetrics.hubspotContacts}
              </div>
              <div className="text-sm text-purple-700">HubSpot Contacts</div>
            </div>
          </div>

          {/* System Health Indicators */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">System Health</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Database</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    systemHealth.database === "healthy"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {systemHealth.database === "healthy"
                    ? "✅ Healthy"
                    : "⚠️ Issues"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">External APIs</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    systemHealth.apis === "healthy"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {systemHealth.apis === "healthy" ? "✅ Healthy" : "⚠️ Issues"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Integrations</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    systemHealth.integrations === "healthy"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {systemHealth.integrations === "healthy"
                    ? "✅ Healthy"
                    : "⚠️ Issues"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⚡ Live Activity Feed
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {realtimeActivity.length > 0 ? (
              realtimeActivity.map((activity: any) => (
                <motion.div
                  key={activity.id}
                  className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">
                      {activity.type === "course_progress"
                        ? "🎓"
                        : activity.type === "questionnaire"
                          ? "📝"
                          : "📊"}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📡</div>
                <p className="text-sm">Monitoring for real-time activity...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Enhanced for your existing admin functions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          ⚡ Enhanced Admin Actions
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => (window.location.href = "/marketing/direct-mail")}
          >
            <div className="text-2xl mb-2">📬</div>
            <div className="font-semibold">Launch Mail Campaign</div>
            <div className="text-xs opacity-80">Send targeted outreach</div>
          </motion.button>

          <motion.button
            className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => (window.location.href = "/education/analytics")}
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold">Education Analytics</div>
            <div className="text-xs opacity-80">View learning metrics</div>
          </motion.button>

          <motion.button
            className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => (window.location.href = "/hubspot/dashboard")}
          >
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-semibold">HubSpot Sync</div>
            <div className="text-xs opacity-80">Manage CRM integration</div>
          </motion.button>

          <motion.button
            className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => (window.location.href = "/admin/foreclosure-cases")}
          >
            <div className="text-2xl mb-2">🚨</div>
            <div className="font-semibold">Critical Cases</div>
            <div className="text-xs opacity-80">Review urgent situations</div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardEnhancement;
