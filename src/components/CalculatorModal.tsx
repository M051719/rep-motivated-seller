import React, { useState } from 'react';
import { X, Calculator, DollarSign, Home, TrendingUp, Percent } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorType: 'flip' | 'rental' | 'mortgage' | 'roi';
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  calculatorType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            {calculatorType === 'flip' && 'Fix & Flip Calculator'}
            {calculatorType === 'rental' && 'Rental Property Calculator'}
            {calculatorType === 'mortgage' && 'Mortgage Calculator'}
            {calculatorType === 'roi' && 'ROI Calculator'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {calculatorType === 'flip' && <FlipCalculator />}
          {calculatorType === 'rental' && <RentalCalculator />}
          {calculatorType === 'mortgage' && <MortgageCalculator />}
          {calculatorType === 'roi' && <ROICalculator />}
        </div>
      </div>
    </div>
  );
};

const FlipCalculator: React.FC = () => {
  const [values, setValues] = useState({
    purchasePrice: 0,
    rehabCost: 0,
    arv: 0,
    holdingTime: 6,
    closingCosts: 0,
  });

  const calculate = () => {
    const totalCost = values.purchasePrice + values.rehabCost + values.closingCosts;
    const profit = values.arv - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    return { totalCost, profit, roi };
  };

  const results = calculate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.purchasePrice || ''}
              onChange={(e) => setValues({ ...values, purchasePrice: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rehab Cost
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.rehabCost || ''}
              onChange={(e) => setValues({ ...values, rehabCost: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            After Repair Value (ARV)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.arv || ''}
              onChange={(e) => setValues({ ...values, arv: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Closing Costs
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.closingCosts || ''}
              onChange={(e) => setValues({ ...values, closingCosts: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Investment</p>
            <p className="text-2xl font-bold text-gray-900">
              ${results.totalCost.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Projected Profit</p>
            <p className={`text-2xl font-bold ${results.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${results.profit.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">ROI</p>
            <p className={`text-2xl font-bold ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {results.roi.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Print Results
      </button>
    </div>
  );
};

const RentalCalculator: React.FC = () => {
  const [values, setValues] = useState({
    purchasePrice: 0,
    downPayment: 20,
    interestRate: 7,
    loanTerm: 30,
    monthlyRent: 0,
    expenses: 0,
  });

  const calculate = () => {
    const loanAmount = values.purchasePrice * (1 - values.downPayment / 100);
    const monthlyRate = values.interestRate / 100 / 12;
    const numPayments = values.loanTerm * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const cashFlow = values.monthlyRent - monthlyPayment - values.expenses;
    const cashOnCashReturn = (cashFlow * 12) / (values.purchasePrice * values.downPayment / 100) * 100;
    
    return { monthlyPayment, cashFlow, cashOnCashReturn };
  };

  const results = calculate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.purchasePrice || ''}
              onChange={(e) => setValues({ ...values, purchasePrice: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Down Payment (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.downPayment}
              onChange={(e) => setValues({ ...values, downPayment: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interest Rate (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.1"
              value={values.interestRate}
              onChange={(e) => setValues({ ...values, interestRate: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Rent
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.monthlyRent || ''}
              onChange={(e) => setValues({ ...values, monthlyRent: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Expenses
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.expenses || ''}
              onChange={(e) => setValues({ ...values, expenses: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
            <p className="text-2xl font-bold text-gray-900">
              ${results.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Monthly Cash Flow</p>
            <p className={`text-2xl font-bold ${results.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${results.cashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Cash on Cash Return</p>
            <p className={`text-2xl font-bold ${results.cashOnCashReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {results.cashOnCashReturn.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Print Results
      </button>
    </div>
  );
};

const MortgageCalculator: React.FC = () => {
  const [values, setValues] = useState({
    loanAmount: 0,
    interestRate: 7,
    loanTerm: 30,
  });

  const monthlyRate = values.interestRate / 100 / 12;
  const numPayments = values.loanTerm * 12;
  const monthlyPayment = values.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - values.loanAmount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.loanAmount || ''}
              onChange={(e) => setValues({ ...values, loanAmount: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interest Rate (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.1"
              value={values.interestRate}
              onChange={(e) => setValues({ ...values, interestRate: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Term (years)
          </label>
          <input
            type="number"
            value={values.loanTerm}
            onChange={(e) => setValues({ ...values, loanTerm: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
            <p className="text-2xl font-bold text-gray-900">
              ${isFinite(monthlyPayment) ? monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Interest</p>
            <p className="text-2xl font-bold text-orange-600">
              ${isFinite(totalInterest) ? totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900">
              ${isFinite(totalPaid) ? totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Print Results
      </button>
    </div>
  );
};

const ROICalculator: React.FC = () => {
  const [values, setValues] = useState({
    initialInvestment: 0,
    finalValue: 0,
    timeYears: 1,
  });

  const totalReturn = values.finalValue - values.initialInvestment;
  const roi = values.initialInvestment > 0 ? (totalReturn / values.initialInvestment) * 100 : 0;
  const annualizedROI = values.timeYears > 0 ? (Math.pow(values.finalValue / values.initialInvestment, 1 / values.timeYears) - 1) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Investment
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.initialInvestment || ''}
              onChange={(e) => setValues({ ...values, initialInvestment: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Final Value
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={values.finalValue || ''}
              onChange={(e) => setValues({ ...values, finalValue: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period (years)
          </label>
          <input
            type="number"
            step="0.1"
            value={values.timeYears}
            onChange={(e) => setValues({ ...values, timeYears: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Return</p>
            <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalReturn.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">ROI</p>
            <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {isFinite(roi) ? roi.toFixed(2) : '0.00'}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Annualized ROI</p>
            <p className={`text-2xl font-bold ${annualizedROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {isFinite(annualizedROI) ? annualizedROI.toFixed(2) : '0.00'}%
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Print Results
      </button>
    </div>
  );
};
