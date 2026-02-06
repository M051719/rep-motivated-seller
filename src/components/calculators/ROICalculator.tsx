import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Percent, Calculator } from "lucide-react";

export const ROICalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    initialInvestment: 50000,
    netProfit: 15000,
    timeframe: 1,
  });

  const roi = (inputs.netProfit / inputs.initialInvestment) * 100;
  const annualizedROI = inputs.timeframe > 0 ? roi / inputs.timeframe : roi;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ROI Calculator
        </h2>
        <p className="text-gray-600">Return on Investment Analysis</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Investment
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={inputs.initialInvestment}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    initialInvestment: Number(e.target.value),
                  })
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Net Profit / Return
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={inputs.netProfit}
                onChange={(e) =>
                  setInputs({ ...inputs, netProfit: Number(e.target.value) })
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Holding Period (years)
            </label>
            <input
              type="number"
              step="0.5"
              value={inputs.timeframe}
              onChange={(e) =>
                setInputs({ ...inputs, timeframe: Number(e.target.value) })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100">Total ROI</span>
              <Percent className="w-5 h-5 text-green-200" />
            </div>
            <div className="text-4xl font-bold">{roi.toFixed(2)}%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-100">Annualized ROI</span>
              <TrendingUp className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="text-4xl font-bold">
              {annualizedROI.toFixed(2)}%
            </div>
          </motion.div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">ROI Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Investment:</span>
                <span className="font-semibold text-gray-900">
                  ${inputs.initialInvestment.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Return:</span>
                <span className="font-semibold text-green-600">
                  ${inputs.netProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-bold text-gray-900">
                  $
                  {(
                    inputs.initialInvestment + inputs.netProfit
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
            <p className="text-blue-800">
              <strong>Formula:</strong> ROI = (Net Profit / Initial Investment)
              × 100
            </p>
          </div>
        </div>
      </div>

      {/* ROI Guide */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">ROI Investment Guide</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-green-600 font-bold text-lg mb-1">
              20%+ ROI
            </div>
            <div className="text-sm text-gray-600">
              Excellent - Strong investment
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-blue-600 font-bold text-lg mb-1">
              10-20% ROI
            </div>
            <div className="text-sm text-gray-600">Good - Solid returns</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-yellow-600 font-bold text-lg mb-1">
              &lt;10% ROI
            </div>
            <div className="text-sm text-gray-600">
              Fair - Consider alternatives
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
