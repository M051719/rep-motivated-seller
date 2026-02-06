import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Award,
  FileText,
  Calendar,
  DollarSign,
  Home,
  Heart,
  Trophy,
  CheckCircle,
} from "lucide-react";
import { useSubscription } from "../hooks/useSubscription";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import SubscriptionCard from "../components/subscription/SubscriptionCard";
import { BackButton } from "../components/ui/BackButton";
import toast from "react-hot-toast";

interface ImpactMetrics {
  familiesHelped: number;
  loansProcessed: number;
  totalSaved: number;
  avgProcessingDays: number;
}

interface MemberStats {
  documentsGenerated: number;
  coursesCompleted: number;
  appointmentsAttended: number;
  certificatesEarned: number;
}

interface LoanProgress {
  id: string;
  propertyAddress: string;
  status: "submitted" | "processing" | "approved" | "closed" | "denied";
  submittedAt: string;
  loanAmount: number;
  progress: number;
}

const Dashboard: React.FC = () => {
  const { subscription, checkFeatureAccess, trackApiUsage } = useSubscription();
  const { user } = useAuthStore();
  const [apiResult, setApiResult] = useState<string>("");
  const [userTier, setUserTier] = useState<string>("free");
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetrics>({
    familiesHelped: 0,
    loansProcessed: 0,
    totalSaved: 0,
    avgProcessingDays: 0,
  });
  const [memberStats, setMemberStats] = useState<MemberStats>({
    documentsGenerated: 0,
    coursesCompleted: 0,
    appointmentsAttended: 0,
    certificatesEarned: 0,
  });
  const [loanProgress, setLoanProgress] = useState<LoanProgress[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load user tier
      const { data: profile } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserTier(profile.tier || "free");
      }

      // Load platform-wide impact metrics (visible to all tiers)
      const { data: metricsData } = await supabase
        .from("platform_metrics")
        .select("*")
        .single();

      if (metricsData) {
        setImpactMetrics({
          familiesHelped: metricsData.families_helped || 0,
          loansProcessed: metricsData.loans_processed || 0,
          totalSaved: metricsData.total_saved || 0,
          avgProcessingDays: metricsData.avg_processing_days || 0,
        });
      }

      // Load member accomplishments
      const { data: accomplishments } = await supabase
        .from("member_accomplishments")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (accomplishments) {
        setMemberStats({
          documentsGenerated: accomplishments.documents_generated || 0,
          coursesCompleted: accomplishments.courses_completed || 0,
          appointmentsAttended: accomplishments.appointments_attended || 0,
          certificatesEarned: accomplishments.certificates_earned || 0,
        });
      }

      // Load loan processing progress
      const { data: loans } = await supabase
        .from("loan_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (loans) {
        setLoanProgress(
          loans.map((loan: any) => ({
            id: loan.id,
            propertyAddress: loan.property_address,
            status: loan.status,
            submittedAt: loan.created_at,
            loanAmount: loan.loan_amount,
            progress: getProgressPercentage(loan.status),
          })),
        );
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const getProgressPercentage = (status: string): number => {
    switch (status) {
      case "submitted":
        return 25;
      case "processing":
        return 50;
      case "approved":
        return 75;
      case "closed":
        return 100;
      case "denied":
        return 0;
      default:
        return 0;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-purple-100 text-purple-700";
      case "denied":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleApiCall = async (apiName: string) => {
    try {
      const access = await checkFeatureAccess(apiName);

      if (!access.hasAccess) {
        alert(`You need a higher subscription tier to access ${apiName}`);
        return;
      }

      const remainingCredits = await trackApiUsage(apiName, 1);
      setApiResult(
        `API call successful! Remaining credits: ${remainingCredits}`,
      );
    } catch (error) {
      console.error("API call failed:", error);
      setApiResult(
        "API call failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            📊 Member Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Welcome back! Track your progress and our platform's impact on
            families.
          </p>
        </motion.div>

        {/* Platform Impact Metrics - Visible to ALL Tiers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🌟 RepMotivatedSeller Platform Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="w-12 h-12" />
                <Heart className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-blue-100 text-sm mb-1">Families Helped</p>
              <p className="text-4xl font-bold">
                {impactMetrics.familiesHelped.toLocaleString()}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-12 h-12" />
                <CheckCircle className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-green-100 text-sm mb-1">Loans Processed</p>
              <p className="text-4xl font-bold">
                {impactMetrics.loansProcessed.toLocaleString()}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-12 h-12" />
                <TrendingUp className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-purple-100 text-sm mb-1">
                Total Saved for Families
              </p>
              <p className="text-4xl font-bold">
                ${(impactMetrics.totalSaved / 1000000).toFixed(1)}M
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-12 h-12" />
                <Trophy className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-orange-100 text-sm mb-1">
                Avg Processing Time
              </p>
              <p className="text-4xl font-bold">
                {impactMetrics.avgProcessingDays} days
              </p>
            </motion.div>
          </div>
        </div>

        {/* Member Accomplishments - Per Tier Tracking */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🏆 Your Accomplishments ({userTier.toUpperCase()} Tier)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {memberStats.documentsGenerated}
                </span>
              </div>
              <p className="text-sm text-gray-600">Documents Generated</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {memberStats.coursesCompleted}
                </span>
              </div>
              <p className="text-sm text-gray-600">Courses Completed</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {memberStats.appointmentsAttended}
                </span>
              </div>
              <p className="text-sm text-gray-600">Appointments Attended</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {memberStats.certificatesEarned}
                </span>
              </div>
              <p className="text-sm text-gray-600">Certificates Earned</p>
            </div>
          </div>
        </div>

        {/* Loan Processing Progress Tracker */}
        {loanProgress.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📋 Your Loan Processing Status
            </h2>
            <div className="space-y-4">
              {loanProgress.map((loan) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        <Home className="w-5 h-5 inline mr-2" />
                        {loan.propertyAddress}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Loan Amount: ${loan.loanAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted:{" "}
                        {new Date(loan.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}
                    >
                      {loan.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{loan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          loan.status === "denied"
                            ? "bg-red-500"
                            : loan.status === "closed"
                              ? "bg-green-500"
                              : "bg-blue-600"
                        }`}
                        style={{ width: `${loan.progress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* API Tools & Subscription Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              API Tools
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => handleApiCall("property-research")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
              >
                Property Research API
              </button>

              <button
                onClick={() => handleApiCall("deal-analyzer")}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
              >
                Deal Analyzer API
              </button>

              <button
                onClick={() => handleApiCall("call-center")}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
              >
                Call Center Tools
              </button>
            </div>

            {apiResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{apiResult}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Subscription</h2>
            <SubscriptionCard />
          </div>
        </div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-xl p-6 text-white"
        >
          <h3 className="text-xl font-bold mb-2">⚠️ IMPORTANT NOTICE</h3>
          <p className="opacity-90">
            All loans must be processed through RepMotivatedSeller. Platform
            data protected by law.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
