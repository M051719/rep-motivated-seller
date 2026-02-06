import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Scatter, Bar, Line } from "react-chartjs-2";
import FreePropertyDataService from "../../services/FreePropertyDataService";
import FreePropertyIntelligence from "../../services/FreePropertyIntelligence";

const PropertyIntelligenceDashboard: React.FC = () => {
  const [propertyData, setPropertyData] = useState<any>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null);
  const [foreclosureRisk, setForeclosureRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedZipCode, setSelectedZipCode] = useState<string>("");

  const propertyService = useMemo(() => FreePropertyDataService, []);
  const intelligenceService = useMemo(() => FreePropertyIntelligence, []);

  const loadPropertyIntelligence = useCallback(async () => {
    try {
      setLoading(true);

      const [properties, market, risk] = await Promise.all([
        propertyService.searchProperties({
          zipCode: selectedZipCode || undefined,
          limit: 100,
        }),
        intelligenceService.getMarketAnalysis(selectedZipCode || undefined),
        intelligenceService.getForeclosureRisk(selectedZipCode || undefined),
      ]);

      setPropertyData(properties);
      setMarketAnalysis(market);
      setForeclosureRisk(risk);
    } catch (error) {
      console.error("Error loading property intelligence:", error);
    } finally {
      setLoading(false);
    }
  }, [intelligenceService, propertyService, selectedZipCode]);

  useEffect(() => {
    loadPropertyIntelligence();
  }, [loadPropertyIntelligence]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🏠 Property Intelligence Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Advanced property analytics powered by your integrated data services
        </p>

        {/* Zip Code Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">
            Target Area:
          </label>
          <input
            type="text"
            value={selectedZipCode}
            onChange={(e) => setSelectedZipCode(e.target.value)}
            placeholder="Enter zip code"
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={() => loadPropertyIntelligence()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Analyze
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center">
            <span className="text-3xl mr-4">🏘️</span>
            <div>
              <p className="text-sm text-gray-500">Properties Analyzed</p>
              <p className="text-2xl font-bold text-blue-600">
                {propertyData?.length || 0}
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
            <span className="text-3xl mr-4">⚠️</span>
            <div>
              <p className="text-sm text-gray-500">High Risk Properties</p>
              <p className="text-2xl font-bold text-red-600">
                {propertyData?.filter((p: any) => p.riskScore > 70).length || 0}
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
            <span className="text-3xl mr-4">💰</span>
            <div>
              <p className="text-sm text-gray-500">Avg Property Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${marketAnalysis?.averageValue?.toLocaleString() || "0"}
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
              <p className="text-sm text-gray-500">Market Trend</p>
              <p className="text-2xl font-bold text-purple-600">
                {marketAnalysis?.trend || "Stable"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts and Analysis */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Property Value vs Risk Score */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Property Value vs Foreclosure Risk
          </h3>
          <div style={{ height: "300px" }}>
            <Scatter
              data={{
                datasets: [
                  {
                    label: "Properties",
                    data:
                      propertyData?.map((p: any) => ({
                        x: p.estimatedValue || 0,
                        y: p.riskScore || 0,
                      })) || [],
                    backgroundColor: "rgba(59, 130, 246, 0.6)",
                    borderColor: "rgba(59, 130, 246, 1)",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Property Value ($)",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Risk Score",
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Market Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Market Analysis Insights
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Market Strength
              </h4>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${marketAnalysis?.strength || 50}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-blue-900">
                  {marketAnalysis?.strength || 50}%
                </span>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">
                Investment Potential
              </h4>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${marketAnalysis?.investmentScore || 65}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-green-900">
                  {marketAnalysis?.investmentScore || 65}%
                </span>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">
                Foreclosure Risk
              </h4>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${foreclosureRisk?.averageRisk || 25}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-red-900">
                  {foreclosureRisk?.averageRisk || 25}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Intelligence Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          🤖 AI-Generated Property Intelligence Report
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-3">
              Key Opportunities
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• High-equity distressed properties identified</li>
              <li>• Below-market value opportunities in target area</li>
              <li>• Growing market demand indicators</li>
              <li>• Optimal timing for acquisition strategies</li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">Risk Factors</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Economic indicators showing volatility</li>
              <li>• Seasonal market fluctuations expected</li>
              <li>• Regulatory changes may impact timing</li>
              <li>• Competition increasing in hot markets</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">
              Recommendations
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Focus on properties with 15-30% equity</li>
              <li>• Target homeowners 90+ days behind</li>
              <li>• Prioritize suburban single-family homes</li>
              <li>• Implement multi-touch campaign strategy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyIntelligenceDashboard;
