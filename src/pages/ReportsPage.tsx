import React, { useState } from 'react';
import { FileText, Download, Printer, Mail, Building2, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { toast } from 'react-hot-toast';

interface ReportData {
  propertyAddress: string;
  purchasePrice: number;
  arv: number;
  rehabCost: number;
  closingCosts: number;
  holdingCosts: number;
  profit: number;
  roi: number;
  generatedDate: string;
}

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'deal-analysis' | 'property-valuation' | 'investment-summary'>('deal-analysis');
  const [reportData, setReportData] = useState<Partial<ReportData>>({
    propertyAddress: '',
    purchasePrice: 0,
    arv: 0,
    rehabCost: 0,
    closingCosts: 0,
    holdingCosts: 0,
  });

  const calculateMetrics = () => {
    const totalCost = (reportData.purchasePrice || 0) + (reportData.rehabCost || 0) + 
                      (reportData.closingCosts || 0) + (reportData.holdingCosts || 0);
    const profit = (reportData.arv || 0) - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return { profit, roi, totalCost };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.success('PDF download will be implemented with jsPDF library');
  };

  const handleEmailReport = () => {
    toast.success('Email functionality will be connected to your email service');
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* No-print controls */}
      <div className="no-print py-8 px-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          <div className="mt-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📊 Report Generation
            </h1>
            <p className="text-xl text-gray-600">
              Create professional investment analysis reports
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Report Type Selection */}
          <div className="no-print lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Type</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setReportType('deal-analysis')}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    reportType === 'deal-analysis'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Deal Analysis</p>
                      <p className="text-sm text-gray-600">Complete investment breakdown</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setReportType('property-valuation')}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    reportType === 'property-valuation'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Property Valuation</p>
                      <p className="text-sm text-gray-600">Market value assessment</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setReportType('investment-summary')}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    reportType === 'investment-summary'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Investment Summary</p>
                      <p className="text-sm text-gray-600">Executive overview</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print Report
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={handleEmailReport}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Report Preview & Data Entry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Entry Form */}
            <div className="no-print bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Data</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address
                  </label>
                  <input
                    type="text"
                    value={reportData.propertyAddress}
                    onChange={(e) => setReportData({ ...reportData, propertyAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main Street, City, State ZIP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={reportData.purchasePrice || ''}
                      onChange={(e) => setReportData({ ...reportData, purchasePrice: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    After Repair Value (ARV)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={reportData.arv || ''}
                      onChange={(e) => setReportData({ ...reportData, arv: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rehab Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={reportData.rehabCost || ''}
                      onChange={(e) => setReportData({ ...reportData, rehabCost: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Costs
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={reportData.closingCosts || ''}
                      onChange={(e) => setReportData({ ...reportData, closingCosts: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Holding Costs
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={reportData.holdingCosts || ''}
                      onChange={(e) => setReportData({ ...reportData, holdingCosts: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-white rounded-lg shadow-md p-8 print:shadow-none">
              {/* Report Header */}
              <div className="border-b-2 border-gray-200 pb-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Investment Analysis Report</h1>
                    <p className="text-gray-600 mt-1">{reportType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <FileText className="w-6 h-6" />
                      <span className="text-2xl font-bold">RepMotivatedSeller</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {reportData.propertyAddress && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Property:</span>
                      <span className="text-gray-700">{reportData.propertyAddress}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Investment</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${metrics.totalCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">After Repair Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(reportData.arv || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Projected Profit</p>
                    <p className={`text-2xl font-bold ${metrics.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${metrics.profit.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">ROI</p>
                    <p className={`text-2xl font-bold ${metrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.roi.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cost Breakdown</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Purchase Price</span>
                    <span className="font-semibold">${(reportData.purchasePrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Rehab Cost</span>
                    <span className="font-semibold">${(reportData.rehabCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Closing Costs</span>
                    <span className="font-semibold">${(reportData.closingCosts || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">Holding Costs</span>
                    <span className="font-semibold">${(reportData.holdingCosts || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                    <span className="font-bold text-gray-900">Total Investment</span>
                    <span className="text-xl font-bold text-blue-600">${metrics.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Investment Recommendation */}
              <div className="border-t-2 border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Investment Analysis</h2>
                <div className={`p-6 rounded-lg ${metrics.roi >= 20 ? 'bg-green-50 border-2 border-green-300' : metrics.roi >= 10 ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-red-50 border-2 border-red-300'}`}>
                  <p className="font-semibold text-lg mb-2">
                    {metrics.roi >= 20 ? '✅ Strong Investment Opportunity' : metrics.roi >= 10 ? '⚠️ Moderate Investment Potential' : '❌ Below Target Returns'}
                  </p>
                  <p className="text-gray-700">
                    {metrics.roi >= 20 
                      ? 'This property shows excellent profit potential with ROI above 20%. Consider moving forward with due diligence.'
                      : metrics.roi >= 10
                      ? 'This property shows moderate returns. Review all costs carefully and consider negotiating the purchase price.'
                      : 'This property may not meet investment criteria. Consider alternative properties or renegotiating terms.'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                <p>This report is generated for informational purposes only and does not constitute financial advice.</p>
                <p className="mt-1">RepMotivatedSeller © {new Date().getFullYear()} | www.repmotivatedseller.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
