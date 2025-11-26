import React, { useState } from 'react';
import { CalculatorModal } from '../components/CalculatorModal';
import { Calculator, DollarSign, Home, TrendingUp, Download } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

interface AmortizationRow {
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const ToolsCalculatorsPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState<'flip' | 'rental' | 'mortgage' | 'roi'>('flip');

  const openCalculator = (type: 'flip' | 'rental' | 'mortgage' | 'roi') => {
    setSelectedCalculator(type);
    setModalOpen(true);
  };
  const [activeCalculator, setActiveCalculator] = useState<string>('mortgage');

  // Mortgage Calculator State
  const [loanAmount, setLoanAmount] = useState<number>(200000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationRow[]>([]);

  // Deal Analyzer State
  const [purchasePrice, setPurchasePrice] = useState<number>(150000);
  const [rehabCost, setRehabCost] = useState<number>(30000);
  const [afterRepairValue, setAfterRepairValue] = useState<number>(220000);
  const [holdingTime, setHoldingTime] = useState<number>(6);
  const [dealMetrics, setDealMetrics] = useState<any>(null);

  // ROI Calculator State
  const [investment, setInvestment] = useState<number>(50000);
  const [returnAmount, setReturnAmount] = useState<number>(75000);
  const [timeframe, setTimeframe] = useState<number>(12);
  const [roiResult, setRoiResult] = useState<any>(null);

  // Calculate Mortgage Payment & Amortization
  const calculateMortgage = () => {
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Calculate monthly payment using amortization formula
    const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    setMonthlyPayment(payment);

    // Generate amortization schedule
    let balance = loanAmount;
    const schedule: AmortizationRow[] = [];

    for (let i = 1; i <= numberOfPayments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = payment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        payment: i,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }

    setAmortizationSchedule(schedule);
  };

  // Calculate Deal Analysis
  const analyzeDeal = () => {
    const totalInvestment = purchasePrice + rehabCost;
    const profit = afterRepairValue - totalInvestment;
    const roi = (profit / totalInvestment) * 100;
    const monthlyROI = roi / holdingTime;
    const annualROI = monthlyROI * 12;

    // Holding costs (estimate 1% per month)
    const holdingCosts = totalInvestment * 0.01 * holdingTime;
    const netProfit = profit - holdingCosts;
    const netROI = (netProfit / totalInvestment) * 100;

    setDealMetrics({
      totalInvestment,
      profit,
      roi,
      annualROI,
      holdingCosts,
      netProfit,
      netROI,
      dealGrade: netROI > 20 ? 'Excellent' : netROI > 15 ? 'Good' : netROI > 10 ? 'Fair' : 'Poor'
    });
  };

  // Calculate ROI
  const calculateROI = () => {
    const profit = returnAmount - investment;
    const roi = (profit / investment) * 100;
    const monthlyROI = roi / timeframe;
    const annualROI = monthlyROI * 12;

    setRoiResult({
      profit,
      roi,
      monthlyROI,
      annualROI
    });
  };

  // Export to Excel (CSV format)
  const exportAmortizationToCSV = () => {
    if (amortizationSchedule.length === 0) {
      alert('Please calculate mortgage first!');
      return;
    }

    let csv = 'Payment #,Principal,Interest,Balance\n';
    amortizationSchedule.forEach(row => {
      csv += `${row.payment},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amortization_schedule_${Date.now()}.csv`;
    a.click();
  };

  const calculators = [
    { id: 'mortgage', name: 'Mortgage Calculator', icon: '🏠' },
    { id: 'deal', name: 'Deal Analyzer', icon: '📊' },
    { id: 'roi', name: 'ROI Calculator', icon: '💰' },
    { id: 'cash-flow', name: 'Cash Flow Calculator', icon: '💵' }
  ];

  return (
    <>
      <Helmet>
        <title>Real Estate Calculators & Tools | RepMotivatedSeller</title>
        <meta name="description" content="Free mortgage calculator, deal analyzer, ROI calculator and more professional real estate investment tools." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-green-900 via-emerald-800 to-teal-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">🔧 Tools & Calculators</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Professional real estate investment calculators and analysis tools
            </p>
          </div>
        </section>

        {/* Calculator Tabs */}
        <section className="py-8 bg-white shadow-md sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {calculators.map((calc) => (
                <button
                  key={calc.id}
                  onClick={() => setActiveCalculator(calc.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeCalculator === calc.id
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {calc.icon} {calc.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            {/* Mortgage Calculator */}
            {activeCalculator === 'mortgage' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  🏠 Mortgage Payment Calculator
                </h2>
                <p className="text-gray-600 mb-8">
                  Calculate your monthly mortgage payment and view a complete amortization schedule
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Input Section */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Loan Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Loan Term (Years)
                      </label>
                      <select
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value={15}>15 Years</option>
                        <option value={20}>20 Years</option>
                        <option value={30}>30 Years</option>
                      </select>
                    </div>

                    <button
                      onClick={calculateMortgage}
                      className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
                    >
                      Calculate Payment
                    </button>
                  </div>

                  {/* Results Section */}
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Results</h3>

                    {monthlyPayment > 0 ? (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600">Monthly Payment</p>
                          <p className="text-3xl font-bold text-green-600">
                            ${monthlyPayment.toFixed(2)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Total Paid</p>
                            <p className="text-xl font-bold text-gray-900">
                              ${(monthlyPayment * loanTerm * 12).toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Total Interest</p>
                            <p className="text-xl font-bold text-gray-900">
                              ${((monthlyPayment * loanTerm * 12) - loanAmount).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={exportAmortizationToCSV}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          📥 Download Amortization Schedule (CSV)
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Enter loan details and click Calculate</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amortization Table */}
                {amortizationSchedule.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Amortization Schedule (First 12 Months)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Payment #</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Principal</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Interest</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {amortizationSchedule.slice(0, 12).map((row) => (
                            <tr key={row.payment} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">{row.payment}</td>
                              <td className="px-4 py-3 text-right">${row.principal.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">${row.interest.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-semibold">${row.balance.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 text-center">
                      Showing first 12 months. Download full schedule for all {loanTerm * 12} payments.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Deal Analyzer */}
            {activeCalculator === 'deal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  📊 Real Estate Deal Analyzer
                </h2>
                <p className="text-gray-600 mb-8">
                  Analyze your fix-and-flip or wholesale deals to determine profitability
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Input Section */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Purchase Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rehab/Repair Costs
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          value={rehabCost}
                          onChange={(e) => setRehabCost(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        After Repair Value (ARV)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          value={afterRepairValue}
                          onChange={(e) => setAfterRepairValue(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Holding Time (Months)
                      </label>
                      <input
                        type="number"
                        value={holdingTime}
                        onChange={(e) => setHoldingTime(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <button
                      onClick={analyzeDeal}
                      className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
                    >
                      Analyze Deal
                    </button>
                  </div>

                  {/* Results Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Deal Analysis</h3>

                    {dealMetrics ? (
                      <div className="space-y-4">
                        <div className={`rounded-lg p-4 text-center ${
                          dealMetrics.dealGrade === 'Excellent' ? 'bg-green-500' :
                          dealMetrics.dealGrade === 'Good' ? 'bg-blue-500' :
                          dealMetrics.dealGrade === 'Fair' ? 'bg-yellow-500' :
                          'bg-red-500'
                        } text-white`}>
                          <p className="text-sm">Deal Grade</p>
                          <p className="text-3xl font-bold">{dealMetrics.dealGrade}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Total Investment</p>
                            <p className="text-lg font-bold text-gray-900">
                              ${dealMetrics.totalInvestment.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Gross Profit</p>
                            <p className="text-lg font-bold text-green-600">
                              ${dealMetrics.profit.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Holding Costs</p>
                            <p className="text-lg font-bold text-red-600">
                              -${dealMetrics.holdingCosts.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Net Profit</p>
                            <p className="text-lg font-bold text-green-600">
                              ${dealMetrics.netProfit.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-2">Return on Investment</p>
                          <div className="flex items-baseline justify-between">
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                {dealMetrics.netROI.toFixed(2)}%
                              </p>
                              <p className="text-xs text-gray-500">Net ROI</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-blue-600">
                                {dealMetrics.annualROI.toFixed(2)}%
                              </p>
                              <p className="text-xs text-gray-500">Annualized</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Enter deal details and click Analyze</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ROI Calculator */}
            {activeCalculator === 'roi' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  💰 ROI Calculator
                </h2>
                <p className="text-gray-600 mb-8">
                  Calculate return on investment for any real estate deal
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Initial Investment
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          value={investment}
                          onChange={(e) => setInvestment(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Return Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">$</span>
                        <input
                          type="number"
                          value={returnAmount}
                          onChange={(e) => setReturnAmount(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Timeframe (Months)
                      </label>
                      <input
                        type="number"
                        value={timeframe}
                        onChange={(e) => setTimeframe(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <button
                      onClick={calculateROI}
                      className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
                    >
                      Calculate ROI
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Results</h3>

                    {roiResult ? (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-6 text-center">
                          <p className="text-sm text-gray-600 mb-2">Total ROI</p>
                          <p className="text-4xl font-bold text-green-600">
                            {roiResult.roi.toFixed(2)}%
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Profit</p>
                            <p className="text-xl font-bold text-green-600">
                              ${roiResult.profit.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Annualized ROI</p>
                            <p className="text-xl font-bold text-blue-600">
                              {roiResult.annualROI.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Enter investment details and click Calculate</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cash Flow Calculator - Coming Soon */}
            {activeCalculator === 'cash-flow' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center"
              >
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Cash Flow Calculator
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Coming Soon! Calculate rental property cash flow and NOI.
                </p>
                <Link
                  to="/subscription"
                  className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  Upgrade to Access Premium Tools
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-6">Need More Advanced Tools?</h2>
            <p className="text-xl mb-8">
              Upgrade to access premium calculators, direct mail tools, and CRM integration
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/subscription"
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                View Pricing Plans
              </Link>
              <Link
                to="/resources"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-green-600 transition-colors"
              >
                Browse All Resources
              </Link>
            </div>
          </div>
        </section>
      </div>

        {/* Additional Tools */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Additional Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/canva-templates" className="block p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Canva Templates</h3>
                <p className="text-gray-600">Professional marketing designs powered by Canva</p>
              </Link>
              <Link to="/direct-mail" className="block p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">📬</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Mail</h3>
                <p className="text-gray-600">Send postcards and letters to motivated sellers</p>
              </Link>
              <Link to="/reports" className="block p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Reports</h3>
                <p className="text-gray-600">Generate professional investment analysis reports</p>
              </Link>
            </div>
          </div>
        </section>

    </>
  );
};

export default ToolsCalculatorsPage;


