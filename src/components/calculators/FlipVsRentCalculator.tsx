import React, { useState } from "react";
import { Home, TrendingUp, DollarSign, Scale } from "lucide-react";

export const FlipVsRentCalculator: React.FC = () => {
  // Property Details
  const [purchasePrice, setPurchasePrice] = useState<number>(200000);
  const [repairCost, setRepairCost] = useState<number>(30000);
  const [arv, setArv] = useState<number>(280000);

  // Flip Scenario
  const [flipHoldingTime, setFlipHoldingTime] = useState<number>(6);
  const [flipClosingCosts, setFlipClosingCosts] = useState<number>(3);
  const [realtorCommission, setRealtorCommission] = useState<number>(6);

  // Rental Scenario
  const [monthlyRent, setMonthlyRent] = useState<number>(1800);
  const [vacancyRate, setVacancyRate] = useState<number>(8);
  const [propertyManagement, setPropertyManagement] = useState<number>(10);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(400);
  const [appreciation, setAppreciation] = useState<number>(3);

  // Calculate Flip Scenario
  const totalInvestment = purchasePrice + repairCost;
  const flipSellingCosts = arv * ((flipClosingCosts + realtorCommission) / 100);
  const flipNetProfit = arv - totalInvestment - flipSellingCosts;
  const flipROI = (flipNetProfit / totalInvestment) * 100;
  const flipAnnualizedROI = (flipROI / flipHoldingTime) * 12;

  // Calculate Rental Scenario
  const effectiveMonthlyRent = monthlyRent * (1 - vacancyRate / 100);
  const managementFee = effectiveMonthlyRent * (propertyManagement / 100);
  const monthlyCashFlow =
    effectiveMonthlyRent - managementFee - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100;

  // 5-year rental projection
  const year5Value = arv * Math.pow(1 + appreciation / 100, 5);
  const totalAppreciation = year5Value - arv;
  const total5YearCashFlow = annualCashFlow * 5;
  const total5YearReturn = totalAppreciation + total5YearCashFlow;
  const rental5YearROI = (total5YearReturn / totalInvestment) * 100;

  const getRecommendation = () => {
    if (flipAnnualizedROI > cashOnCashReturn * 1.5) {
      return {
        decision: "FLIP",
        color: "text-blue-600 bg-blue-50",
        icon: "🏗️",
        reason: "Flip offers significantly higher annualized returns",
      };
    } else if (rental5YearROI > flipROI * 1.3) {
      return {
        decision: "RENT",
        color: "text-green-600 bg-green-50",
        icon: "🏠",
        reason: "Rental provides better long-term wealth building",
      };
    } else {
      return {
        decision: "MIXED",
        color: "text-purple-600 bg-purple-50",
        icon: "⚖️",
        reason: "Both strategies have similar returns - consider your goals",
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Scale className="w-8 h-8 text-purple-600" />
        <h2 className="text-3xl font-bold text-gray-900">
          Flip vs. Rent Decision Calculator
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Property Details */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Property Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Price
                </label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) =>
                    setPurchasePrice(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repair/Renovation Cost
                </label>
                <input
                  type="number"
                  value={repairCost}
                  onChange={(e) =>
                    setRepairCost(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  After Repair Value (ARV)
                </label>
                <input
                  type="number"
                  value={arv}
                  onChange={(e) => setArv(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-gray-700">Total Investment</div>
                <div className="text-2xl font-bold text-purple-600">
                  ${totalInvestment.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Flip Scenario Inputs */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Home className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Flip Scenario</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holding Time (months)
                </label>
                <input
                  type="number"
                  value={flipHoldingTime}
                  onChange={(e) =>
                    setFlipHoldingTime(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closing Costs (%)
                </label>
                <input
                  type="number"
                  value={flipClosingCosts}
                  onChange={(e) =>
                    setFlipClosingCosts(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Realtor Commission (%)
                </label>
                <input
                  type="number"
                  value={realtorCommission}
                  onChange={(e) =>
                    setRealtorCommission(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rental Scenario Inputs */}
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Rental Scenario
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent
                </label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) =>
                    setMonthlyRent(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vacancy Rate (%)
                </label>
                <input
                  type="number"
                  value={vacancyRate}
                  onChange={(e) =>
                    setVacancyRate(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Management (%)
                </label>
                <input
                  type="number"
                  value={propertyManagement}
                  onChange={(e) =>
                    setPropertyManagement(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Expenses (insurance, taxes, HOA, etc.)
                </label>
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) =>
                    setMonthlyExpenses(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Appreciation (%)
                </label>
                <input
                  type="number"
                  value={appreciation}
                  onChange={(e) =>
                    setAppreciation(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Recommendation */}
          <div
            className={`rounded-xl p-6 ${recommendation.color} border-2 border-current`}
          >
            <div className="text-center">
              <div className="text-6xl mb-3">{recommendation.icon}</div>
              <h3 className="text-2xl font-bold mb-2">
                Recommendation: {recommendation.decision}
              </h3>
              <p className="text-lg">{recommendation.reason}</p>
            </div>
          </div>

          {/* Flip Results */}
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Home className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Flip Analysis</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Net Profit</div>
                <div className="text-2xl font-bold text-blue-600">
                  $
                  {flipNetProfit.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">ROI</div>
                <div className="text-2xl font-bold text-blue-600">
                  {flipROI.toFixed(1)}%
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Annualized ROI</div>
                <div className="text-2xl font-bold text-blue-600">
                  {flipAnnualizedROI.toFixed(1)}%
                </div>
              </div>

              <div className="text-xs text-gray-600 mt-2">
                Based on {flipHoldingTime} month holding period
              </div>
            </div>
          </div>

          {/* Rental Results */}
          <div className="bg-green-50 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Rental Analysis
              </h3>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Monthly Cash Flow</div>
                <div className="text-2xl font-bold text-green-600">
                  $
                  {monthlyCashFlow.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Annual Cash Flow</div>
                <div className="text-2xl font-bold text-green-600">
                  $
                  {annualCashFlow.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Cash-on-Cash Return</div>
                <div className="text-2xl font-bold text-green-600">
                  {cashOnCashReturn.toFixed(1)}%
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">5-Year Total Return</div>
                <div className="text-2xl font-bold text-green-600">
                  $
                  {total5YearReturn.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ({rental5YearROI.toFixed(1)}% ROI)
                </div>
              </div>

              <div className="text-xs text-gray-600 mt-2">
                Includes cash flow + appreciation over 5 years
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Comparison
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Immediate Return</span>
                <span className="font-semibold">
                  Flip: ${flipNetProfit.toLocaleString()} vs Rent: $
                  {annualCashFlow.toLocaleString()}/yr
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Time to Profit</span>
                <span className="font-semibold">
                  Flip: {flipHoldingTime}mo vs Rent: Ongoing
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Risk Level</span>
                <span className="font-semibold">
                  Flip: Higher vs Rent: Lower
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Long-term Wealth</span>
                <span className="font-semibold">
                  Flip: One-time vs Rent: Compounding
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
