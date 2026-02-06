import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Award,
  AlertCircle,
  Download,
  BarChart3,
  PieChart,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

interface UnderwritingInputs {
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  annualRent: number;
  vacancyRate: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  propertyManagement: number;
  utilities: number;
  hoa: number;
  appreciationRate: number;
  holdingPeriod: number;
  sellingCosts: number;
  taxRate: number;
  depreciationYears: number;
}

interface Scenario {
  name: string;
  type: "pessimistic" | "base" | "optimistic";
  color: string;
  adjustments: {
    appreciationRate: number;
    vacancyRate: number;
    rentGrowth: number;
    expenseInflation: number;
  };
}

interface CashFlow {
  year: number;
  grossRent: number;
  vacancy: number;
  netRent: number;
  expenses: number;
  debtService: number;
  beforeTax: number;
  taxBenefit: number;
  afterTax: number;
  propertyValue: number;
  equity: number;
}

interface ScenarioResults {
  scenario: Scenario;
  cashFlows: CashFlow[];
  irr: number;
  equityMultiple: number;
  totalCashInvested: number;
  exitValue: number;
  totalReturn: number;
  avgAnnualReturn: number;
  grade: "Strong Buy" | "Buy" | "Consider" | "Pass";
  gradeColor: string;
}

export const ProfessionalUnderwriting: React.FC = () => {
  const { user } = useAuthStore();
  const userTier = user?.membershipTier || "free";

  const [inputs, setInputs] = useState<UnderwritingInputs>({
    propertyPrice: 300000,
    downPayment: 20,
    interestRate: 7.5,
    loanTerm: 30,
    annualRent: 36000,
    vacancyRate: 5,
    propertyTax: 3600,
    insurance: 1200,
    maintenance: 3000,
    propertyManagement: 10,
    utilities: 0,
    hoa: 0,
    appreciationRate: 3,
    holdingPeriod: 5,
    sellingCosts: 8,
    taxRate: 25,
    depreciationYears: 27.5,
  });

  const scenarios: Scenario[] = useMemo(
    () => [
      {
        name: "Pessimistic",
        type: "pessimistic",
        color: "red",
        adjustments: {
          appreciationRate: -2,
          vacancyRate: 5,
          rentGrowth: -1,
          expenseInflation: 2,
        },
      },
      {
        name: "Base Case",
        type: "base",
        color: "blue",
        adjustments: {
          appreciationRate: 0,
          vacancyRate: 0,
          rentGrowth: 0,
          expenseInflation: 0,
        },
      },
      {
        name: "Optimistic",
        type: "optimistic",
        color: "green",
        adjustments: {
          appreciationRate: 2,
          vacancyRate: -3,
          rentGrowth: 2,
          expenseInflation: -1,
        },
      },
    ],
    [],
  );

  const calculateMonthlyPayment = useCallback(
    (principal: number, rate: number, years: number): number => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    );
    },
    [],
  );

  const calculateIRR = useCallback((cashFlows: number[]): number => {
    // Newton-Raphson method for IRR calculation
    let irr = 0.1; // Initial guess 10%
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let derivative = 0;

      cashFlows.forEach((cf, year) => {
        npv += cf / Math.pow(1 + irr, year);
        derivative -= (year * cf) / Math.pow(1 + irr, year + 1);
      });

      const newIrr = irr - npv / derivative;

      if (Math.abs(newIrr - irr) < tolerance) {
        return newIrr * 100;
      }

      irr = newIrr;
    }

    return irr * 100;
  }, []);

  const analyzeScenario = useCallback(
    (scenario: Scenario): ScenarioResults => {
    const downPaymentAmount = inputs.propertyPrice * (inputs.downPayment / 100);
    const loanAmount = inputs.propertyPrice - downPaymentAmount;
    const monthlyPayment = calculateMonthlyPayment(
      loanAmount,
      inputs.interestRate,
      inputs.loanTerm,
    );
    const annualDebtService = monthlyPayment * 12;

    const adjustedAppreciation =
      inputs.appreciationRate + scenario.adjustments.appreciationRate;
    const adjustedVacancy = Math.max(
      0,
      inputs.vacancyRate + scenario.adjustments.vacancyRate,
    );
    const rentGrowth = 2 + scenario.adjustments.rentGrowth;
    const expenseInflation = 3 + scenario.adjustments.expenseInflation;

    const cashFlows: CashFlow[] = [];
    const irrCashFlows: number[] = [-downPaymentAmount];

    let currentRent = inputs.annualRent;
    let currentExpenses =
      inputs.propertyTax +
      inputs.insurance +
      inputs.maintenance +
      inputs.utilities +
      inputs.hoa;
    let propertyValue = inputs.propertyPrice;
    let remainingBalance = loanAmount;

    for (let year = 1; year <= inputs.holdingPeriod; year++) {
      // Update values
      currentRent *= 1 + rentGrowth / 100;
      currentExpenses *= 1 + expenseInflation / 100;
      propertyValue *= 1 + adjustedAppreciation / 100;

      // Calculate cash flow
      const grossRent = currentRent;
      const vacancy = grossRent * (adjustedVacancy / 100);
      const netRent = grossRent - vacancy;
      const propertyMgmt = netRent * (inputs.propertyManagement / 100);
      const totalExpenses = currentExpenses + propertyMgmt;
      const beforeTaxCF = netRent - totalExpenses - annualDebtService;

      // Tax calculation with depreciation
      const depreciation = inputs.propertyPrice / inputs.depreciationYears;
      const taxableIncome = netRent - totalExpenses - depreciation;
      const taxBenefit =
        taxableIncome > 0
          ? -((taxableIncome * inputs.taxRate) / 100)
          : Math.abs((taxableIncome * inputs.taxRate) / 100);
      const afterTaxCF = beforeTaxCF + taxBenefit;

      // Update loan balance (simplified)
      const principal =
        monthlyPayment * 12 - (remainingBalance * inputs.interestRate) / 100;
      remainingBalance = Math.max(0, remainingBalance - principal);

      const equity = propertyValue - remainingBalance;

      cashFlows.push({
        year,
        grossRent,
        vacancy,
        netRent,
        expenses: totalExpenses,
        debtService: annualDebtService,
        beforeTax: beforeTaxCF,
        taxBenefit,
        afterTax: afterTaxCF,
        propertyValue,
        equity,
      });

      irrCashFlows.push(afterTaxCF);
    }

    // Exit calculation
    const finalYear = cashFlows[cashFlows.length - 1];
    const saleProceeds = finalYear.propertyValue;
    const sellingCosts = saleProceeds * (inputs.sellingCosts / 100);
    const netSaleProceeds = saleProceeds - sellingCosts - remainingBalance;
    const exitCashFlow = finalYear.afterTax + netSaleProceeds;
    irrCashFlows[irrCashFlows.length - 1] = exitCashFlow;

    const irr = calculateIRR(irrCashFlows);
    const totalCashReturned = irrCashFlows
      .slice(1)
      .reduce((sum, cf) => sum + cf, 0);
    const equityMultiple = totalCashReturned / downPaymentAmount;
    const totalReturn =
      ((totalCashReturned - downPaymentAmount) / downPaymentAmount) * 100;
    const avgAnnualReturn = totalReturn / inputs.holdingPeriod;

    // Grading
    let grade: "Strong Buy" | "Buy" | "Consider" | "Pass";
    let gradeColor: string;

    if (irr >= 15) {
      grade = "Strong Buy";
      gradeColor = "green";
    } else if (irr >= 10) {
      grade = "Buy";
      gradeColor = "blue";
    } else if (irr >= 5) {
      grade = "Consider";
      gradeColor = "yellow";
    } else {
      grade = "Pass";
      gradeColor = "red";
    }

    return {
      scenario,
      cashFlows,
      irr,
      equityMultiple,
      totalCashInvested: downPaymentAmount,
      exitValue: netSaleProceeds,
      totalReturn,
      avgAnnualReturn,
      grade,
      gradeColor,
    };
    },
    [calculateIRR, calculateMonthlyPayment, inputs],
  );

  const results = useMemo(() => {
    return scenarios.map(analyzeScenario);
  }, [analyzeScenario, scenarios]);

  const handleExportPDF = () => {
    toast.success("PDF export functionality coming soon!");
  };

  if (userTier !== "enterprise") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-12 text-center"
          >
            <div className="mb-6">
              <Lock className="w-20 h-20 mx-auto text-purple-600 mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Professional Underwriting
              </h2>
              <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                ⭐ ENTERPRISE TIER EXCLUSIVE
              </div>
            </div>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Unlock advanced multi-scenario analysis with IRR calculations,
              equity projections, and tax-adjusted returns for sophisticated
              real estate investments.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-purple-50 rounded-xl p-6">
                <Award className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">
                  3-Scenario Analysis
                </h3>
                <p className="text-gray-600 text-sm">
                  Pessimistic, Base, and Optimistic projections with sensitivity
                  testing
                </p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-6">
                <TrendingUp className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">IRR Calculator</h3>
                <p className="text-gray-600 text-sm">
                  Newton-Raphson method for accurate internal rate of return
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">
                  Multi-Year Projections
                </h3>
                <p className="text-gray-600 text-sm">
                  Detailed cash flow analysis over your investment horizon
                </p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-6">
                <PieChart className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">
                  Tax-Adjusted Returns
                </h3>
                <p className="text-gray-600 text-sm">
                  Includes depreciation schedules and after-tax cash flows
                </p>
              </div>
            </div>

            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              <Award className="w-6 h-6" />
              Upgrade to Enterprise
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            ⭐ ENTERPRISE TIER
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Professional Underwriting Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Multi-scenario sensitivity analysis with IRR, equity multiples, and
            tax-adjusted returns
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Investment Parameters
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">
                Property Details
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={inputs.propertyPrice}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        propertyPrice: Number(e.target.value),
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Down Payment (%)
                </label>
                <input
                  type="number"
                  value={inputs.downPayment}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      downPayment: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Rent
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={inputs.annualRent}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        annualRent: Number(e.target.value),
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Financing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">
                Financing
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.interestRate}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      interestRate: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Term (years)
                </label>
                <input
                  type="number"
                  value={inputs.loanTerm}
                  onChange={(e) =>
                    setInputs({ ...inputs, loanTerm: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vacancy Rate (%)
                </label>
                <input
                  type="number"
                  value={inputs.vacancyRate}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      vacancyRate: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">
                Annual Expenses
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Tax
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={inputs.propertyTax}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        propertyTax: Number(e.target.value),
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={inputs.insurance}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        insurance: Number(e.target.value),
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={inputs.maintenance}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        maintenance: Number(e.target.value),
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Investment Assumptions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">
                Investment Strategy
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appreciation Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.appreciationRate}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      appreciationRate: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holding Period (years)
                </label>
                <input
                  type="number"
                  value={inputs.holdingPeriod}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      holdingPeriod: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Costs (%)
                </label>
                <input
                  type="number"
                  value={inputs.sellingCosts}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      sellingCosts: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Management & Other */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">
                Management & Fees
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Mgmt (%)
                </label>
                <input
                  type="number"
                  value={inputs.propertyManagement}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      propertyManagement: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HOA Fees (annual)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={inputs.hoa}
                    onChange={(e) =>
                      setInputs({ ...inputs, hoa: Number(e.target.value) })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilities (annual)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={inputs.utilities}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        utilities: Number(e.target.value),
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Tax Assumptions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">
                Tax Assumptions
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={inputs.taxRate}
                  onChange={(e) =>
                    setInputs({ ...inputs, taxRate: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Depreciation Period
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.depreciationYears}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      depreciationYears: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scenario Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              3-Scenario Analysis
            </h2>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {results.map((result, index) => (
              <motion.div
                key={result.scenario.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`bg-gradient-to-br from-${result.scenario.color}-50 to-${result.scenario.color}-100 rounded-xl p-6 border-2 border-${result.scenario.color}-200`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {result.scenario.name}
                  </h3>
                  {result.scenario.type === "pessimistic" && (
                    <TrendingDown
                      className={`w-6 h-6 text-${result.scenario.color}-600`}
                    />
                  )}
                  {result.scenario.type === "base" && (
                    <Target
                      className={`w-6 h-6 text-${result.scenario.color}-600`}
                    />
                  )}
                  {result.scenario.type === "optimistic" && (
                    <TrendingUp
                      className={`w-6 h-6 text-${result.scenario.color}-600`}
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <div
                    className={`bg-white rounded-lg p-3 border border-${result.scenario.color}-200`}
                  >
                    <div className="text-xs text-gray-600 mb-1">
                      Internal Rate of Return
                    </div>
                    <div
                      className={`text-2xl font-bold text-${result.gradeColor}-600`}
                    >
                      {result.irr.toFixed(2)}%
                    </div>
                  </div>

                  <div
                    className={`bg-white rounded-lg p-3 border border-${result.scenario.color}-200`}
                  >
                    <div className="text-xs text-gray-600 mb-1">
                      Equity Multiple
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {result.equityMultiple.toFixed(2)}x
                    </div>
                  </div>

                  <div
                    className={`bg-white rounded-lg p-3 border border-${result.scenario.color}-200`}
                  >
                    <div className="text-xs text-gray-600 mb-1">
                      Total Return
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {result.totalReturn.toFixed(1)}%
                    </div>
                  </div>

                  <div
                    className={`bg-white rounded-lg p-3 border border-${result.scenario.color}-200`}
                  >
                    <div className="text-xs text-gray-600 mb-1">Exit Value</div>
                    <div className="text-lg font-bold text-gray-900">
                      ${result.exitValue.toLocaleString()}
                    </div>
                  </div>

                  <div
                    className={`bg-${result.gradeColor}-600 text-white rounded-lg p-3 text-center font-bold`}
                  >
                    {result.grade}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Cash Flow Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Multi-Year Cash Flow Projections
          </h2>

          {results.map((result) => (
            <div key={result.scenario.type} className="mb-8 last:mb-0">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {result.scenario.name} Scenario
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Year
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Gross Rent
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Net Rent
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Expenses
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Debt Service
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Before Tax CF
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Tax Benefit
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        After Tax CF
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Property Value
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Equity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.cashFlows.map((cf) => (
                      <tr
                        key={cf.year}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium">{cf.year}</td>
                        <td className="px-4 py-3 text-right">
                          $
                          {cf.grossRent.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          $
                          {cf.netRent.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          $
                          {cf.expenses.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          $
                          {cf.debtService.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${cf.beforeTax >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          $
                          {cf.beforeTax.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          $
                          {cf.taxBenefit.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-bold ${cf.afterTax >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          $
                          {cf.afterTax.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          $
                          {cf.propertyValue.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-purple-600">
                          $
                          {cf.equity.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Investment Disclaimer:</strong> This analysis is for
              informational purposes only and should not be considered financial
              advice. Actual results may vary significantly from projections.
              Always consult with qualified professionals before making
              investment decisions.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
