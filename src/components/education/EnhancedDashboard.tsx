import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

// Import your existing education components and enhance them
const EnhancedEducationDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    certificates: 0,
    learningTime: 0,
  });

  useEffect(() => {
    loadEducationStats();
  }, []);

  const loadEducationStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load user's education progress
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      // Calculate stats from your existing data
      setStats({
        totalCourses: progress?.length || 0,
        completedCourses: progress?.filter((p) => p.completed_at).length || 0,
        certificates: 0, // From your certificates table
        learningTime:
          progress?.reduce((acc, p) => acc + (p.watch_time || 0), 0) || 0,
      });
    } catch (error) {
      console.error("Error loading education stats:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Enhanced header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎓 Enhanced Education Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Your learning journey with AI-powered assistance and advanced
          analytics
        </p>
      </div>

      {/* Stats Grid - Enhanced version */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCourses}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completedCourses}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🏆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Certificates</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.certificates}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">⏱️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Learning Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.floor(stats.learningTime / 3600)}h{" "}
                {Math.floor((stats.learningTime % 3600) / 60)}m
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced features - integrating with your existing components */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            🚀 Quick Actions
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <motion.button
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                (window.location.href = "/foreclosure-questionnaire")
              }
            >
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold text-blue-900">
                Take Questionnaire
              </h3>
              <p className="text-sm text-blue-700">
                Get personalized help recommendations
              </p>
            </motion.button>

            <motion.button
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">🎥</div>
              <h3 className="font-semibold text-green-900">Watch Videos</h3>
              <p className="text-sm text-green-700">
                Continue your video learning
              </p>
            </motion.button>

            <motion.button
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-semibold text-purple-900">AI Assistant</h3>
              <p className="text-sm text-purple-700">
                Get instant help and answers
              </p>
            </motion.button>

            <motion.button
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-orange-900">View Analytics</h3>
              <p className="text-sm text-orange-700">
                Track your learning progress
              </p>
            </motion.button>
          </div>
        </div>

        {/* AI Assistant Preview */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">🤖 AI Assistant Ready</h2>

          <div className="space-y-3">
            <div className="bg-white bg-opacity-20 rounded p-3">
              <p className="text-sm">
                "I can help you understand foreclosure notices, explain legal
                terms, and guide you through the process 24/7."
              </p>
            </div>

            <div className="bg-white bg-opacity-20 rounded p-3">
              <p className="text-sm">
                "Ask me anything about your mortgage, timeline, or options
                available to save your home."
              </p>
            </div>
          </div>

          <button className="mt-4 w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Start Chatting
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEducationDashboard;
