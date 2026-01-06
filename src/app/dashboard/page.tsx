import React, { useState } from "react";
import { useSubscription } from "../hooks/useSubscription";
import SubscriptionCard from "../components/subscription/SubscriptionCard";

const Dashboard: React.FC = () => {
  const { subscription, checkFeatureAccess, trackApiUsage } = useSubscription();
  const [apiResult, setApiResult] = useState<string>("");

  const handleApiCall = async (apiName: string) => {
    try {
      // Check if user has access to this feature
      const access = await checkFeatureAccess(apiName);

      if (!access.hasAccess) {
        alert(`You need a higher subscription tier to access ${apiName}`);
        return;
      }

      // Track API usage
      const remainingCredits = await trackApiUsage(apiName, 1);

      // Make your actual API call here
      // const result = await yourApiCall();

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">API Tools</h2>

          <div className="space-y-4">
            <button
              onClick={() => handleApiCall("property-research")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Property Research API
            </button>

            <button
              onClick={() => handleApiCall("deal-analyzer")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Deal Analyzer API
            </button>

            <button
              onClick={() => handleApiCall("call-center")}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Call Center Tools
            </button>
          </div>

          {apiResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p>{apiResult}</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Subscription</h2>
          <SubscriptionCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
