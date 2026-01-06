import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

interface NavigationEnhancementProps {
  user: any;
  existingNavigation?: React.ComponentType<any>; // Your existing Navigation component
}

const NavigationEnhancement: React.FC<NavigationEnhancementProps> = ({
  user,
  existingNavigation: ExistingNav,
}) => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProgress, setUserProgress] = useState({
    completedCourses: 0,
    certificates: 0,
    questionnairesCompleted: 0,
  });

  useEffect(() => {
    if (user) {
      loadUserNotifications();
      loadUserProgress();
    }
  }, [user]);

  const loadUserNotifications = async () => {
    try {
      // Enhanced notifications system
      const notifications = [
        {
          id: 1,
          type: "urgent",
          title: "Foreclosure Deadline Approaching",
          message: "You have 15 days left to respond to your Notice of Default",
          timestamp: new Date(),
          action: "/foreclosure-help",
        },
        {
          id: 2,
          type: "education",
          title: "New Course Available",
          message: "Credit Repair Fundamentals - Start your financial recovery",
          timestamp: new Date(Date.now() - 86400000),
          action: "/education",
        },
      ];
      setNotifications(notifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const [coursesData, certificatesData, questionnairesData] =
        await Promise.all([
          supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", user.id)
            .not("completed_at", "is", null),
          supabase.from("certificates").select("*").eq("user_id", user.id),
          supabase
            .from("foreclosure_responses")
            .select("*")
            .eq("user_id", user.id),
        ]);

      setUserProgress({
        completedCourses: coursesData.data?.length || 0,
        certificates: certificatesData.data?.length || 0,
        questionnairesCompleted: questionnairesData.data?.length || 0,
      });
    } catch (error) {
      console.error("Error loading user progress:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return "🚨";
      case "education":
        return "🎓";
      case "marketing":
        return "📬";
      default:
        return "📢";
    }
  };

  // Enhanced navigation items with smart badges
  const enhancedNavItems = [
    {
      path: "/",
      label: "🏠 Home",
      exact: true,
    },
    {
      path: "/foreclosure-help",
      label: "🆘 Emergency Help",
      badge:
        notifications.filter((n) => n.type === "urgent").length > 0
          ? "urgent"
          : null,
      highlight: true,
    },
    {
      path: "/foreclosure-questionnaire",
      label: "📝 Assessment",
      badge: userProgress.questionnairesCompleted === 0 ? "new" : null,
    },
    {
      path: "/education",
      label: "🎓 Education",
      badge:
        userProgress.completedCourses > 0
          ? userProgress.certificates.toString()
          : null,
      submenu: [
        { path: "/education", label: "📚 Course Library" },
        { path: "/education/dashboard", label: "📊 My Dashboard" },
        { path: "/education/analytics", label: "📈 Progress Analytics" },
      ],
    },
  ];

  return (
    <div className="navigation-enhancement">
      {/* Smart Notification Bar */}
      {notifications.some((n) => n.type === "urgent") && (
        <motion.div
          className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🚨 URGENT: You have critical foreclosure deadlines approaching.
          <Link
            to="/foreclosure-help"
            className="underline ml-2 hover:text-red-200"
          >
            Get Help Now →
          </Link>
        </motion.div>
      )}

      {/* Enhanced Navigation Bar */}
      <nav className="bg-white shadow-lg relative z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Enhanced Logo with User Progress */}
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-3xl">🏠</span>
              <div>
                <span className="font-bold text-xl text-gray-900">
                  RepMotivatedSeller
                </span>
                {user && userProgress.certificates > 0 && (
                  <div className="flex items-center space-x-1 -mt-1">
                    <span className="text-xs text-yellow-600">🏆</span>
                    <span className="text-xs text-gray-500">
                      {userProgress.certificates} certificates
                    </span>
                  </div>
                )}
              </div>
            </Link>

            {/* Enhanced Navigation Items */}
            <div className="hidden lg:flex items-center space-x-1">
              {enhancedNavItems.map((item, index) => (
                <div key={index} className="relative group">
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                      (
                        item.exact
                          ? location.pathname === item.path
                          : location.pathname.startsWith(item.path)
                      )
                        ? "bg-blue-100 text-blue-700"
                        : item.highlight
                          ? "bg-red-600 text-white hover:bg-red-700 animate-pulse"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}

                    {/* Smart Badges */}
                    {item.badge && (
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                          item.badge === "urgent"
                            ? "bg-red-500 text-white animate-pulse"
                            : item.badge === "new"
                              ? "bg-green-500 text-white"
                              : "bg-yellow-500 text-white"
                        }`}
                      >
                        {item.badge === "urgent"
                          ? "!"
                          : item.badge === "new"
                            ? "NEW"
                            : item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Enhanced Submenu */}
                  {item.submenu && (
                    <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        {item.submenu.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                          >
                            {subItem.label}
                          </Link>
                        ))}

                        {/* Progress Summary in Education Submenu */}
                        {item.path === "/education" && user && (
                          <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                            <div className="text-xs text-gray-500 space-y-1">
                              <div className="flex justify-between">
                                <span>Courses Completed:</span>
                                <span className="font-medium">
                                  {userProgress.completedCourses}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Certificates Earned:</span>
                                <span className="font-medium">
                                  {userProgress.certificates}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Notifications Bell */}
              {user && notifications.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
                  >
                    <span className="text-xl">🔔</span>
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      >
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900">
                            Notifications
                          </h3>
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map((notification) => (
                            <Link
                              key={notification.id}
                              to={notification.action}
                              className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              onClick={() => setShowNotifications(false)}
                            >
                              <div className="flex items-start space-x-3">
                                <span className="text-lg">
                                  {getNotificationIcon(notification.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </h4>
                                  <p className="text-gray-600 text-xs mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {notification.timestamp.toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Enhanced User Menu */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden xl:block">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email?.split("@")[0]}
                      </div>
                      <div className="text-xs text-gray-500">
                        {userProgress.certificates > 0
                          ? `${userProgress.certificates} certificates`
                          : "Getting started"}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          Progress: {userProgress.completedCourses} courses,{" "}
                          {userProgress.certificates} certificates
                        </div>
                      </div>

                      <Link
                        to="/education/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        📊 My Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        👤 Profile Settings
                      </Link>
                      <Link
                        to="/subscription"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        💳 Subscription
                      </Link>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => supabase.auth.signOut()}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/auth"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button className="text-gray-600 hover:text-gray-800 p-2">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavigationEnhancement;
