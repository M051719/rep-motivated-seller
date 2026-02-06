import React, { useState, useMemo } from "react";
import { Calculator, TrendingDown, DollarSign } from "lucide-react";

interface AmortizationInputs {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
}

interface PaymentDetail {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export const AmortizationCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<AmortizationInputs>({
    loanAmount: 200000,
    interestRate: 7.5,
    loanTermYears: 30,
  });

  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const { schedule, monthlyPayment, totalInterest, totalPayment } =
    useMemo(() => {
      const { loanAmount, interestRate, loanTermYears } = inputs;

      if (loanAmount <= 0 || interestRate <= 0 || loanTermYears <= 0) {
        return {
          schedule: [],
          monthlyPayment: 0,
          totalInterest: 0,
          totalPayment: 0,
        };
      }

      const monthlyRate = interestRate / 100 / 12;
      const numberOfPayments = loanTermYears * 12;

      // Calculate monthly payment using amortization formula
      const monthlyPayment =
        (loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

      let balance = loanAmount;
      const schedule: PaymentDetail[] = [];

      for (let i = 1; i <= numberOfPayments; i++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;

        // Prevent negative balance due to floating point precision
        if (balance < 0) balance = 0;

        schedule.push({
          paymentNumber: i,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: balance,
        });
      }

      const totalPayment = monthlyPayment * numberOfPayments;
      const totalInterest = totalPayment - loanAmount;

      return { schedule, monthlyPayment, totalInterest, totalPayment };
    }, [inputs]);

  const updateInput = (key: keyof AmortizationInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get summary rows (first 60 months, then yearly)
  const getSummarySchedule = () => {
    if (schedule.length === 0) return [];

    const summary: PaymentDetail[] = [];

    // First 60 months (5 years)
    for (let i = 0; i < Math.min(60, schedule.length); i++) {
      summary.push(schedule[i]);
    }

    // Then yearly (every 12th payment) after the first 60 months
    for (let i = 72; i < schedule.length; i += 12) {
      summary.push(schedule[i - 1]);
    }

    // Final payment if not already included
    if (
      schedule.length > 0 &&
      summary[summary.length - 1]?.paymentNumber !== schedule.length
    ) {
      summary.push(schedule[schedule.length - 1]);
    }

    return summary;
  };
  const displaySchedule = showFullSchedule ? schedule : getSummarySchedule();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-8">
          <div className="flex items-center space-x-3 mb-2">
            <Calculator className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Amortization Calculator</h2>
          </div>
          <p className="text-purple-100">
            Calculate loan payments and view full amortization schedule
          </p>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Inputs */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Loan Details
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Amount
                    </label>
                    <input
                      type="number"
                      value={inputs.loanAmount}
                      onChange={(e) =>
                        updateInput("loanAmount", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.interestRate}
                      onChange={(e) =>
                        updateInput("interestRate", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Term (Years)
                    </label>
                    <input
                      type="number"
                      value={inputs.loanTermYears}
                      onChange={(e) =>
                        updateInput("loanTermYears", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(monthlyPayment)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Total Principal</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(inputs.loanAmount)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-5 border-2 border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalInterest)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Total Payment</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(totalPayment)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Amortization Schedule */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Amortization Schedule
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowFullSchedule(!showFullSchedule)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    {showFullSchedule ? "Show Summary" : "Show Full Schedule"}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Payment #
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Payment
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Principal
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Interest
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {displaySchedule.map((payment, index) => (
                          <tr
                            key={payment.paymentNumber}
                            className={`${
                              payment.paymentNumber % 12 === 0
                                ? "bg-purple-50"
                                : "hover:bg-gray-50"
                            } transition-colors`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.paymentNumber}
                              {payment.paymentNumber % 12 === 0 && (
                                <span className="ml-2 text-xs text-purple-600 font-semibold">
                                  Year {payment.paymentNumber / 12}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                              {formatCurrency(payment.payment)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                              {formatCurrency(payment.principal)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                              {formatCurrency(payment.interest)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                              {formatCurrency(payment.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {!showFullSchedule && schedule.length > 60 && (
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    Showing first 60 months (5 years) and yearly summaries
                    thereafter. Click "Show Full Schedule" to see all{" "}
                    {schedule.length} payments.
                  </p>
                )}
              </div>

              {/* Interest vs Principal Chart Visual */}
              <div className="mt-6 bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Payment Breakdown Over Time
                </h3>
                <div className="space-y-3">
                  {[
                    1,
                    Math.floor(schedule.length / 4),
                    Math.floor(schedule.length / 2),
                    Math.floor((3 * schedule.length) / 4),
                    schedule.length - 1,
                  ].map((index) => {
                    if (!schedule[index]) return null;
                    const payment = schedule[index];
                    const principalPercent =
                      (payment.principal / monthlyPayment) * 100;
                    const interestPercent =
                      (payment.interest / monthlyPayment) * 100;

                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm font-medium text-gray-700">
                          <span>Payment {payment.paymentNumber}</span>
                          <span>{formatCurrency(payment.payment)}</span>
                        </div>
                        <div className="flex h-8 rounded-lg overflow-hidden">
                          <div
                            className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${principalPercent}%` }}
                          >
                            {principalPercent > 15 &&
                              `${principalPercent.toFixed(0)}%`}
                          </div>
                          <div
                            className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${interestPercent}%` }}
                          >
                            {interestPercent > 15 &&
                              `${interestPercent.toFixed(0)}%`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-center space-x-6 mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-700">Principal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-700">Interest</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
