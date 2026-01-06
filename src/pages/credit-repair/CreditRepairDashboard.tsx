import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreditScoreTracker from "../../components/credit-repair/CreditScoreTracker";
import ActiveDisputes from "../../components/credit-repair/ActiveDisputes";
import PropertySearch from "../../components/credit-repair/PropertySearch";

interface UserMembership {
  tier: "FREE" | "PREMIUM" | "ELITE";
  status: string;
  renewalDate: string;
}

const CreditRepairDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [activeTab, setActiveTab] = useState<
    "credit" | "property" | "overview"
  >("overview");

  useEffect(() => {
    // Fetch user membership data
    fetchMembership();
  }, []);

  const fetchMembership = async () => {
    try {
      // Replace with actual API call
      const response = await fetch("/api/membership/current", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMembership(data.data);
      }
    } catch (error) {
      console.error("Error fetching membership:", error);
    }
  };

  const getTierBadge = () => {
    if (!membership) return null;

    const colors = {
      FREE: "bg-green-100 text-green-800",
      PREMIUM: "bg-blue-100 text-blue-800",
      ELITE: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[membership.tier]}`}
      >
        {membership.tier}
      </span>
    );
  };

  return (
    <div className="credit-repair-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Credit Repair Dashboard</h1>
              <p className="text-gray-600">
                Manage your credit and property investments
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getTierBadge()}
              <button
                className="btn btn-primary"
                onClick={() => navigate("/credit-repair/pricing")}
              >
                Upgrade Membership
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <div className="container">
          <div className="flex gap-4 border-b">
            <button
              className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === "credit" ? "active" : ""}`}
              onClick={() => setActiveTab("credit")}
            >
              Credit Repair
            </button>
            <button
              className={`tab-button ${activeTab === "property" ? "active" : ""}`}
              onClick={() => setActiveTab("property")}
            >
              Property Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content section-padding">
        <div className="container">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="dashboard-card">
                <h2 className="text-2xl font-bold mb-4">Credit Score</h2>
                <CreditScoreTracker
                  userTier={membership?.tier || "FREE"}
                  showHistory={true}
                  showGoal={true}
                />
              </div>

              <div className="dashboard-card">
                <h2 className="text-2xl font-bold mb-4">Quick Stats</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Active Disputes</span>
                    <span className="stat-value text-blue-600">3</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Properties Saved</span>
                    <span className="stat-value text-green-600">12</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Searches This Month</span>
                    <span className="stat-value text-purple-600">
                      {membership?.tier === "FREE"
                        ? "5/10"
                        : membership?.tier === "PREMIUM"
                          ? "45/100"
                          : "Unlimited"}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">AI Queries Left</span>
                    <span className="stat-value text-orange-600">
                      {membership?.tier === "FREE"
                        ? "15/20"
                        : membership?.tier === "PREMIUM"
                          ? "150/200"
                          : "Unlimited"}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="flex flex-col gap-2">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate("/credit-repair/disputes/new")}
                    >
                      + Start New Dispute
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTab("property")}
                    >
                      🔍 Search Properties
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate("/credit-repair/reports")}
                    >
                      📊 View Credit Reports
                    </button>
                  </div>
                </div>
              </div>

              <div className="dashboard-card lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Active Disputes</h2>
                <ActiveDisputes limit={5} />
              </div>
            </div>
          )}

          {activeTab === "credit" && (
            <div className="credit-section">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CreditScoreTracker
                    userTier={membership?.tier || "FREE"}
                    showHistory={true}
                    showGoal={true}
                  />

                  <div className="mt-6">
                    <ActiveDisputes />
                  </div>
                </div>

                <div>
                  <div className="dashboard-card">
                    <h3 className="font-semibold mb-4">
                      Credit Improvement Tips
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">Pay all bills on time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">
                          Keep credit utilization below 30%
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">
                          Don't close old accounts
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">
                          Review reports regularly
                        </span>
                      </li>
                    </ul>
                    <button
                      className="btn btn-primary btn-sm mt-4 w-full"
                      onClick={() => navigate("/credit-repair/education")}
                    >
                      View All Tips
                    </button>
                  </div>

                  {membership?.tier === "FREE" && (
                    <div className="dashboard-card mt-4 bg-gradient-to-br from-blue-50 to-purple-50">
                      <h3 className="font-semibold mb-2">Upgrade for More</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Get access to all 3 credit bureaus and unlimited
                        disputes
                      </p>
                      <button
                        className="btn btn-primary btn-sm w-full"
                        onClick={() => navigate("/credit-repair/pricing")}
                      >
                        View Plans
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "property" && (
            <div className="property-section">
              <PropertySearch
                userTier={membership?.tier || "FREE"}
                showMap={membership?.tier !== "FREE"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditRepairDashboard;
