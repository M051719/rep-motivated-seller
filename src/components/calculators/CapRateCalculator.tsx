import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building, DollarSign, Percent, TrendingUp } from "lucide-react";

export const CapRateCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    propertyValue: 300000,
    annualIncome: 30000,
    annualExpenses: 6000,
  });

  const noi = inputs.annualIncome - inputs.annualExpenses;
  const capRate =
    inputs.propertyValue > 0 ? (noi / inputs.propertyValue) * 100 : 0;

  const getCapRateGrade = (rate: number) => {
    if (rate >= 8)
      return {
        grade: "Excellent",
        color: "green",
        desc: "Strong cash flow property",
      };
    if (rate >= 6)
      return { grade: "Good", color: "blue", desc: "Solid investment" };
    if (rate >= 4)
      return { grade: "Fair", color: "yellow", desc: "Average performance" };
    return { grade: "Below Average", color: "red", desc: "Low returns" };
  };

  const grade = getCapRateGrade(capRate);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Building className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Cap Rate Calculator
        </h2>
        <p className="text-gray-600">Capitalization Rate Analysis</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Value
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={inputs.propertyValue}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    propertyValue: Number(e.target.value),
                  })
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Gross Income
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={inputs.annualIncome}
                onChange={(e) =>
                  setInputs({ ...inputs, annualIncome: Number(e.target.value) })
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Operating Expenses
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={inputs.annualExpenses}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    annualExpenses: Number(e.target.value),
                  })
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Includes taxes, insurance, maintenance, management, utilities
              (excludes mortgage)
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100">Cap Rate</span>
              <Percent className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-5xl font-bold">{capRate.toFixed(2)}%</div>
            <div
              className={`mt-3 inline-block px-3 py-1 bg-${grade.color}-500 bg-opacity-30 rounded-full text-sm font-semibold`}
            >
              {grade.grade}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100">Net Operating Income</span>
              <TrendingUp className="w-5 h-5 text-green-200" />
            </div>
            <div className="text-4xl font-bold">${noi.toLocaleString()}</div>
            <div className="text-green-100 text-sm mt-1">per year</div>
          </motion.div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Income Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Income:</span>
                <span className="font-semibold text-green-600">
                  ${inputs.annualIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Operating Expenses:</span>
                <span className="font-semibold text-red-600">
                  -${inputs.annualExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Net Operating Income:</span>
                <span className="font-bold text-gray-900">
                  ${noi.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-3">
                <span>Expense Ratio:</span>
                <span>
                  {(
                    (inputs.annualExpenses / inputs.annualIncome) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
            <p className="text-blue-800">
              <strong>Formula:</strong> Cap Rate = (NOI / Property Value) × 100
            </p>
          </div>
        </div>
      </div>

      {/* Cap Rate Guide */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">
          Cap Rate Investment Guide
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-green-600 font-bold text-lg mb-1">8%+</div>
            <div className="text-sm text-gray-600">
              Excellent cash flow, higher risk markets
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-blue-600 font-bold text-lg mb-1">6-8%</div>
            <div className="text-sm text-gray-600">
              Good balance of income and appreciation
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-yellow-600 font-bold text-lg mb-1">4-6%</div>
            <div className="text-sm text-gray-600">
              Lower yield, stable appreciation markets
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-red-600 font-bold text-lg mb-1">&lt;4%</div>
            <div className="text-sm text-gray-600">
              Premium markets, appreciation focused
            </div>
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>💡 Note:</strong> Cap rates vary by market and property
            type. Higher cap rates often indicate higher risk or less desirable
            locations. Lower cap rates are common in premium markets with strong
            appreciation.
          </p>
        </div>
      </div>
    </div>
  );
};
