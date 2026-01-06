import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, DollarSign, Percent, TrendingUp, Calculator } from 'lucide-react';

export const CashOnCashCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    downPayment: 60000,
    closingCosts: 5000,
    rehabCosts: 0,
    annualCashFlow: 8400,
  });

  const totalInvestment = inputs.downPayment + inputs.closingCosts + inputs.rehabCosts;
  const cashOnCash = totalInvestment > 0 ? (inputs.annualCashFlow / totalInvestment) * 100 : 0;
  const monthlyReturn = inputs.annualCashFlow / 12;
  const paybackYears = inputs.annualCashFlow > 0 ? totalInvestment / inputs.annualCashFlow : 0;

  const getCoCGrade = (rate: number) => {
    if (rate >= 12) return { grade: 'Excellent', color: 'green', desc: 'Outstanding returns' };
    if (rate >= 8) return { grade: 'Good', color: 'blue', desc: 'Strong cash flow' };
    if (rate >= 5) return { grade: 'Fair', color: 'yellow', desc: 'Acceptable returns' };
    return { grade: 'Below Average', color: 'red', desc: 'Low cash returns' };
  };

  const grade = getCoCGrade(cashOnCash);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Cash-on-Cash Calculator</h2>
        <p className="text-gray-600">Annual Cash Return Analysis</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Down Payment
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={inputs.downPayment}
                onChange={(e) => setInputs({ ...inputs, downPayment: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Closing Costs
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={inputs.closingCosts}
                onChange={(e) => setInputs({ ...inputs, closingCosts: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rehab / Renovation Costs
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={inputs.rehabCosts}
                onChange={(e) => setInputs({ ...inputs, rehabCosts: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter 0 if turnkey property
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Pre-Tax Cash Flow
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={inputs.annualCashFlow}
                onChange={(e) => setInputs({ ...inputs, annualCashFlow: Number(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Rental income minus all expenses (excluding mortgage principal)
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100">Cash-on-Cash Return</span>
              <Percent className="w-5 h-5 text-purple-200" />
            </div>
            <div className="text-5xl font-bold">{cashOnCash.toFixed(2)}%</div>
            <div className={`mt-3 inline-block px-3 py-1 bg-${grade.color}-500 bg-opacity-30 rounded-full text-sm font-semibold`}>
              {grade.grade}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white"
            >
              <div className="text-green-100 text-sm mb-1">Monthly Cash Flow</div>
              <div className="text-2xl font-bold">${monthlyReturn.toLocaleString()}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white"
            >
              <div className="text-blue-100 text-sm mb-1">Payback Period</div>
              <div className="text-2xl font-bold">
                {paybackYears > 0 ? `${paybackYears.toFixed(1)} yrs` : 'N/A'}
              </div>
            </motion.div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Investment Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Down Payment:</span>
                <span className="font-semibold text-gray-900">
                  ${inputs.downPayment.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Closing Costs:</span>
                <span className="font-semibold text-gray-900">
                  ${inputs.closingCosts.toLocaleString()}
                </span>
              </div>
              {inputs.rehabCosts > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rehab Costs:</span>
                  <span className="font-semibold text-gray-900">
                    ${inputs.rehabCosts.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-700 font-medium">Total Cash Invested:</span>
                <span className="font-bold text-gray-900">
                  ${totalInvestment.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-700 font-medium">Annual Return:</span>
                <span className="font-bold text-green-600">
                  ${inputs.annualCashFlow.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm">
            <p className="text-purple-800">
              <strong>Formula:</strong> CoC Return = (Annual Pre-Tax Cash Flow / Total Cash Invested) × 100
            </p>
          </div>
        </div>
      </div>

      {/* CoC Guide */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">Cash-on-Cash Return Guide</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-green-600 font-bold text-lg mb-1">12%+</div>
            <div className="text-sm text-gray-600">Excellent - Outstanding cash returns</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-blue-600 font-bold text-lg mb-1">8-12%</div>
            <div className="text-sm text-gray-600">Good - Strong cash flow investment</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-yellow-600 font-bold text-lg mb-1">5-8%</div>
            <div className="text-sm text-gray-600">Fair - Acceptable for appreciation plays</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-red-600 font-bold text-lg mb-1">&lt;5%</div>
            <div className="text-sm text-gray-600">Low - Better opportunities likely exist</div>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Why Use CoC Return?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Measures actual cash returned to you annually</li>
              <li>• Focuses on leveraged returns, not total property value</li>
              <li>• Helps compare different investment opportunities</li>
              <li>• Shows true cash flow performance</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">CoC vs ROI</h4>
            <p className="text-sm text-yellow-800">
              <strong>CoC Return</strong> focuses on annual cash flow from your out-of-pocket investment.
              <strong className="ml-1">ROI</strong> measures total return including appreciation and equity buildup over time.
              Use CoC for cash flow analysis and ROI for overall investment performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
