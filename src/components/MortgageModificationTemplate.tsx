import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FormData {
  // Current Loan Information
  lenderName: string;
  lenderPhone: string;
  lenderEmail: string;
  loanNumber: string;
  originalLoanAmount: string;
  currentBalance: string;
  interestRate: string;
  monthlyPayment: string;
  loanType: string;
  loanOriginationDate: string;

  // Financial Hardship
  hardshipType: string;
  hardshipStartDate: string;
  hardshipDuration: string;
  hardshipDescription: string;

  // Current Financial Situation
  monthlyGrossIncome: string;
  monthlyNetIncome: string;
  monthlyHousingExpenses: string;
  monthlyUtilities: string;
  monthlyDebtPayments: string;
  monthlyOtherExpenses: string;
  savingsBalance: string;
  otherAssets: string;

  // Property Information
  propertyAddress: string;
  estimatedPropertyValue: string;
  propertyCondition: string;
  occupancyStatus: string;
  yearsOwned: string;

  // Modification Goals
  desiredMonthlyPayment: string;
  preferredModificationType: string;
  urgencyLevel: string;
  additionalGoals: string;

  // Documents Checklist
  hasPaystubs: boolean;
  hasBankStatements: boolean;
  hasTaxReturns: boolean;
  hasHardshipLetter: boolean;
  hasMortgageStatement: boolean;
  hasPropertyTaxBill: boolean;
  hasInsuranceInfo: boolean;
  hasUtilityBills: boolean;

  // Lender Communication
  lastContactDate: string;
  lossmitigationContact: string;
  communicationNotes: string;
}

const initialFormData: FormData = {
  lenderName: '',
  lenderPhone: '',
  lenderEmail: '',
  loanNumber: '',
  originalLoanAmount: '',
  currentBalance: '',
  interestRate: '',
  monthlyPayment: '',
  loanType: '',
  loanOriginationDate: '',
  hardshipType: '',
  hardshipStartDate: '',
  hardshipDuration: '',
  hardshipDescription: '',
  monthlyGrossIncome: '',
  monthlyNetIncome: '',
  monthlyHousingExpenses: '',
  monthlyUtilities: '',
  monthlyDebtPayments: '',
  monthlyOtherExpenses: '',
  savingsBalance: '',
  otherAssets: '',
  propertyAddress: '',
  estimatedPropertyValue: '',
  propertyCondition: '',
  occupancyStatus: '',
  yearsOwned: '',
  desiredMonthlyPayment: '',
  preferredModificationType: '',
  urgencyLevel: '',
  additionalGoals: '',
  hasPaystubs: false,
  hasBankStatements: false,
  hasTaxReturns: false,
  hasHardshipLetter: false,
  hasMortgageStatement: false,
  hasPropertyTaxBill: false,
  hasInsuranceInfo: false,
  hasUtilityBills: false,
  lastContactDate: '',
  lossmitigationContact: '',
  communicationNotes: '',
};

const MortgageModificationTemplate: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    localStorage.setItem('mortgageModificationTemplate', JSON.stringify(formData));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('mortgageModificationTemplate');
    if (saved) {
      setFormData(JSON.parse(saved));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `mortgage-modification-research-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateTotalExpenses = () => {
    const housing = parseFloat(formData.monthlyHousingExpenses) || 0;
    const utilities = parseFloat(formData.monthlyUtilities) || 0;
    const debt = parseFloat(formData.monthlyDebtPayments) || 0;
    const other = parseFloat(formData.monthlyOtherExpenses) || 0;
    return housing + utilities + debt + other;
  };

  const calculateDebtToIncome = () => {
    const income = parseFloat(formData.monthlyGrossIncome) || 0;
    const payment = parseFloat(formData.monthlyPayment) || 0;
    if (income === 0) return 0;
    return ((payment / income) * 100).toFixed(1);
  };

  const sections = [
    { id: 0, title: 'Current Loan Info', icon: '📋' },
    { id: 1, title: 'Financial Hardship', icon: '⚠️' },
    { id: 2, title: 'Financial Situation', icon: '💰' },
    { id: 3, title: 'Property Details', icon: '🏠' },
    { id: 4, title: 'Modification Goals', icon: '🎯' },
    { id: 5, title: 'Document Checklist', icon: '✅' },
    { id: 6, title: 'Lender Communication', icon: '📞' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 print:p-0">
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 print:hidden"
        >
          Action completed successfully!
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8 mb-8 print:bg-white print:text-black print:border print:border-gray-300">
        <h1 className="text-4xl font-bold mb-2">Chapter 3: Mortgage Modification Research Template</h1>
        <p className="text-lg text-blue-100 print:text-gray-600">
          Organize your information to prepare for a mortgage modification application
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8 print:hidden">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>💾</span> Save Progress
        </button>
        <button
          onClick={handleLoad}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span>📂</span> Load Saved
        </button>
        <button
          onClick={handleExport}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <span>📥</span> Export JSON
        </button>
        <button
          onClick={handlePrint}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span>🖨️</span> Print
        </button>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6 print:hidden">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.icon} {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Section 0: Current Loan Information */}
        {(activeSection === 0 || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 print:shadow-none print:border print:border-gray-300"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📋</span> Current Loan Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lender Name *</label>
                <input
                  type="text"
                  name="lenderName"
                  value={formData.lenderName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent print:border-gray-400"
                  placeholder="e.g., Wells Fargo, Chase, Bank of America"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lender Phone Number</label>
                <input
                  type="tel"
                  name="lenderPhone"
                  value={formData.lenderPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lender Email</label>
                <input
                  type="email"
                  name="lenderEmail"
                  value={formData.lenderEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="loanservicing@lender.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Number *</label>
                <input
                  type="text"
                  name="loanNumber"
                  value={formData.loanNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your loan/account number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Original Loan Amount</label>
                <input
                  type="text"
                  name="originalLoanAmount"
                  value={formData.originalLoanAmount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="$250,000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Balance *</label>
                <input
                  type="text"
                  name="currentBalance"
                  value={formData.currentBalance}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="$200,000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Interest Rate</label>
                <input
                  type="text"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5.5%"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Monthly Payment *</label>
                <input
                  type="text"
                  name="monthlyPayment"
                  value={formData.monthlyPayment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="$1,500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Type</label>
                <select
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type...</option>
                  <option value="conventional">Conventional</option>
                  <option value="fha">FHA</option>
                  <option value="va">VA</option>
                  <option value="usda">USDA</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Origination Date</label>
                <input
                  type="date"
                  name="loanOriginationDate"
                  value={formData.loanOriginationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Section 1: Financial Hardship */}
        {(activeSection === 1 || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 print:shadow-none print:border print:border-gray-300 print:mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>⚠️</span> Financial Hardship Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Hardship *</label>
                <select
                  name="hardshipType"
                  value={formData.hardshipType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select hardship type...</option>
                  <option value="job-loss">Job Loss/Unemployment</option>
                  <option value="reduced-income">Reduced Income</option>
                  <option value="medical">Medical Emergency/Illness</option>
                  <option value="divorce">Divorce/Separation</option>
                  <option value="death">Death in Family</option>
                  <option value="military">Military Service</option>
                  <option value="business-failure">Business Failure</option>
                  <option value="disaster">Natural Disaster</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">When Did Hardship Begin?</label>
                  <input
                    type="date"
                    name="hardshipStartDate"
                    value={formData.hardshipStartDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Duration</label>
                  <select
                    name="hardshipDuration"
                    value={formData.hardshipDuration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select duration...</option>
                    <option value="temporary">Temporary (3-6 months)</option>
                    <option value="short-term">Short-term (6-12 months)</option>
                    <option value="long-term">Long-term (1+ years)</option>
                    <option value="permanent">Permanent</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Detailed Description of Hardship *
                </label>
                <textarea
                  name="hardshipDescription"
                  value={formData.hardshipDescription}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Explain your situation in detail. Include specific dates, circumstances, and how it has affected your ability to make mortgage payments. This will be the foundation of your hardship letter."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Tip: Be honest, specific, and explain how you've tried to resolve the situation.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section 2: Current Financial Situation */}
        {(activeSection === 2 || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 print:shadow-none print:border print:border-gray-300 print:mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>💰</span> Current Financial Situation
            </h2>

            {/* Income */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Monthly Income</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Gross Income (Before Taxes) *
                  </label>
                  <input
                    type="text"
                    name="monthlyGrossIncome"
                    value={formData.monthlyGrossIncome}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$5,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Net Income (After Taxes)
                  </label>
                  <input
                    type="text"
                    name="monthlyNetIncome"
                    value={formData.monthlyNetIncome}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$4,000"
                  />
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Monthly Expenses</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Housing (Mortgage, HOA, Insurance, Taxes)
                  </label>
                  <input
                    type="text"
                    name="monthlyHousingExpenses"
                    value={formData.monthlyHousingExpenses}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$1,800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Utilities (Electric, Gas, Water, Internet)
                  </label>
                  <input
                    type="text"
                    name="monthlyUtilities"
                    value={formData.monthlyUtilities}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Other Debt Payments (Credit Cards, Car, Loans)
                  </label>
                  <input
                    type="text"
                    name="monthlyDebtPayments"
                    value={formData.monthlyDebtPayments}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Other Expenses (Food, Transport, Medical, etc.)
                  </label>
                  <input
                    type="text"
                    name="monthlyOtherExpenses"
                    value={formData.monthlyOtherExpenses}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$800"
                  />
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-700">
                  Total Monthly Expenses: ${calculateTotalExpenses().toLocaleString()}
                </p>
              </div>
            </div>

            {/* Assets */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Assets</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Savings/Checking Account Balance
                  </label>
                  <input
                    type="text"
                    name="savingsBalance"
                    value={formData.savingsBalance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$5,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Other Assets (Investments, Vehicles, etc.)
                  </label>
                  <input
                    type="text"
                    name="otherAssets"
                    value={formData.otherAssets}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$15,000"
                  />
                </div>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Metrics</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Housing Payment to Income Ratio (Front-end DTI)</p>
                  <p className="text-2xl font-bold text-blue-600">{calculateDebtToIncome()}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {parseFloat(calculateDebtToIncome()) > 31 ? '⚠️ Above recommended 31%' : '✅ Within recommended range'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Cash Flow</p>
                  <p className="text-2xl font-bold text-gray-700">
                    ${((parseFloat(formData.monthlyNetIncome) || 0) - calculateTotalExpenses()).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Net Income - Total Expenses
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section 3: Property Information */}
        {(activeSection === 3 || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 print:shadow-none print:border print:border-gray-300 print:mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🏠</span> Property Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Address *</label>
                <input
                  type="text"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimated Current Property Value
                  </label>
                  <input
                    type="text"
                    name="estimatedPropertyValue"
                    value={formData.estimatedPropertyValue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$280,000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Check Zillow, Redfin, or get a BPO (Broker Price Opinion)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Years Owned</label>
                  <input
                    type="text"
                    name="yearsOwned"
                    value={formData.yearsOwned}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property Condition</label>
                  <select
                    name="propertyCondition"
                    value={formData.propertyCondition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select condition...</option>
                    <option value="excellent">Excellent - Well maintained</option>
                    <option value="good">Good - Minor repairs needed</option>
                    <option value="fair">Fair - Some repairs needed</option>
                    <option value="poor">Poor - Major repairs needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Occupancy Status</label>
                  <select
                    name="occupancyStatus"
                    value={formData.occupancyStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select status...</option>
                    <option value="owner-occupied">Owner Occupied (Primary Residence)</option>
                    <option value="second-home">Second Home</option>
                    <option value="rental">Rental Property</option>
                    <option value="vacant">Vacant</option>
                  </select>
                </div>
              </div>

              {/* Equity Calculation */}
              {formData.estimatedPropertyValue && formData.currentBalance && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Estimated Equity</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ${(parseFloat(formData.estimatedPropertyValue.replace(/[$,]/g, '')) -
                       parseFloat(formData.currentBalance.replace(/[$,]/g, ''))).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Property Value - Loan Balance
                  </p>
                  {parseFloat(formData.estimatedPropertyValue.replace(/[$,]/g, '')) <
                   parseFloat(formData.currentBalance.replace(/[$,]/g, '')) && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ Property is underwater (negative equity). This may affect modification options.
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Section 4: Modification Goals */}
        {(activeSection === 4 || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 print:shadow-none print:border print:border-gray-300 print:mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🎯</span> Modification Goals
            </h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Desired Monthly Payment *
                  </label>
                  <input
                    type="text"
                    name="desiredMonthlyPayment"
                    value={formData.desiredMonthlyPayment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="$1,200"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    What payment can you realistically afford?
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level</label>
                  <select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select urgency...</option>
                    <option value="immediate">Immediate - Already behind on payments</option>
                    <option value="urgent">Urgent - Will be behind soon (30-60 days)</option>
                    <option value="proactive">Proactive - Planning ahead</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Modification Type
                </label>
                <select
                  name="preferredModificationType"
                  value={formData.preferredModificationType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select preferred type...</option>
                  <option value="rate-reduction">Interest Rate Reduction</option>
                  <option value="term-extension">Term Extension (e.g., 30 to 40 years)</option>
                  <option value="principal-forbearance">Principal Forbearance</option>
                  <option value="principal-reduction">Principal Reduction</option>
                  <option value="combination">Combination of Methods</option>
                  <option value="open">Open to Any Option</option>
                </select>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                  <strong>Note:</strong> Most lenders start with rate reduction and term extension.
                  Principal reduction is rare and usually only for special programs.
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Goals or Requirements
                </label>
                <textarea
                  name="additionalGoals"
                  value={formData.additionalGoals}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any other specific needs? e.g., 'Need to keep payment under $1,500', 'Want to stay in home long-term', 'Prefer fixed rate over ARM', etc."
                />
              </div>

              {/* Payment Reduction Calculation */}
              {formData.monthlyPayment && formData.desiredMonthlyPayment && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Payment Reduction Needed</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    ${(parseFloat(formData.monthlyPayment.replace(/[$,]/g, '')) -
                       parseFloat(formData.desiredMonthlyPayment.replace(/[$,]/g, ''))).toLocaleString()}
                    <span className="text-base font-normal text-gray-600"> per month</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    That's a {
                      ((parseFloat(formData.monthlyPayment.replace(/[$,]/g, '')) -
                        parseFloat(formData.desiredMonthlyPayment.replace(/[$,]/g, ''))) /
                       parseFloat(formData.monthlyPayment.replace(/[$,]/g, '')) * 100).toFixed(1)
                    }% reduction
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Section 5: Document Checklist */}
        {(activeSection === 5 || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 print:shadow-none print:border print:border-gray-300 print:mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>✅</span> Required Documents Checklist
            </h2>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Important:</strong> Gather these documents before contacting your lender.
                Complete applications are processed faster.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'hasPaystubs', label: 'Recent Pay Stubs (last 2-3 months)', description: 'All household income earners' },
                { name: 'hasBankStatements', label: 'Bank Statements (last 2-3 months)', description: 'All checking and savings accounts' },
                { name: 'hasTaxReturns', label: 'Tax Returns (last 2 years)', description: 'Complete returns with all schedules' },
                { name: 'hasHardshipLetter', label: 'Hardship Letter', description: 'Detailed explanation of your situation' },
                { name: 'hasMortgageStatement', label: 'Current Mortgage Statement', description: 'Shows current balance and payment info' },
                { name: 'hasPropertyTaxBill', label: 'Property Tax Bill', description: 'Most recent annual or quarterly statement' },
                { name: 'hasInsuranceInfo', label: 'Homeowners Insurance Info', description: 'Policy and premium information' },
                { name: 'hasUtilityBills', label: 'Recent Utility Bills', description: 'Proof of occupancy if owner-occupied' },
              ].map((doc) => (
                <label
                  key={doc.name}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    name={doc.name}
                    checked={formData[doc.name as keyof FormData] as boolean}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{doc.label}</div>
                    <div className="text-sm text-gray-600">{doc.description}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Completion Progress */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">Document Completion</h3>
                <span className="text-2xl font-bold text-blue-600">
                  {Object.entries(formData).filter(([key, value]) =>
                    key.startsWith('has') && value === true
                  ).length} / 8
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Object.entries(formData).filter(([key, value]) =>
                      key.startsWith('has') && value === true
                    ).length / 8) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Additional Tips */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Document Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Make copies of everything - never send originals</li>
                <li>• Organize documents in a clearly labeled folder</li>
                <li>• Keep a log of what you send and when</li>
                <li>• Follow up if you don't hear back within 2 weeks</li>
                <li>• Consider sending via certified mail for proof of delivery</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Section 6: Lender Communication */}
        {(activeSection === 6 || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 print:shadow-none print:border print:border-gray-300 print:mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📞</span> Lender Communication Log
            </h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loss Mitigation Contact Name
                  </label>
                  <input
                    type="text"
                    name="lossmitigationContact"
                    value={formData.lossmitigationContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact person's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Contact Date
                  </label>
                  <input
                    type="date"
                    name="lastContactDate"
                    value={formData.lastContactDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Communication Notes / Timeline
                </label>
                <textarea
                  name="communicationNotes"
                  value={formData.communicationNotes}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Document all communications with your lender:&#10;&#10;Date | Contact Method | Person Spoken To | Discussion Summary | Next Steps&#10;&#10;Example:&#10;11/15/2024 | Phone | Jane Smith | Discussed modification options. Requested document packet. | Send documents by 11/22/2024"
                />
              </div>

              {/* Communication Best Practices */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Communication Best Practices</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>Always get a name:</strong> Note who you spoke with and their direct extension</li>
                  <li>• <strong>Request confirmation:</strong> Ask for email confirmation of verbal agreements</li>
                  <li>• <strong>Follow up in writing:</strong> Send email summaries after phone calls</li>
                  <li>• <strong>Keep records:</strong> Save all letters, emails, and faxes</li>
                  <li>• <strong>Be persistent:</strong> Call regularly if you don't hear back</li>
                  <li>• <strong>Stay professional:</strong> Remain calm and courteous, even if frustrated</li>
                  <li>• <strong>Know your rights:</strong> You have the right to apply for a modification</li>
                </ul>
              </div>

              {/* Important Numbers */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Important Contact Numbers</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>HOPE Hotline (Free counseling):</strong> 1-888-995-HOPE (4673)</p>
                  <p><strong>HUD Housing Counselor:</strong> 1-800-569-4287</p>
                  <p><strong>Your Lender (from form):</strong> {formData.lenderPhone || 'Not entered yet'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Final Tips & Next Steps */}
      <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg p-8 print:bg-white print:text-black print:border print:border-gray-300 print:mt-8">
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <ol className="space-y-3 text-lg">
          <li>1. Complete all sections of this template</li>
          <li>2. Gather all required documents (Section 5)</li>
          <li>3. Contact your lender's Loss Mitigation department</li>
          <li>4. Submit your modification application package</li>
          <li>5. Follow up every 5-7 business days</li>
          <li>6. Continue making any payments you can afford</li>
          <li>7. Consider working with a HUD-approved housing counselor</li>
        </ol>

        <div className="mt-6 p-4 bg-white/10 rounded-lg print:bg-gray-50">
          <p className="text-sm">
            <strong>Remember:</strong> Mortgage modification is a process that can take 30-90 days.
            Stay organized, be persistent, and don't give up. Many homeowners successfully modify their loans and save their homes.
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:mt-8 {
            margin-top: 2rem !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border {
            border-width: 1px !important;
          }
          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:text-gray-600 {
            color: #4b5563 !important;
          }
          .print\\:bg-gray-50 {
            background-color: #f9fafb !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MortgageModificationTemplate;
