import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export const DSCRCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    annualIncome: 96000,
    annualExpenses: 24000,
    annualDebtPayment: 48000,
  });

  const noi = inputs.annualIncome - inputs.annualExpenses;
  const dscr =
    inputs.annualDebtPayment > 0 ? noi / inputs.annualDebtPayment : 0;
  const monthlyNOI = noi / 12;
  const monthlyDebt = inputs.annualDebtPayment / 12;
  const annualCashFlow = noi - inputs.annualDebtPayment;

  const getDSCRGrade = (ratio: number) => {
    if (ratio >= 1.5)
      return {
        grade: "Excellent",
        color: "green",
        desc: "Strong debt coverage",
        icon: CheckCircle,
      };
    if (ratio >= 1.25)
      return {
        grade: "Good",
        color: "blue",
        desc: "Healthy coverage",
        icon: CheckCircle,
      };
    if (ratio >= 1.0)
      return {
        grade: "Acceptable",
        color: "yellow",
        desc: "Minimal coverage",
        icon: AlertCircle,
      };
    return {
      grade: "Risky",
      color: "red",
      desc: "Insufficient coverage",
      icon: AlertCircle,
    };
  };

  const grade = getDSCRGrade(dscr);
  const GradeIcon = grade.icon;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          DSCR Calculator
        </h2>
        <p className="text-gray-600">Debt Service Coverage Ratio Analysis</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
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
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Total rental income before expenses
            </p>
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
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Taxes, insurance, maintenance, management (excludes mortgage
              principal)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Debt Service
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={inputs.annualDebtPayment}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    annualDebtPayment: Number(e.target.value),
                  })
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Total annual mortgage payments (principal + interest)
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-gradient-to-br from-${grade.color}-500 to-${grade.color}-600 rounded-xl p-6 text-white`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-${grade.color}-100`}>DSCR</span>
              <GradeIcon className={`w-5 h-5 text-${grade.color}-200`} />
            </div>
            <div className="text-5xl font-bold">{dscr.toFixed(2)}x</div>
            <div
              className={`mt-3 inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold`}
            >
              {grade.grade} - {grade.desc}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white"
            >
              <div className="text-blue-100 text-sm mb-1">
                Net Operating Income
              </div>
              <div className="text-2xl font-bold">${noi.toLocaleString()}</div>
              <div className="text-xs text-blue-200 mt-1">
                ${monthlyNOI.toLocaleString()}/mo
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 text-white"
            >
              <div className="text-emerald-100 text-sm mb-1">
                Annual Cash Flow
              </div>
              <div className="text-2xl font-bold">
                {annualCashFlow >= 0 ? "+" : ""}
                {annualCashFlow.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-200 mt-1">
                After debt service
              </div>
            </motion.div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">DSCR Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Income:</span>
                <span className="font-semibold text-gray-900">
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
                <span className="text-gray-700 font-medium">
                  Net Operating Income:
                </span>
                <span className="font-bold text-gray-900">
                  ${noi.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-700 font-medium">
                  Annual Debt Service:
                </span>
                <span className="font-bold text-gray-900">
                  ${inputs.annualDebtPayment.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Payment:</span>
                <span className="font-semibold text-gray-900">
                  ${monthlyDebt.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm">
            <p className="text-indigo-800">
              <strong>Formula:</strong> DSCR = Net Operating Income / Annual
              Debt Service
            </p>
          </div>
        </div>
      </div>

      {/* DSCR Guide */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">
          DSCR Requirements Guide
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-green-600 font-bold text-lg mb-1">1.5+</div>
            <div className="text-sm text-gray-600">
              Excellent - Most lenders love this
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-blue-600 font-bold text-lg mb-1">1.25-1.5</div>
            <div className="text-sm text-gray-600">
              Good - Solid coverage, widely acceptable
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-yellow-600 font-bold text-lg mb-1">
              1.0-1.25
            </div>
            <div className="text-sm text-gray-600">
              Acceptable - Minimum for some lenders
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-red-600 font-bold text-lg mb-1">&lt;1.0</div>
            <div className="text-sm text-gray-600">
              Risky - Difficult to finance
            </div>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Why DSCR Matters
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Lenders require minimum DSCR (usually 1.20-1.25x)</li>
              <li>• Shows property can support its debt</li>
              <li>• Critical for investment property loans</li>
              <li>• Higher DSCR = better loan terms</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">
              Improving Your DSCR
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Increase rental income</li>
              <li>• Reduce operating expenses</li>
              <li>• Make larger down payment (lower debt service)</li>
              <li>• Negotiate better interest rates</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Important Notes
          </h4>
          <p className="text-sm text-yellow-800">
            <strong>DSCR loans</strong> focus on property cash flow, not
            personal income. These are popular for real estate investors who
            don't want to qualify based on W-2 income. Expect DSCR minimums of
            1.0-1.25x depending on the lender, with rates typically 0.5-1%
            higher than conventional loans. A DSCR below 1.0 means the property
            doesn't generate enough income to cover its debt, requiring you to
            cover the shortfall from other sources.
          </p>
        </div>
      </div>
    </div>
  );
};
