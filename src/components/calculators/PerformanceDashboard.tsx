import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Lock,
  Download,
  Target,
  Award,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";

interface PropertyPerformance {
  id: string;
  propertyName: string;
  purchasePrice: number;
  currentValue: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  mortgagePayment: number;
  acquisitionDate: string;
}

export const PerformanceDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const isEnterprise = user?.membershipTier === "enterprise";

  const [properties, setProperties] = useState<PropertyPerformance[]>([
    {
      id: "1",
      propertyName: "Maple Street Duplex",
      purchasePrice: 180000,
      currentValue: 210000,
      monthlyIncome: 2400,
      monthlyExpenses: 800,
      mortgagePayment: 950,
      acquisitionDate: "2023-01-15",
    },
    {
      id: "2",
      propertyName: "Oak Avenue Fourplex",
      purchasePrice: 420000,
      currentValue: 480000,
      monthlyIncome: 5200,
      monthlyExpenses: 1800,
      mortgagePayment: 2100,
      acquisitionDate: "2022-06-20",
    },
    {
      id: "3",
      propertyName: "Pine Boulevard Commercial",
      purchasePrice: 850000,
      currentValue: 920000,
      monthlyIncome: 9500,
      monthlyExpenses: 3200,
      mortgagePayment: 4800,
      acquisitionDate: "2021-09-10",
    },
  ]);

  const portfolioMetrics = useMemo(() => {
    if (!isEnterprise) return null;

    const totalPurchasePrice = properties.reduce(
      (sum, p) => sum + p.purchasePrice,
      0,
    );
    const totalCurrentValue = properties.reduce(
      (sum, p) => sum + p.currentValue,
      0,
    );
    const totalEquityGain = totalCurrentValue - totalPurchasePrice;
    const totalEquityGainPercent =
      totalPurchasePrice > 0 ? (totalEquityGain / totalPurchasePrice) * 100 : 0;

    const totalMonthlyIncome = properties.reduce(
      (sum, p) => sum + p.monthlyIncome,
      0,
    );
    const totalMonthlyExpenses = properties.reduce(
      (sum, p) => sum + p.monthlyExpenses,
      0,
    );
    const totalMortgagePayment = properties.reduce(
      (sum, p) => sum + p.mortgagePayment,
      0,
    );
    const totalMonthlyCashFlow =
      totalMonthlyIncome - totalMonthlyExpenses - totalMortgagePayment;

    const annualCashFlow = totalMonthlyCashFlow * 12;
    const annualIncome = totalMonthlyIncome * 12;
    const annualExpenses = totalMonthlyExpenses * 12;
    const annualDebtService = totalMortgagePayment * 12;

    // Calculate individual property metrics
    const propertyMetrics = properties.map((p) => {
      const equityGain = p.currentValue - p.purchasePrice;
      const equityGainPercent =
        p.purchasePrice > 0 ? (equityGain / p.purchasePrice) * 100 : 0;
      const monthlyCashFlow =
        p.monthlyIncome - p.monthlyExpenses - p.mortgagePayment;
      const annualCashFlow = monthlyCashFlow * 12;
      const cashOnCashReturn =
        p.purchasePrice > 0
          ? (annualCashFlow / (p.purchasePrice * 0.25)) * 100
          : 0; // Assuming 25% down
      const capRate =
        p.purchasePrice > 0
          ? ((p.monthlyIncome * 12 - p.monthlyExpenses * 12) /
              p.purchasePrice) *
            100
          : 0;

      const monthsHeld = calculateMonthsHeld(p.acquisitionDate);
      const totalCashFlowToDate = monthlyCashFlow * monthsHeld;
      const totalReturn = equityGain + totalCashFlowToDate;
      const totalReturnPercent =
        p.purchasePrice > 0
          ? (totalReturn / (p.purchasePrice * 0.25)) * 100
          : 0;

      return {
        ...p,
        equityGain,
        equityGainPercent,
        monthlyCashFlow,
        annualCashFlow,
        cashOnCashReturn,
        capRate,
        monthsHeld,
        totalCashFlowToDate,
        totalReturn,
        totalReturnPercent,
      };
    });

    // Best and worst performers
    const sortedByROI = [...propertyMetrics].sort(
      (a, b) => b.totalReturnPercent - a.totalReturnPercent,
    );
    const bestPerformer = sortedByROI[0];
    const worstPerformer = sortedByROI[sortedByROI.length - 1];

    // Portfolio health score (0-100)
    let healthScore = 50;
    if (totalMonthlyCashFlow > 0) healthScore += 20;
    if (totalEquityGainPercent > 10) healthScore += 15;
    if (totalMonthlyCashFlow / totalMonthlyIncome > 0.2) healthScore += 15;
    healthScore = Math.min(100, healthScore);

    return {
      totalPurchasePrice,
      totalCurrentValue,
      totalEquityGain,
      totalEquityGainPercent,
      totalMonthlyIncome,
      totalMonthlyExpenses,
      totalMortgagePayment,
      totalMonthlyCashFlow,
      annualCashFlow,
      annualIncome,
      annualExpenses,
      annualDebtService,
      propertyMetrics,
      bestPerformer,
      worstPerformer,
      healthScore,
      propertyCount: properties.length,
    };
  }, [properties, isEnterprise]);

  const calculateMonthsHeld = (acquisitionDate: string) => {
    const acquired = new Date(acquisitionDate);
    const now = new Date();
    const months =
      (now.getFullYear() - acquired.getFullYear()) * 12 +
      (now.getMonth() - acquired.getMonth());
    return Math.max(1, months);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  // Enterprise Lock Overlay
  const EnterpriseLock = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-md rounded-xl flex items-center justify-center z-50">
      <div className="text-center px-8 py-12 bg-white rounded-2xl shadow-2xl max-w-2xl mx-4">
        <div className="mb-6">
          <Lock className="w-20 h-20 text-purple-600 mx-auto mb-4" />
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold mb-4">
            ENTERPRISE EXCLUSIVE
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Portfolio Performance Dashboard
        </h2>
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          Track and optimize your entire real estate portfolio with:
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">Multi-property tracking</span>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">Real-time portfolio metrics</span>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">Equity gain tracking</span>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">Cash flow analysis</span>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">Performance comparisons</span>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">Portfolio health score</span>
          </div>
        </div>
        <Link
          to="/pricing"
          className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Upgrade to Enterprise
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          Manage multiple properties like a professional investor
        </p>
      </div>
    </div>
  );

  if (!isEnterprise) {
    return (
      <div className="max-w-7xl mx-auto relative min-h-screen">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden opacity-50">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white px-6 py-12">
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="w-10 h-10" />
              <h2 className="text-4xl font-bold">
                Portfolio Performance Dashboard
              </h2>
            </div>
            <p className="text-purple-100 text-lg">
              Track and optimize your real estate portfolio performance
            </p>
          </div>
          <div className="p-12 space-y-6 blur-sm">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-100 h-32 rounded-lg animate-pulse"></div>
              <div className="bg-gray-100 h-32 rounded-lg animate-pulse"></div>
              <div className="bg-gray-100 h-32 rounded-lg animate-pulse"></div>
              <div className="bg-gray-100 h-32 rounded-lg animate-pulse"></div>
            </div>
            <div className="bg-gray-100 h-64 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 h-48 rounded-lg animate-pulse"></div>
              <div className="bg-gray-100 h-48 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
        <EnterpriseLock />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-purple-200">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <BarChart3 className="w-10 h-10" />
                <h2 className="text-4xl font-bold">
                  Portfolio Performance Dashboard
                </h2>
              </div>
              <p className="text-purple-100 text-lg mb-4">
                Real-time tracking and analysis of your investment portfolio
              </p>
              <div className="inline-block px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="font-bold text-yellow-300">
                  ⭐ ENTERPRISE EXCLUSIVE
                </span>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all shadow-lg">
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-100" />
                <span className="text-3xl font-bold">
                  {portfolioMetrics!.propertyCount}
                </span>
              </div>
              <p className="text-blue-100 text-sm font-medium">Properties</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(portfolioMetrics!.totalCurrentValue)}
              </p>
              <p className="text-blue-200 text-xs mt-1">
                Total Portfolio Value
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-100" />
                <span
                  className={`text-2xl font-bold ${portfolioMetrics!.totalEquityGain >= 0 ? "" : "text-red-300"}`}
                >
                  {formatPercent(portfolioMetrics!.totalEquityGainPercent)}
                </span>
              </div>
              <p className="text-green-100 text-sm font-medium">Equity Gain</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(portfolioMetrics!.totalEquityGain)}
              </p>
              <p className="text-green-200 text-xs mt-1">Total Appreciation</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-purple-100" />
                <span
                  className={`text-2xl font-bold ${portfolioMetrics!.totalMonthlyCashFlow >= 0 ? "" : "text-red-300"}`}
                >
                  /mo
                </span>
              </div>
              <p className="text-purple-100 text-sm font-medium">
                Monthly Cash Flow
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(portfolioMetrics!.totalMonthlyCashFlow)}
              </p>
              <p className="text-purple-200 text-xs mt-1">
                {formatCurrency(portfolioMetrics!.annualCashFlow)}/year
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-pink-100" />
                <span className="text-3xl font-bold">
                  {Math.round(portfolioMetrics!.healthScore)}
                </span>
              </div>
              <p className="text-pink-100 text-sm font-medium">
                Portfolio Health
              </p>
              <div className="mt-2 bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${portfolioMetrics!.healthScore}%` }}
                ></div>
              </div>
              <p className="text-pink-200 text-xs mt-1">
                {portfolioMetrics!.healthScore >= 80
                  ? "Excellent"
                  : portfolioMetrics!.healthScore >= 60
                    ? "Good"
                    : portfolioMetrics!.healthScore >= 40
                      ? "Fair"
                      : "Needs Attention"}
              </p>
            </div>
          </div>

          {/* Income vs Expenses Breakdown */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                Annual Income Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-gray-700 font-medium">
                    Gross Income
                  </span>
                  <span className="font-bold text-green-600 text-xl">
                    {formatCurrency(portfolioMetrics!.annualIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-gray-700 font-medium">
                    Operating Expenses
                  </span>
                  <span className="font-bold text-orange-600 text-xl">
                    -{formatCurrency(portfolioMetrics!.annualExpenses)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-gray-700 font-medium">
                    Debt Service
                  </span>
                  <span className="font-bold text-red-600 text-xl">
                    -{formatCurrency(portfolioMetrics!.annualDebtService)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-900 font-bold text-lg">
                    Net Cash Flow
                  </span>
                  <span
                    className={`font-bold text-2xl ${portfolioMetrics!.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(portfolioMetrics!.annualCashFlow)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="w-6 h-6 mr-2 text-blue-600" />
                Top & Bottom Performers
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-green-800">
                      🏆 BEST PERFORMER
                    </span>
                    <span className="text-green-600 font-bold">
                      {formatPercent(
                        portfolioMetrics!.bestPerformer.totalReturnPercent,
                      )}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">
                    {portfolioMetrics!.bestPerformer.propertyName}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-gray-600">Cash Flow:</span>
                      <span className="font-semibold ml-1">
                        {formatCurrency(
                          portfolioMetrics!.bestPerformer.monthlyCashFlow,
                        )}
                        /mo
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Equity:</span>
                      <span className="font-semibold ml-1">
                        {formatCurrency(
                          portfolioMetrics!.bestPerformer.equityGain,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-red-800">
                      ⚠️ NEEDS ATTENTION
                    </span>
                    <span className="text-red-600 font-bold">
                      {formatPercent(
                        portfolioMetrics!.worstPerformer.totalReturnPercent,
                      )}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">
                    {portfolioMetrics!.worstPerformer.propertyName}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-gray-600">Cash Flow:</span>
                      <span className="font-semibold ml-1">
                        {formatCurrency(
                          portfolioMetrics!.worstPerformer.monthlyCashFlow,
                        )}
                        /mo
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Equity:</span>
                      <span className="font-semibold ml-1">
                        {formatCurrency(
                          portfolioMetrics!.worstPerformer.equityGain,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Property Performance Table */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4">
              <h3 className="text-xl font-bold flex items-center">
                <PieChart className="w-6 h-6 mr-2" />
                Individual Property Performance
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Property
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gray-700">
                      Purchase Price
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gray-700">
                      Current Value
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gray-700">
                      Equity Gain
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gray-700">
                      Monthly CF
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gray-700">
                      CoC Return
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gray-700">
                      Cap Rate
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-gray-700">
                      Total Return
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolioMetrics!.propertyMetrics.map((property, index) => (
                    <tr
                      key={property.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {property.propertyName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {property.monthsHeld} months held
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(property.purchasePrice)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-blue-600">
                        {formatCurrency(property.currentValue)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div>
                          <p
                            className={`font-bold ${property.equityGain >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(property.equityGain)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPercent(property.equityGainPercent)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={`font-bold ${property.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(property.monthlyCashFlow)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-purple-600">
                        {formatPercent(property.cashOnCashReturn)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-indigo-600">
                        {formatPercent(property.capRate)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div>
                          <p
                            className={`font-bold text-lg ${property.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(property.totalReturn)}
                          </p>
                          <p className="text-sm font-semibold text-gray-600">
                            {formatPercent(property.totalReturnPercent)}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gradient-to-r from-gray-100 to-gray-200 border-t-2 border-gray-400">
                  <tr>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      PORTFOLIO TOTALS
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-gray-900">
                      {formatCurrency(portfolioMetrics!.totalPurchasePrice)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-blue-600">
                      {formatCurrency(portfolioMetrics!.totalCurrentValue)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-green-600">
                      {formatCurrency(portfolioMetrics!.totalEquityGain)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-green-600">
                      {formatCurrency(portfolioMetrics!.totalMonthlyCashFlow)}
                    </td>
                    <td
                      colSpan={3}
                      className="px-4 py-4 text-center text-gray-500 italic"
                    >
                      Individual metrics vary by property
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
