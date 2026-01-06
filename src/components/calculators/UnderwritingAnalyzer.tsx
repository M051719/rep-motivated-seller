import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, FileText, Lock, Download, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

interface UnderwritingInputs {
  // Property Details
  propertyAddress: string;
  propertyType: 'single-family' | 'multi-family' | 'commercial' | 'mixed-use';
  yearBuilt: number;
  squareFeet: number;
  units: number;
  
  // Acquisition
  purchasePrice: number;
  closingCosts: number;
  dueDiligenceCosts: number;
  
  // Capital Improvements
  immediateRepairs: number;
  capitalExpenditures: number;
  contingencyReserve: number;
  
  // Income Analysis
  grossScheduledIncome: number;
  otherIncome: number;
  vacancyRate: number;
  creditLossRate: number;
  
  // Operating Expenses
  propertyTaxes: number;
  insurance: number;
  utilities: number;
  maintenance: number;
  payroll: number;
  propertyManagement: number;
  professionalFees: number;
  marketing: number;
  reserves: number;
  
  // Financing
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  loanPoints: number;
  amortizationYears: number;
  
  // Exit Strategy
  holdingPeriod: number;
  appreciationRate: number;
  exitCapRate: number;
  sellingCosts: number;
  
  // Tax Considerations
  depreciationPeriod: number;
  taxBracket: number;
  
  // Sensitivity Analysis
  pessimisticVacancy: number;
  optimisticVacancy: number;
  pessimisticExpenseIncrease: number;
  optimisticExpenseDecrease: number;
}

export const UnderwritingAnalyzer: React.FC = () => {
  const { user } = useAuthStore();
  const isEnterprise = user?.membershipTier === 'enterprise';

  const [inputs, setInputs] = useState<UnderwritingInputs>({
    propertyAddress: '123 Main Street, City, State',
    propertyType: 'multi-family',
    yearBuilt: 2005,
    squareFeet: 8000,
    units: 8,
    
    purchasePrice: 1200000,
    closingCosts: 36000,
    dueDiligenceCosts: 15000,
    
    immediateRepairs: 50000,
    capitalExpenditures: 75000,
    contingencyReserve: 25000,
    
    grossScheduledIncome: 144000,
    otherIncome: 12000,
    vacancyRate: 5,
    creditLossRate: 2,
    
    propertyTaxes: 18000,
    insurance: 12000,
    utilities: 9600,
    maintenance: 14400,
    payroll: 0,
    propertyManagement: 7,
    professionalFees: 3000,
    marketing: 2400,
    reserves: 7200,
    
    loanAmount: 900000,
    interestRate: 7.0,
    loanTermYears: 30,
    loanPoints: 1.5,
    amortizationYears: 30,
    
    holdingPeriod: 7,
    appreciationRate: 3.5,
    exitCapRate: 6.5,
    sellingCosts: 6,
    
    depreciationPeriod: 27.5,
    taxBracket: 35,
    
    pessimisticVacancy: 15,
    optimisticVacancy: 3,
    pessimisticExpenseIncrease: 10,
    optimisticExpenseDecrease: 5,
  });

  const results = useMemo(() => {
    if (!isEnterprise) {
      return null;
    }

    const {
      purchasePrice,
      closingCosts,
      dueDiligenceCosts,
      immediateRepairs,
      capitalExpenditures,
      contingencyReserve,
      grossScheduledIncome,
      otherIncome,
      vacancyRate,
      creditLossRate,
      propertyTaxes,
      insurance,
      utilities,
      maintenance,
      payroll,
      propertyManagement,
      professionalFees,
      marketing,
      reserves,
      loanAmount,
      interestRate,
      loanTermYears,
      loanPoints,
      holdingPeriod,
      appreciationRate,
      exitCapRate,
      sellingCosts,
      depreciationPeriod,
      taxBracket,
      pessimisticVacancy,
      optimisticVacancy,
      pessimisticExpenseIncrease,
      optimisticExpenseDecrease,
    } = inputs;

    // Total Capital Required
    const totalAcquisitionCost = purchasePrice + closingCosts + dueDiligenceCosts;
    const totalCapitalImprovements = immediateRepairs + capitalExpenditures + contingencyReserve;
    const loanPointsCost = loanAmount * (loanPoints / 100);
    const equityRequired = totalAcquisitionCost + totalCapitalImprovements - loanAmount + loanPointsCost;

    // Income Analysis
    const totalPotentialIncome = grossScheduledIncome + otherIncome;
    const vacancyLoss = totalPotentialIncome * (vacancyRate / 100);
    const creditLoss = totalPotentialIncome * (creditLossRate / 100);
    const effectiveGrossIncome = totalPotentialIncome - vacancyLoss - creditLoss;

    // Operating Expenses
    const propertyManagementFee = grossScheduledIncome * (propertyManagement / 100);
    const totalOperatingExpenses = 
      propertyTaxes +
      insurance +
      utilities +
      maintenance +
      payroll +
      propertyManagementFee +
      professionalFees +
      marketing +
      reserves;

    const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;
    const operatingExpenseRatio = effectiveGrossIncome > 0 ? (totalOperatingExpenses / effectiveGrossIncome) * 100 : 0;

    // Debt Service
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    const monthlyDebtService = loanAmount > 0
      ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : 0;
    const annualDebtService = monthlyDebtService * 12;

    // Cash Flow Analysis
    const cashFlowBeforeTax = netOperatingIncome - annualDebtService;
    
    // Tax Analysis
    const annualDepreciation = (purchasePrice * 0.8) / depreciationPeriod; // 80% of purchase (exclude land)
    const taxableIncome = netOperatingIncome - annualDebtService - annualDepreciation;
    const taxLiability = taxableIncome > 0 ? taxableIncome * (taxBracket / 100) : 0;
    const cashFlowAfterTax = cashFlowBeforeTax - taxLiability;

    // Key Metrics
    const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
    const cashOnCashReturn = equityRequired > 0 ? (cashFlowAfterTax / equityRequired) * 100 : 0;
    const debtServiceCoverageRatio = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;
    const grossRentMultiplier = grossScheduledIncome > 0 ? purchasePrice / grossScheduledIncome : 0;
    const breakEvenOccupancy = effectiveGrossIncome > 0 
      ? ((totalOperatingExpenses + annualDebtService) / totalPotentialIncome) * 100 
      : 0;

    // Exit Analysis
    const futureNOI = netOperatingIncome * Math.pow(1 + appreciationRate / 100, holdingPeriod);
    const projectedSalePrice = exitCapRate > 0 ? futureNOI / (exitCapRate / 100) : 0;
    const sellingCostsAmount = projectedSalePrice * (sellingCosts / 100);
    const netSaleProceeds = projectedSalePrice - sellingCostsAmount;

    // Calculate remaining loan balance
    let remainingBalance = loanAmount;
    for (let i = 0; i < holdingPeriod * 12; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyDebtService - interestPayment;
      remainingBalance -= principalPayment;
    }

    const equityAtSale = netSaleProceeds - remainingBalance;
    const totalCashFlow = cashFlowAfterTax * holdingPeriod;
    const totalReturn = equityAtSale + totalCashFlow - equityRequired;
    const equityMultiple = equityRequired > 0 ? (equityAtSale + totalCashFlow) / equityRequired : 0;
    const annualizedIRR = equityRequired > 0 && holdingPeriod > 0
      ? (Math.pow(equityMultiple, 1 / holdingPeriod) - 1) * 100
      : 0;

    // Sensitivity Analysis - Base Case
    const calculateScenario = (vacancyAdjust: number, expenseAdjust: number) => {
      const scenarioVacancy = totalPotentialIncome * (vacancyAdjust / 100);
      const scenarioEGI = totalPotentialIncome - scenarioVacancy - creditLoss;
      const scenarioExpenses = totalOperatingExpenses * (1 + expenseAdjust / 100);
      const scenarioNOI = scenarioEGI - scenarioExpenses;
      const scenarioCashFlow = scenarioNOI - annualDebtService;
      const scenarioTaxableIncome = scenarioNOI - annualDebtService - annualDepreciation;
      const scenarioTax = scenarioTaxableIncome > 0 ? scenarioTaxableIncome * (taxBracket / 100) : 0;
      const scenarioCashFlowAfterTax = scenarioCashFlow - scenarioTax;
      const scenarioDSCR = annualDebtService > 0 ? scenarioNOI / annualDebtService : 0;
      const scenarioCoCReturn = equityRequired > 0 ? (scenarioCashFlowAfterTax / equityRequired) * 100 : 0;
      
      return {
        noi: scenarioNOI,
        cashFlow: scenarioCashFlowAfterTax,
        dscr: scenarioDSCR,
        cocReturn: scenarioCoCReturn,
      };
    };

    const baseCase = calculateScenario(vacancyRate, 0);
    const pessimisticCase = calculateScenario(pessimisticVacancy, pessimisticExpenseIncrease);
    const optimisticCase = calculateScenario(optimisticVacancy, -optimisticExpenseDecrease);

    return {
      // Capital
      totalAcquisitionCost,
      totalCapitalImprovements,
      loanPointsCost,
      equityRequired,
      
      // Income
      totalPotentialIncome,
      vacancyLoss,
      creditLoss,
      effectiveGrossIncome,
      
      // Expenses
      propertyManagementFee,
      totalOperatingExpenses,
      operatingExpenseRatio,
      netOperatingIncome,
      
      // Debt
      monthlyDebtService,
      annualDebtService,
      
      // Cash Flow & Tax
      cashFlowBeforeTax,
      annualDepreciation,
      taxableIncome,
      taxLiability,
      cashFlowAfterTax,
      
      // Metrics
      capRate,
      cashOnCashReturn,
      debtServiceCoverageRatio,
      grossRentMultiplier,
      breakEvenOccupancy,
      
      // Exit
      futureNOI,
      projectedSalePrice,
      sellingCostsAmount,
      netSaleProceeds,
      remainingBalance,
      equityAtSale,
      totalCashFlow,
      totalReturn,
      equityMultiple,
      annualizedIRR,
      
      // Sensitivity
      baseCase,
      pessimisticCase,
      optimisticCase,
    };
  }, [inputs, isEnterprise]);

  const updateInput = (key: keyof UnderwritingInputs, value: any) => {
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

  const formatMultiple = (value: number) => {
    return `${value.toFixed(2)}x`;
  };

  // Enterprise Lock Overlay
  const EnterpriseLock = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 to-blue-900/95 backdrop-blur-md rounded-xl flex items-center justify-center z-50">
      <div className="text-center px-8 py-12 bg-white rounded-2xl shadow-2xl max-w-2xl mx-4">
        <div className="mb-6">
          <Lock className="w-20 h-20 text-blue-600 mx-auto mb-4" />
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-bold mb-4">
            ENTERPRISE EXCLUSIVE
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Professional Underwriting Software
        </h2>
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          Unlock institutional-grade deal analysis with:
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">Multi-property portfolio modeling</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">3-scenario sensitivity analysis</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">Tax-adjusted cash flow projections</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">IRR & equity multiple calculations</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">Exit strategy modeling</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <span className="text-gray-700">Professional PDF reports</span>
          </div>
        </div>
        <Link
          to="/pricing"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Upgrade to Enterprise
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          Join institutional investors using professional-grade analysis tools
        </p>
      </div>
    </div>
  );

  if (!isEnterprise) {
    return (
      <div className="max-w-7xl mx-auto relative min-h-screen">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden opacity-50">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-12">
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="w-10 h-10" />
              <h2 className="text-4xl font-bold">Professional Underwriting Analysis</h2>
            </div>
            <p className="text-blue-100 text-lg">
              Institutional-grade commercial real estate underwriting software
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
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-blue-200">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <BarChart3 className="w-10 h-10" />
                <h2 className="text-4xl font-bold">Professional Underwriting Analysis</h2>
              </div>
              <p className="text-blue-100 text-lg mb-4">
                Institutional-grade commercial real estate underwriting software
              </p>
              <div className="inline-block px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="font-bold text-yellow-300">⭐ ENTERPRISE EXCLUSIVE</span>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg">
              <Download className="w-5 h-5" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 p-8">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-1 space-y-6 max-h-[1200px] overflow-y-auto pr-4">
            {/* Property Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Property Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property Address</label>
                  <input
                    type="text"
                    value={inputs.propertyAddress}
                    onChange={(e) => updateInput('propertyAddress', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                  <select
                    value={inputs.propertyType}
                    onChange={(e) => updateInput('propertyType', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single-family">Single Family</option>
                    <option value="multi-family">Multi-Family</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed-use">Mixed-Use</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year Built</label>
                    <input
                      type="number"
                      value={inputs.yearBuilt}
                      onChange={(e) => updateInput('yearBuilt', Number(e.target.value))}
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Units</label>
                    <input
                      type="number"
                      value={inputs.units}
                      onChange={(e) => updateInput('units', Number(e.target.value))}
                      className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Square Feet</label>
                  <input
                    type="number"
                    value={inputs.squareFeet}
                    onChange={(e) => updateInput('squareFeet', Number(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Acquisition Costs */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Acquisition Costs</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    value={inputs.purchasePrice}
                    onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Costs</label>
                  <input
                    type="number"
                    value={inputs.closingCosts}
                    onChange={(e) => updateInput('closingCosts', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Diligence</label>
                  <input
                    type="number"
                    value={inputs.dueDiligenceCosts}
                    onChange={(e) => updateInput('dueDiligenceCosts', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Capital Improvements */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Capital Improvements</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Immediate Repairs</label>
                  <input
                    type="number"
                    value={inputs.immediateRepairs}
                    onChange={(e) => updateInput('immediateRepairs', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CapEx Budget</label>
                  <input
                    type="number"
                    value={inputs.capitalExpenditures}
                    onChange={(e) => updateInput('capitalExpenditures', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contingency Reserve</label>
                  <input
                    type="number"
                    value={inputs.contingencyReserve}
                    onChange={(e) => updateInput('contingencyReserve', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Income - Collapsed for space */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Annual Income</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gross Scheduled Income</label>
                  <input
                    type="number"
                    value={inputs.grossScheduledIncome}
                    onChange={(e) => updateInput('grossScheduledIncome', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Income</label>
                  <input
                    type="number"
                    value={inputs.otherIncome}
                    onChange={(e) => updateInput('otherIncome', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vacancy %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.vacancyRate}
                      onChange={(e) => updateInput('vacancyRate', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Loss %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.creditLossRate}
                      onChange={(e) => updateInput('creditLossRate', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Expenses - Simplified */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Operating Expenses (Annual)</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Property Tax</label>
                    <input
                      type="number"
                      value={inputs.propertyTaxes}
                      onChange={(e) => updateInput('propertyTaxes', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Insurance</label>
                    <input
                      type="number"
                      value={inputs.insurance}
                      onChange={(e) => updateInput('insurance', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Utilities</label>
                    <input
                      type="number"
                      value={inputs.utilities}
                      onChange={(e) => updateInput('utilities', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Maintenance</label>
                    <input
                      type="number"
                      value={inputs.maintenance}
                      onChange={(e) => updateInput('maintenance', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mgmt %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.propertyManagement}
                      onChange={(e) => updateInput('propertyManagement', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reserves</label>
                    <input
                      type="number"
                      value={inputs.reserves}
                      onChange={(e) => updateInput('reserves', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financing */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Financing Structure</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount</label>
                  <input
                    type="number"
                    value={inputs.loanAmount}
                    onChange={(e) => updateInput('loanAmount', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.interestRate}
                      onChange={(e) => updateInput('interestRate', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term</label>
                    <input
                      type="number"
                      value={inputs.loanTermYears}
                      onChange={(e) => updateInput('loanTermYears', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Exit Strategy */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Exit Strategy</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hold Period (Years)</label>
                    <input
                      type="number"
                      value={inputs.holdingPeriod}
                      onChange={(e) => updateInput('holdingPeriod', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appreciation %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.appreciationRate}
                      onChange={(e) => updateInput('appreciationRate', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exit Cap Rate %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.exitCapRate}
                    onChange={(e) => updateInput('exitCapRate', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Executive Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-5 shadow-lg">
                <p className="text-blue-100 text-sm mb-1 font-medium">Equity Required</p>
                <p className="text-3xl font-bold">{formatCurrency(results!.equityRequired)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-5 shadow-lg">
                <p className="text-green-100 text-sm mb-1 font-medium">Annual NOI</p>
                <p className="text-3xl font-bold">{formatCurrency(results!.netOperatingIncome)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-5 shadow-lg">
                <p className="text-purple-100 text-sm mb-1 font-medium">Cap Rate</p>
                <p className="text-3xl font-bold">{formatPercent(results!.capRate)}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-5 shadow-lg">
                <p className="text-pink-100 text-sm mb-1 font-medium">Cash-on-Cash</p>
                <p className="text-3xl font-bold">{formatPercent(results!.cashOnCashReturn)}</p>
              </div>
            </div>

            {/* Sensitivity Analysis */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
                Three-Scenario Sensitivity Analysis
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-orange-300">
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Metric</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-red-700">Pessimistic</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-blue-700">Base Case</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-green-700">Optimistic</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 font-medium text-gray-900">Net Operating Income</td>
                      <td className="px-4 py-3 text-center text-red-600 font-semibold">{formatCurrency(results!.pessimisticCase.noi)}</td>
                      <td className="px-4 py-3 text-center text-blue-600 font-semibold">{formatCurrency(results!.baseCase.noi)}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{formatCurrency(results!.optimisticCase.noi)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 font-medium text-gray-900">Annual Cash Flow</td>
                      <td className="px-4 py-3 text-center text-red-600 font-semibold">{formatCurrency(results!.pessimisticCase.cashFlow)}</td>
                      <td className="px-4 py-3 text-center text-blue-600 font-semibold">{formatCurrency(results!.baseCase.cashFlow)}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{formatCurrency(results!.optimisticCase.cashFlow)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 font-medium text-gray-900">DSCR</td>
                      <td className="px-4 py-3 text-center text-red-600 font-semibold">{results!.pessimisticCase.dscr.toFixed(2)}x</td>
                      <td className="px-4 py-3 text-center text-blue-600 font-semibold">{results!.baseCase.dscr.toFixed(2)}x</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{results!.optimisticCase.dscr.toFixed(2)}x</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">Cash-on-Cash Return</td>
                      <td className="px-4 py-3 text-center text-red-600 font-semibold">{formatPercent(results!.pessimisticCase.cocReturn)}</td>
                      <td className="px-4 py-3 text-center text-blue-600 font-semibold">{formatPercent(results!.baseCase.cocReturn)}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{formatPercent(results!.optimisticCase.cocReturn)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exit Analysis */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
                {inputs.holdingPeriod}-Year Exit Analysis
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-md border border-indigo-100">
                  <p className="text-sm text-gray-600 mb-1">Projected Sale Price</p>
                  <p className="text-2xl font-bold text-indigo-600">{formatCurrency(results!.projectedSalePrice)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md border border-indigo-100">
                  <p className="text-sm text-gray-600 mb-1">Equity at Sale</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(results!.equityAtSale)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md border border-indigo-100">
                  <p className="text-sm text-gray-600 mb-1">Total Return</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(results!.totalReturn)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md border border-indigo-100">
                  <p className="text-sm text-gray-600 mb-1">Equity Multiple</p>
                  <p className="text-2xl font-bold text-blue-600">{formatMultiple(results!.equityMultiple)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md border border-indigo-100">
                  <p className="text-sm text-gray-600 mb-1">Annualized IRR</p>
                  <p className="text-2xl font-bold text-green-600">{formatPercent(results!.annualizedIRR)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md border border-indigo-100">
                  <p className="text-sm text-gray-600 mb-1">Total Cash Flow</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(results!.totalCashFlow)}</p>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-700 font-medium">DSCR</span>
                    <span className={`font-bold text-lg ${results!.debtServiceCoverageRatio >= 1.25 ? 'text-green-600' : 'text-red-600'}`}>
                      {results!.debtServiceCoverageRatio.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-700 font-medium">Break-Even Occupancy</span>
                    <span className="font-bold text-lg text-orange-600">{formatPercent(results!.breakEvenOccupancy)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-700 font-medium">Operating Expense Ratio</span>
                    <span className="font-bold text-lg text-blue-600">{formatPercent(results!.operatingExpenseRatio)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Gross Rent Multiplier</span>
                    <span className="font-bold text-lg text-purple-600">{results!.grossRentMultiplier.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tax Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-700 font-medium">Annual Depreciation</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(results!.annualDepreciation)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-700 font-medium">Taxable Income</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(results!.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-700 font-medium">Tax Liability</span>
                    <span className="font-semibold text-red-600">{formatCurrency(results!.taxLiability)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Cash Flow After Tax</span>
                    <span className="font-bold text-lg text-green-600">{formatCurrency(results!.cashFlowAfterTax)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Recommendation */}
            <div className={`rounded-xl p-6 border-2 ${
              results!.annualizedIRR >= 15 && results!.debtServiceCoverageRatio >= 1.25 
                ? 'bg-green-50 border-green-400' :
              results!.annualizedIRR >= 10 && results!.debtServiceCoverageRatio >= 1.15
                ? 'bg-yellow-50 border-yellow-400' :
                'bg-red-50 border-red-400'
            }`}>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                {results!.annualizedIRR >= 15 && results!.debtServiceCoverageRatio >= 1.25 ? (
                  <><CheckCircle className="w-6 h-6 mr-2 text-green-600" /> Investment Recommendation: STRONG BUY</>
                ) : results!.annualizedIRR >= 10 && results!.debtServiceCoverageRatio >= 1.15 ? (
                  <><AlertTriangle className="w-6 h-6 mr-2 text-yellow-600" /> Investment Recommendation: CAUTIOUS</>
                ) : (
                  <><AlertTriangle className="w-6 h-6 mr-2 text-red-600" /> Investment Recommendation: PASS</>
                )}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {results!.annualizedIRR >= 15 && results!.debtServiceCoverageRatio >= 1.25 
                  ? `Excellent institutional-quality investment opportunity with ${formatPercent(results!.annualizedIRR)} IRR, strong debt coverage at ${results!.debtServiceCoverageRatio.toFixed(2)}x DSCR, and ${formatMultiple(results!.equityMultiple)} equity multiple over ${inputs.holdingPeriod} years. This deal meets or exceeds institutional underwriting standards.` :
                  results!.annualizedIRR >= 10 && results!.debtServiceCoverageRatio >= 1.15
                  ? `Acceptable returns but requires careful consideration. IRR of ${formatPercent(results!.annualizedIRR)} is moderate, and DSCR of ${results!.debtServiceCoverageRatio.toFixed(2)}x provides limited cushion. Consider negotiating better terms or improving operational efficiency before proceeding.` :
                  `This deal does not meet institutional investment criteria. IRR of ${formatPercent(results!.annualizedIRR)} is below market expectations, and DSCR of ${results!.debtServiceCoverageRatio.toFixed(2)}x presents elevated risk. Recommend passing or substantially restructuring the deal.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
