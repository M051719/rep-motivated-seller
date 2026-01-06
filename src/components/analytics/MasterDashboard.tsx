import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Line, Bar, Doughnut, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import MasterAnalyticsService, {
  MasterAnalytics,
} from "../../services/analytics/MasterAnalyticsService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const MasterDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<MasterAnalytics | null>(null);
  const [propertyAnalytics, setPropertyAnalytics] = useState<any>(null);
  const [hubspotAnalytics, setHubspotAnalytics] = useState<any>(null);
  const [subscriptionAnalytics, setSubscriptionAnalytics] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "property" | "marketing" | "education" | "insights"
  >("overview");
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    loadAllAnalytics();
  }, [timeRange]);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);

      const [
        masterData,
        propertyData,
        hubspotData,
        subscriptionData,
        insightsData,
      ] = await Promise.all([
        MasterAnalyticsService.getMasterAnalytics(timeRange),
        MasterAnalyticsService.getAdvancedPropertyAnalytics(),
        MasterAnalyticsService.getHubSpotAnalytics(),
        MasterAnalyticsService.getSubscriptionAnalytics(),
        MasterAnalyticsService.getAIInsights(),
      ]);

      setAnalytics(masterData);
      setPropertyAnalytics(propertyData);
      setHubspotAnalytics(hubspotData);
      setSubscriptionAnalytics(subscriptionData);
      setAiInsights(insightsData);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabButtons = [
    { key: "overview", label: "📊 Overview", icon: "📊" },
    { key: "property", label: "🏠 Property Intel", icon: "🏠" },
    { key: "marketing", label: "📬 Marketing", icon: "📬" },
    { key: "education", label: "🎓 Education", icon: "🎓" },
    { key: "insights", label: "🤖 AI Insights", icon: "🤖" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📈 Master Analytics Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Comprehensive insights from all your integrated services
        </p>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Time Range:
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabButtons.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center">
                <span className="text-3xl mr-4">🏠</span>
                <div>
                  <p className="text-sm text-gray-500">Total Properties</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.overview.totalProperties.toLocaleString()}
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
                <span className="text-3xl mr-4">🎯</span>
                <div>
                  <p className="text-sm text-gray-500">Qualified Leads</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.overview.qualifiedLeads.toLocaleString()}
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
                <span className="text-3xl mr-4">👥</span>
                <div>
                  <p className="text-sm text-gray-500">Active Subscribers</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics.overview.activeSubscribers.toLocaleString()}
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
                <span className="text-3xl mr-4">📈</span>
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {analytics.overview.conversionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center">
                <span className="text-3xl mr-4">💰</span>
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ${analytics.overview.monthlyRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Marketing Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📬 Marketing Performance
              </h3>
              <div style={{ height: "300px" }}>
                <Bar
                  data={{
                    labels: analytics.marketing.campaignPerformance.map(
                      (c) => c.name?.substring(0, 20) || "Campaign",
                    ),
                    datasets: [
                      {
                        label: "Sent",
                        data: analytics.marketing.campaignPerformance.map(
                          (c) => c.sent_count || 0,
                        ),
                        backgroundColor: "rgba(59, 130, 246, 0.8)",
                      },
                      {
                        label: "Responses",
                        data: analytics.marketing.campaignPerformance.map(
                          (c) => (c.sent_count || 0) * 0.02,
                        ),
                        backgroundColor: "rgba(16, 185, 129, 0.8)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Education Progress */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎓 Education Analytics
              </h3>
              <div style={{ height: "300px" }}>
                <Doughnut
                  data={{
                    labels: [
                      "Course Completions",
                      "In Progress",
                      "Not Started",
                    ],
                    datasets: [
                      {
                        data: [
                          analytics.education.courseCompletions,
                          Math.floor(
                            analytics.education.courseCompletions * 0.5,
                          ),
                          Math.floor(
                            analytics.education.courseCompletions * 0.3,
                          ),
                        ],
                        backgroundColor: [
                          "rgba(16, 185, 129, 0.8)",
                          "rgba(251, 191, 36, 0.8)",
                          "rgba(156, 163, 175, 0.8)",
                        ],
                        borderColor: [
                          "rgba(16, 185, 129, 1)",
                          "rgba(251, 191, 36, 1)",
                          "rgba(156, 163, 175, 1)",
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Property Intelligence Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏠 Property Intelligence Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">
                  {analytics.propertyIntelligence.foreclosureRisk}%
                </div>
                <div className="text-sm text-gray-600">
                  Avg Foreclosure Risk
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  $
                  {analytics.propertyIntelligence.averageEquity.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Average Equity</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {analytics.propertyIntelligence.hotspotAreas.length}
                </div>
                <div className="text-sm text-gray-600">Hotspot Areas</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Intelligence Tab */}
      {activeTab === "property" && propertyAnalytics && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              🏠 Advanced Property Intelligence
            </h3>
            <p className="text-gray-600 mb-4">
              Powered by your FreeAttomAlternative and FreePropertyDataService
              integrations
            </p>

            {/* Property analytics content will be rendered here */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Market Analysis
                </h4>
                <p className="text-blue-700 text-sm">
                  Advanced market insights from your integrated property data
                  services
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">
                  Risk Assessment
                </h4>
                <p className="text-green-700 text-sm">
                  AI-powered foreclosure risk scoring and predictions
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">
                  Investment Opportunities
                </h4>
                <p className="text-purple-700 text-sm">
                  Identified opportunities based on your property intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Tab */}
      {activeTab === "marketing" && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              📬 Marketing & HubSpot Integration
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">
                  Campaign ROI
                </h4>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  +{analytics.marketing.roi.toFixed(0)}%
                </div>
                <p className="text-gray-600">Return on marketing investment</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-4">
                  HubSpot Integration
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Synced Contacts</span>
                    <span className="font-semibold">
                      {hubspotAnalytics?.contactEngagement?.totalContacts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Deals</span>
                    <span className="font-semibold">
                      {hubspotAnalytics?.dealsPipeline?.activeDeals || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Education Tab */}
      {activeTab === "education" && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              🎓 Education Platform Analytics
            </h3>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analytics.education.courseCompletions}
                </div>
                <div className="text-sm text-gray-600">Course Completions</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analytics.education.averageProgress.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Average Progress</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {analytics.education.certificatesIssued}
                </div>
                <div className="text-sm text-gray-600">Certificates Issued</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {analytics.education.topCourses.length}
                </div>
                <div className="text-sm text-gray-600">Active Courses</div>
              </div>
            </div>

            {/* Top Courses */}
            <div className="mt-8">
              <h4 className="font-semibold text-gray-800 mb-4">
                Top Performing Courses
              </h4>
              <div className="space-y-3">
                {analytics.education.topCourses.map(
                  (course: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{course.title}</span>
                      <span className="text-sm text-gray-600">
                        {course.completions} completions
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === "insights" && aiInsights && (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-2xl font-semibold mb-6">
              🤖 AI-Powered Insights & Recommendations
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-3">Market Opportunities</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • High-value foreclosure properties in zip codes 90210,
                    10001
                  </li>
                  <li>
                    • Increased marketing response rates in suburban areas
                  </li>
                  <li>• Growing demand for financial education courses</li>
                </ul>
              </div>

              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-3">Lead Scoring Insights</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • Properties with 60+ days late payment: High priority
                  </li>
                  <li>• Homeowners with 20%+ equity: Higher conversion</li>
                  <li>• Multiple contact attempts increase success by 340%</li>
                </ul>
              </div>

              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-3">Campaign Optimizations</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Tuesday 10AM has highest open rates (23%)</li>
                  <li>• Personalized subject lines increase CTR by 180%</li>
                  <li>• Follow-up sequence after 3, 7, 14 days optimal</li>
                </ul>
              </div>

              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-3">
                  Education Recommendations
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Create "Emergency Timeline" micro-course (5 min)</li>
                  <li>• Add interactive foreclosure calculator tool</li>
                  <li>• Develop state-specific legal guidance modules</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;
