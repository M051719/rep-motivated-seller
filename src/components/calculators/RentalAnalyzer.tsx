import React, { useState, useMemo } from 'react';
import { Calculator, Home, DollarSign, Users, TrendingUp, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

interface RentalInputs {
  // Purchase
  purchasePrice: number;
  closingCosts: number;
  repairCosts: number;
  
  // Income
  monthlyRent: number;
  otherMonthlyIncome: number;
  vacancyRate: number;
  
  // Expenses
  propertyTax: number;
  insurance: number;
  hoaFees: number;
  maintenance: number;
  propertyManagement: number;
  utilities: number;
  
  // Financing
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  
  // Advanced (Pro Only)
  appreciationRate?: number;
  incomeGrowthRate?: number;
  expenseGrowthRate?: number;
  sellingCostsPercent?: number;
  holdingYears?: number;
}

interface RentalAnalyzerProps {
  mode?: 'basic' | 'full';
}

export const RentalAnalyzer: React.FC<RentalAnalyzerProps> = ({ mode = 'basic' }) => {
  const { user } = useAuthStore();
  const isProOrEnterprise = user?.membershipTier === 'pro' || user?.membershipTier === 'enterprise';
  const showAdvanced = mode === 'full' && isProOrEnterprise;

  const [inputs, setInputs] = useState<RentalInputs>({
    purchasePrice: 200000,
    closingCosts: 4000,
    repairCosts: 10000,
    monthlyRent: 1800,
    otherMonthlyIncome: 0,
    vacancyRate: 5,
    propertyTax: 2400,
    insurance: 1200,
    hoaFees: 0,
    maintenance: 150,
    propertyManagement: 10,
    utilities: 0,
    downPaymentPercent: 25,
    interestRate: 7.5,
    loanTermYears: 30,
    // Advanced
    appreciationRate: 3,
    incomeGrowthRate: 2,
    expenseGrowthRate: 3,
    sellingCostsPercent: 8,
    holdingYears: 5,
  });

  const results = useMemo(() => {
    const {
      purchasePrice,
      closingCosts,
      repairCosts,
      monthlyRent,
      otherMonthlyIncome,
      vacancyRate,
      propertyTax,
      insurance,
      hoaFees,
      maintenance,
      propertyManagement,
      utilities,
      downPaymentPercent,
      interestRate,
      loanTermYears,
    } = inputs;

    // Total Investment
    const downPayment = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPayment;
    const totalInvestment = downPayment + closingCosts + repairCosts;

    // Monthly Mortgage Payment
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    const monthlyMortgage = loanAmount > 0
      ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : 0;

    // Monthly Income
    const grossMonthlyIncome = monthlyRent + otherMonthlyIncome;
    const vacancyLoss = grossMonthlyIncome * (vacancyRate / 100);
    const effectiveMonthlyIncome = grossMonthlyIncome - vacancyLoss;

    // Monthly Expenses
    const propertyManagementFee = grossMonthlyIncome * (propertyManagement / 100);
    const monthlyPropertyTax = propertyTax / 12;
    const monthlyInsurance = insurance / 12;
    const monthlyHOA = hoaFees / 12;
    
    const totalMonthlyExpenses =
      monthlyMortgage +
      monthlyPropertyTax +
      monthlyInsurance +
      monthlyHOA +
      maintenance +
      propertyManagementFee +
      utilities;

    // Cash Flow
    const monthlyCashFlow = effectiveMonthlyIncome - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    // Key Metrics
    const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
    const capRate = purchasePrice > 0 ? ((annualCashFlow + monthlyMortgage * 12) / purchasePrice) * 100 : 0;
    const grossRentMultiplier = monthlyRent > 0 ? purchasePrice / (monthlyRent * 12) : 0;
    const debtServiceCoverageRatio = (monthlyMortgage > 0) ? effectiveMonthlyIncome / monthlyMortgage : 0;
    const onePercentRule = monthlyRent / purchasePrice * 100;

    // Advanced calculations (Pro only)
    let futureValue = purchasePrice;
    let totalAppreciation = 0;
    let projectedEquity = 0;
    let projectedCashFlow = annualCashFlow;

    if (showAdvanced && inputs.appreciationRate && inputs.holdingYears) {
      futureValue = purchasePrice * Math.pow(1 + inputs.appreciationRate / 100, inputs.holdingYears);
      totalAppreciation = futureValue - purchasePrice;
      
      // Calculate remaining loan balance
      const monthsHeld = inputs.holdingYears * 12;
      let balance = loanAmount;
      for (let i = 0; i < monthsHeld; i++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyMortgage - interestPayment;
        balance -= principalPayment;
      }
      projectedEquity = futureValue - balance;

      // Project future cash flow with growth rates
      if (inputs.incomeGrowthRate && inputs.expenseGrowthRate) {
        const futureIncome = effectiveMonthlyIncome * Math.pow(1 + inputs.incomeGrowthRate / 100, inputs.holdingYears);
        const futureExpenses = (totalMonthlyExpenses - monthlyMortgage) * Math.pow(1 + inputs.expenseGrowthRate / 100, inputs.holdingYears);
        projectedCashFlow = (futureIncome - futureExpenses - monthlyMortgage) * 12;
      }
    }

    return {
      totalInvestment,
      downPayment,
      loanAmount,
      monthlyMortgage,
      grossMonthlyIncome,
      effectiveMonthlyIncome,
      vacancyLoss,
      totalMonthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCashReturn,
      capRate,
      grossRentMultiplier,
      debtServiceCoverageRatio,
      onePercentRule,
      // Advanced
      futureValue,
      totalAppreciation,
      projectedEquity,
      projectedCashFlow,
      propertyManagementFee,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyHOA,
    };
  }, [inputs, showAdvanced]);

  const updateInput = (key: keyof RentalInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Pro Feature Lock Overlay
  const ProFeatureLock = () => (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
      <div className="text-center px-6 py-8 bg-white rounded-xl shadow-2xl max-w-md">
        <Lock className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Feature</h3>
        <p className="text-gray-600 mb-6">
          Unlock advanced rental analysis with 5-year projections, appreciation tracking, and cash flow forecasting
        </p>
        <Link
          to="/pricing"
          className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Home className="w-8 h-8" />
                <h2 className="text-3xl font-bold">
                  Rental Property Analyzer {mode === 'full' ? '(Full)' : '(Basic)'}
                </h2>
              </div>
              <p className="text-green-100">
                {mode === 'full' 
                  ? 'Advanced rental analysis with projections and growth modeling'
                  : 'Calculate cash flow, ROI, and key rental property metrics'}
              </p>
            </div>
            {mode === 'full' && !isProOrEnterprise && (
              <div className="bg-white/20 px-4 py-2 rounded-lg flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span className="font-semibold">Pro Feature</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 p-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Purchase Section */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-center space-x-2 mb-4">
                <Home className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Purchase Details</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    value={inputs.purchasePrice}
                    onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Costs</label>
                  <input
                    type="number"
                    value={inputs.closingCosts}
                    onChange={(e) => updateInput('closingCosts', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repair Costs</label>
                  <input
                    type="number"
                    value={inputs.repairCosts}
                    onChange={(e) => updateInput('repairCosts', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Income Section */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Monthly Income</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent</label>
                  <input
                    type="number"
                    value={inputs.monthlyRent}
                    onChange={(e) => updateInput('monthlyRent', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Monthly Income</label>
                  <input
                    type="number"
                    value={inputs.otherMonthlyIncome}
                    onChange={(e) => updateInput('otherMonthlyIncome', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vacancy Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.vacancyRate}
                    onChange={(e) => updateInput('vacancyRate', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Annual/Monthly Expenses</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Tax (Annual)</label>
                  <input
                    type="number"
                    value={inputs.propertyTax}
                    onChange={(e) => updateInput('propertyTax', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance (Annual)</label>
                  <input
                    type="number"
                    value={inputs.insurance}
                    onChange={(e) => updateInput('insurance', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HOA Fees (Annual)</label>
                  <input
                    type="number"
                    value={inputs.hoaFees}
                    onChange={(e) => updateInput('hoaFees', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance (Monthly)</label>
                  <input
                    type="number"
                    value={inputs.maintenance}
                    onChange={(e) => updateInput('maintenance', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Management (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.propertyManagement}
                    onChange={(e) => updateInput('propertyManagement', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Utilities (Monthly)</label>
                  <input
                    type="number"
                    value={inputs.utilities}
                    onChange={(e) => updateInput('utilities', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Financing Section */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Financing</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment (%)</label>
                  <input
                    type="number"
                    value={inputs.downPaymentPercent}
                    onChange={(e) => updateInput('downPaymentPercent', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.interestRate}
                    onChange={(e) => updateInput('interestRate', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (Years)</label>
                  <input
                    type="number"
                    value={inputs.loanTermYears}
                    onChange={(e) => updateInput('loanTermYears', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Section (Pro Only) */}
            {mode === 'full' && (
              <div className="bg-gray-50 rounded-lg p-5 relative">
                {!isProOrEnterprise && <ProFeatureLock />}
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Advanced Projections</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appreciation Rate (%/year)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.appreciationRate}
                      onChange={(e) => updateInput('appreciationRate', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isProOrEnterprise}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Income Growth Rate (%/year)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.incomeGrowthRate}
                      onChange={(e) => updateInput('incomeGrowthRate', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isProOrEnterprise}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expense Growth Rate (%/year)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.expenseGrowthRate}
                      onChange={(e) => updateInput('expenseGrowthRate', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isProOrEnterprise}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Holding Period (Years)</label>
                    <input
                      type="number"
                      value={inputs.holdingYears}
                      onChange={(e) => updateInput('holdingYears', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isProOrEnterprise}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cash Flow Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Monthly Cash Flow</p>
                  <p className={`text-2xl font-bold ${results.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(results.monthlyCashFlow)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Annual Cash Flow</p>
                  <p className={`text-2xl font-bold ${results.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(results.annualCashFlow)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Cash on Cash ROI</p>
                  <p className={`text-xl font-bold ${results.cashOnCashReturn >= 8 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatPercent(results.cashOnCashReturn)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Cap Rate</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatPercent(results.capRate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Investment Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Investment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Down Payment</span>
                  <span className="font-semibold">{formatCurrency(results.downPayment)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Closing + Repairs</span>
                  <span className="font-semibold">{formatCurrency(inputs.closingCosts + inputs.repairCosts)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                  <span className="font-bold text-gray-900">Total Investment</span>
                  <span className="font-bold text-lg">{formatCurrency(results.totalInvestment)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-700">Loan Amount</span>
                  <span className="font-semibold">{formatCurrency(results.loanAmount)}</span>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b bg-green-50 p-2 rounded">
                  <span className="font-semibold text-green-800">Gross Income</span>
                  <span className="font-bold text-green-600">{formatCurrency(results.grossMonthlyIncome)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700 ml-4">- Vacancy Loss ({inputs.vacancyRate}%)</span>
                  <span className="text-red-600">-{formatCurrency(results.vacancyLoss)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b bg-blue-50 p-2 rounded">
                  <span className="font-semibold text-blue-800">Effective Income</span>
                  <span className="font-bold text-blue-600">{formatCurrency(results.effectiveMonthlyIncome)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Mortgage (P&I)</span>
                  <span className="font-semibold">{formatCurrency(results.monthlyMortgage)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Property Tax</span>
                  <span className="font-semibold">{formatCurrency(results.monthlyPropertyTax)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Insurance</span>
                  <span className="font-semibold">{formatCurrency(results.monthlyInsurance)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Maintenance</span>
                  <span className="font-semibold">{formatCurrency(inputs.maintenance)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Property Management</span>
                  <span className="font-semibold">{formatCurrency(results.propertyManagementFee)}</span>
                </div>
                {inputs.utilities > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-700">Utilities</span>
                    <span className="font-semibold">{formatCurrency(inputs.utilities)}</span>
                  </div>
                )}
                {results.monthlyHOA > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-700">HOA Fees</span>
                    <span className="font-semibold">{formatCurrency(results.monthlyHOA)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                  <span className="font-bold text-gray-900">Total Expenses</span>
                  <span className="font-bold text-lg">{formatCurrency(results.totalMonthlyExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Key Ratios */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Key Investment Ratios</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">1% Rule</span>
                  <span className={`font-semibold ${results.onePercentRule >= 1 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatPercent(results.onePercentRule)} {results.onePercentRule >= 1 ? '✅' : '⚠️'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Debt Service Coverage</span>
                  <span className={`font-semibold ${results.debtServiceCoverageRatio >= 1.25 ? 'text-green-600' : 'text-orange-600'}`}>
                    {results.debtServiceCoverageRatio.toFixed(2)}x {results.debtServiceCoverageRatio >= 1.25 ? '✅' : '⚠️'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-700">Gross Rent Multiplier</span>
                  <span className="font-semibold">{results.grossRentMultiplier.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Advanced Results (Pro Only) */}
            {mode === 'full' && showAdvanced && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
                  {inputs.holdingYears}-Year Projections
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Future Property Value</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(results.futureValue)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Total Appreciation</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(results.totalAppreciation)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Projected Equity</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(results.projectedEquity)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Future Annual Cash Flow</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(results.projectedCashFlow)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Deal Assessment */}
            <div className={`rounded-lg p-6 ${
              results.cashOnCashReturn >= 10 && results.monthlyCashFlow > 0 ? 'bg-green-100 border-2 border-green-400' :
              results.cashOnCashReturn >= 6 && results.monthlyCashFlow > 0 ? 'bg-yellow-100 border-2 border-yellow-400' :
              'bg-red-100 border-2 border-red-400'
            }`}>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Investment Assessment</h3>
              <p className="text-gray-700">
                {results.cashOnCashReturn >= 10 && results.monthlyCashFlow > 0 
                  ? '✅ Excellent rental property! Strong cash flow and solid returns.' :
                 results.cashOnCashReturn >= 6 && results.monthlyCashFlow > 0 
                  ? '⚠️ Decent rental. Acceptable returns but look for better opportunities.' :
                 results.monthlyCashFlow > 0
                  ? '❌ Marginal deal. Low returns - negotiate better terms or pass.' :
                  '🚫 Negative cash flow! This property will cost you money each month.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
