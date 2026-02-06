import React, { useState } from "react";
import {
  Calculator,
  Home,
  DollarSign,
  TrendingUp,
  Building,
  BarChart3,
  PieChart,
  Wrench,
  Scale,
  Percent,
  Wallet,
  Shield,
} from "lucide-react";
import { FlipAnalyzer } from "../components/calculators/FlipAnalyzer";
import { AmortizationCalculator } from "../components/calculators/AmortizationCalculator";
import { RentalAnalyzer } from "../components/calculators/RentalAnalyzer";
import { RentalAnalyzerFull } from "../components/calculators/RentalAnalyzerFull";
import { ProfessionalUnderwriting } from "../components/calculators/ProfessionalUnderwriting";
import { UnderwritingAnalyzer } from "../components/calculators/UnderwritingAnalyzer";
import { PerformanceDashboard } from "../components/calculators/PerformanceDashboard";
import { RepairEstimator } from "../components/calculators/RepairEstimator";
import { FlipVsRentCalculator } from "../components/calculators/FlipVsRentCalculator";
import { ROICalculator } from "../components/calculators/ROICalculator";
import { CapRateCalculator } from "../components/calculators/CapRateCalculator";
import { CashOnCashCalculator } from "../components/calculators/CashOnCashCalculator";
import { DSCRCalculator } from "../components/calculators/DSCRCalculator";

type CalculatorTab =
  | "flip"
  | "rental-basic"
  | "rental-full"
  | "amortization"
  | "underwriting"
  | "performance"
  | "repair"
  | "flip-vs-rent"
  | "roi"
  | "cap-rate"
  | "cash-on-cash"
  | "dscr";

const CalculatorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>("flip");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Calculator className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Real Estate Investment Calculators
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional tools to analyze deals, calculate returns, and make
            informed investment decisions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex flex-wrap bg-white rounded-xl shadow-lg p-1.5 gap-2 max-w-4xl">
            <button
              onClick={() => setActiveTab("flip")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "flip"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Flip Analyzer</span>
            </button>
            <button
              onClick={() => setActiveTab("rental-basic")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "rental-basic"
                  ? "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Building className="w-5 h-5" />
              <span>Rental (Basic)</span>
            </button>
            <button
              onClick={() => setActiveTab("rental-full")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "rental-full"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Rental (Full)</span>
            </button>
            <button
              onClick={() => setActiveTab("amortization")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "amortization"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Amortization</span>
            </button>
            <button
              onClick={() => setActiveTab("underwriting")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "underwriting"
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Underwriting ⭐</span>
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "performance"
                  ? "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <PieChart className="w-5 h-5" />
              <span>Portfolio ⭐</span>
            </button>
            <button
              onClick={() => setActiveTab("repair")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "repair"
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Wrench className="w-5 h-5" />
              <span>Repair Costs</span>
            </button>
            <button
              onClick={() => setActiveTab("flip-vs-rent")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "flip-vs-rent"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Scale className="w-5 h-5" />
              <span>Flip vs Rent</span>
            </button>
            <button
              onClick={() => setActiveTab("roi")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "roi"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Percent className="w-5 h-5" />
              <span>ROI</span>
            </button>
            <button
              onClick={() => setActiveTab("cap-rate")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "cap-rate"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Building className="w-5 h-5" />
              <span>Cap Rate</span>
            </button>
            <button
              onClick={() => setActiveTab("cash-on-cash")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "cash-on-cash"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span>Cash-on-Cash</span>
            </button>
            <button
              onClick={() => setActiveTab("dscr")}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "dscr"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>DSCR</span>
            </button>
          </div>
        </div>

        {/* Calculator Content */}
        <div className="mb-12">
          {activeTab === "flip" && <FlipAnalyzer />}
          {activeTab === "rental-basic" && <RentalAnalyzer mode="basic" />}
          {activeTab === "rental-full" && <RentalAnalyzerFull />}
          {activeTab === "amortization" && <AmortizationCalculator />}
          {activeTab === "underwriting" && <ProfessionalUnderwriting />}
          {activeTab === "performance" && <PerformanceDashboard />}
          {activeTab === "repair" && <RepairEstimator />}
          {activeTab === "flip-vs-rent" && <FlipVsRentCalculator />}
          {activeTab === "roi" && <ROICalculator />}
          {activeTab === "cap-rate" && <CapRateCalculator />}
          {activeTab === "cash-on-cash" && <CashOnCashCalculator />}
          {activeTab === "dscr" && <DSCRCalculator />}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            About These Tools
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg text-blue-600 mb-2">
                Flip Analyzer
              </h3>
              <p>
                Comprehensive deal analysis for fix-and-flip investments.
                Calculate purchase costs, repair budgets, holding expenses,
                financing costs, and projected profits. Get instant ROI
                calculations and deal assessments to make confident investment
                decisions.
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Free for all members
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-green-600 mb-2">
                Rental Property Analyzer (Basic)
              </h3>
              <p>
                Analyze rental property cash flow, ROI, and key investment
                metrics. Calculate monthly expenses, vacancy rates, property
                management fees, and determine if a rental property meets your
                investment criteria with essential metrics like the 1% rule and
                cap rate.
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Free for all members
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-emerald-600 mb-2">
                Rental Property Analyzer (Full)
              </h3>
              <p>
                Advanced rental analysis with 5-year projections, appreciation
                modeling, income growth tracking, and equity building forecasts.
                Includes all basic features plus sophisticated long-term wealth
                building analysis for serious investors.
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-semibold">
                Pro & Enterprise Only
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-purple-600 mb-2">
                Amortization Calculator
              </h3>
              <p>
                Detailed loan amortization schedules showing monthly payments,
                principal/interest breakdown, and remaining balance over time.
                Visualize how your loan pays down and plan your financing
                strategy with complete transparency.
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Free for all members
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-indigo-600 mb-2 flex items-center">
                Professional Underwriting Analysis ⭐
              </h3>
              <p>
                Institutional-grade commercial real estate underwriting software
                with three-scenario sensitivity analysis, tax-adjusted cash flow
                projections, IRR and equity multiple calculations, exit strategy
                modeling, and professional PDF reports. Includes break-even
                analysis, DSCR calculations, and investment recommendations
                based on institutional standards.
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-bold">
                ⭐ Enterprise Exclusive
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-green-600 mb-2">
                ROI Calculator
              </h3>
              <p>
                Calculate total and annualized Return on Investment for your
                properties. Determine how much profit you're making relative to
                your initial investment, with clear breakdowns and performance
                grading to help you benchmark against industry standards.
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Free for all members
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-blue-600 mb-2">
                Cap Rate Calculator
              </h3>
              <p>
                Calculate capitalization rates to quickly assess rental property
                values. Analyze Net Operating Income (NOI), expense ratios, and
                compare cap rates across different markets. Essential for
                understanding property valuations and making purchase decisions.
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Free for all members
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-purple-600 mb-2">
                Cash-on-Cash Return Calculator
              </h3>
              <p>
                Measure annual pre-tax cash flow relative to your total cash
                investment. Essential for evaluating leveraged real estate deals
                and comparing cash flow performance across different investment
                opportunities. Includes payback period analysis and investment
                grading.
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Free for all members
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-indigo-600 mb-2">
                DSCR Calculator
              </h3>
              <p>
                Calculate Debt Service Coverage Ratio to determine if a property
                generates sufficient income to cover its mortgage payments.
                Critical for securing investment property financing - most
                lenders require minimum DSCR of 1.20-1.25x. Includes NOI
                calculation and lender requirement guide.
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Free for all members
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-pink-600 mb-2 flex items-center">
                Portfolio Performance Dashboard ⭐
              </h3>
              <p>
                Track and optimize your entire real estate portfolio with
                multi-property performance tracking, real-time metrics, equity
                gain analysis, cash flow aggregation, best/worst performer
                identification, and portfolio health scoring. Monitor individual
                property performance with detailed metrics including CoC
                returns, cap rates, and total returns. Perfect for managing
                multiple properties and identifying optimization opportunities.
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold">
                ⭐ Enterprise Exclusive
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                💡 <strong>Pro Tip:</strong> Start with the appropriate analyzer
                for your deal type (flip or rental), then use the Amortization
                Calculator to model different financing scenarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorsPage;
