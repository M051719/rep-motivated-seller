import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  Users,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { BackButton } from "../components/ui/BackButton";
import toast from "react-hot-toast";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "1-on-1" | "Zoom";
  status: "scheduled" | "completed" | "cancelled";
  calendlyUrl: string;
  tier: "free" | "entrepreneur" | "professional" | "enterprise";
}

const SchedulingDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userTier, setUserTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  // Calendly URLs for different tiers
  const calendlyLinks = {
    free: "https://calendly.com/repmotivatedseller/30min-consultation",
    entrepreneur:
      "https://calendly.com/repmotivatedseller/entrepreneur-strategy-session",
    professional:
      "https://calendly.com/repmotivatedseller/professional-deep-dive",
    enterprise:
      "https://calendly.com/repmotivatedseller/enterprise-consultation",
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get user tier
      const { data: profile } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserTier(profile.tier || "free");
      }

      // Get appointments from database
      const { data: appointmentsData, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_at", { ascending: true });

      if (error) {
        console.error("Error loading appointments:", error);
      } else if (appointmentsData) {
        // Transform database appointments to UI format
        const formattedAppointments = appointmentsData.map((apt) => ({
          id: apt.id,
          title: apt.title || "Consultation",
          date: new Date(apt.scheduled_at).toLocaleDateString(),
          time: new Date(apt.scheduled_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: apt.event_type || "1-on-1",
          status: apt.status || "scheduled",
          calendlyUrl: apt.calendly_url || "",
          tier: apt.tier || userTier,
        }));
        setAppointments(formattedAppointments);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleNew = (tier: string) => {
    const url = calendlyLinks[tier as keyof typeof calendlyLinks];
    if (url) {
      window.open(url, "_blank");
      toast.success("Opening Calendly scheduler...");
    } else {
      toast.error("Scheduling not available for this tier");
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadUserData();
    toast.success("Refreshing appointments...");
  };

  const getEventTypeIcon = (type: "1-on-1" | "Zoom") => {
    return type === "Zoom" ? (
      <Video className="w-5 h-5" />
    ) : (
      <Users className="w-5 h-5" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Scheduled
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            Unknown
          </span>
        );
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "text-gray-600";
      case "entrepreneur":
        return "text-blue-600";
      case "professional":
        return "text-purple-600";
      case "enterprise":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case "free":
        return {
          sessions: "1 consultation/month",
          duration: "30 minutes",
          type: "1-on-1 phone call",
          features: [
            "Basic foreclosure guidance",
            "Resource recommendations",
            "Q&A session",
          ],
        };
      case "entrepreneur":
        return {
          sessions: "2 sessions/month",
          duration: "45 minutes",
          type: "1-on-1 or Zoom",
          features: [
            "Strategy planning",
            "Deal analysis review",
            "Action plan creation",
            "Email follow-up",
          ],
        };
      case "professional":
        return {
          sessions: "Unlimited sessions",
          duration: "60 minutes",
          type: "1-on-1 or Zoom",
          features: [
            "Deep-dive consultations",
            "Custom deal analysis",
            "Contract review",
            "Priority scheduling",
            "Direct phone access",
          ],
        };
      case "enterprise":
        return {
          sessions: "Unlimited + on-demand",
          duration: "Flexible",
          type: "1-on-1, Zoom, or Team calls",
          features: [
            "Dedicated account manager",
            "Same-day scheduling",
            "Custom consultation packages",
            "Team training sessions",
            "24/7 priority support",
          ],
        };
      default:
        return {
          sessions: "N/A",
          duration: "N/A",
          type: "N/A",
          features: [],
        };
    }
  };

  const tierBenefits = getTierBenefits(userTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            📅 Scheduling Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your appointments and consultations with foreclosure
            prevention experts
          </p>
        </motion.div>

        {/* Current Tier Benefits */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-12 text-white"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Your {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
                Benefits
              </h2>
              <p className="text-blue-100">
                Access to expert consultation and guidance
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <Calendar className="w-12 h-12" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100 mb-1">Sessions Available</p>
              <p className="text-2xl font-bold">{tierBenefits.sessions}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100 mb-1">Session Duration</p>
              <p className="text-2xl font-bold">{tierBenefits.duration}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100 mb-1">Meeting Type</p>
              <p className="text-2xl font-bold">{tierBenefits.type}</p>
            </div>
          </div>

          <div className="border-t border-white border-opacity-20 pt-6">
            <h3 className="text-lg font-semibold mb-3">What's Included:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tierBenefits.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleScheduleNew(userTier)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg font-semibold"
          >
            <Calendar className="w-5 h-5" />
            Schedule New Appointment
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Appointments
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center"
            >
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Appointments Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Schedule your first consultation to get expert guidance
              </p>
              <button
                onClick={() => handleScheduleNew(userTier)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg font-semibold"
              >
                Schedule Your First Appointment
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-full ${
                          appointment.type === "Zoom"
                            ? "bg-purple-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {getEventTypeIcon(appointment.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {appointment.title}
                        </h3>
                        <p
                          className={`text-sm font-medium ${getTierColor(appointment.tier)}`}
                        >
                          {appointment.tier.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      {getEventTypeIcon(appointment.type)}
                      <span>{appointment.type} Meeting</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    {getStatusBadge(appointment.status)}
                  </div>

                  {appointment.calendlyUrl && (
                    <a
                      href={appointment.calendlyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View in Calendly
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Calendly Integration for Each Tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Schedule by Tier
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(calendlyLinks).map(([tier, url]) => (
              <div
                key={tier}
                className={`border-2 rounded-xl p-6 ${
                  userTier === tier
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <h3 className={`text-xl font-bold mb-2 ${getTierColor(tier)}`}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {getTierBenefits(tier).sessions}
                </p>
                <button
                  onClick={() => handleScheduleNew(tier)}
                  disabled={userTier !== tier}
                  className={`w-full py-2 rounded-lg font-semibold transition-all ${
                    userTier === tier
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {userTier === tier ? "Schedule Now" : "Upgrade to Access"}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-xl p-6 text-white"
        >
          <div className="flex items-center gap-4">
            <AlertCircle className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold mb-1">IMPORTANT NOTICE</h3>
              <p className="text-sm opacity-90">
                All loans must be processed through RepMotivatedSeller. Platform
                data protected by law.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SchedulingDashboard;
