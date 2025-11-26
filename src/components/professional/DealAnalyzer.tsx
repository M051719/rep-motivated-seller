// src/components/professional/DealAnalyzer.tsx
import React, { useState } from 'react';

const DealAnalyzer: React.FC = () => {
  const [dealType, setDealType] = useState<'flip' | 'rental' | 'wholesale'>('flip');
  const [analysis, setAnalysis] = useState({
    purchasePrice: 0,
    repairCosts: 0,
    arv: 0, // After Repair Value
    monthlyRent: 0,
    holdingCosts: 0,
    sellingCosts: 0
  });

  const calculateFlipProfit = () => {
    const totalInvestment = analysis.purchasePrice + analysis.repairCosts + analysis.holdingCosts;
    const netProfit = analysis.arv - totalInvestment - analysis.sellingCosts;
    const roi = (netProfit / totalInvestment) * 100;
    
    return { netProfit, roi, totalInvestment };
  };

  const calculateRentalROI = () => {
    const totalInvestment = analysis.purchasePrice + analysis.repairCosts;
    const annualRent = analysis.monthlyRent * 12;
    const cashFlow = annualRent - (analysis.holdingCosts * 12);
    const capRate = (cashFlow / totalInvestment) * 100;
    const cashOnCash = (cashFlow / (totalInvestment * 0.25)) * 100; // Assuming 25% down
    
    return { cashFlow, capRate, cashOnCash };
  };

  const calculate70Rule = () => {
    const maxOffer = (analysis.arv * 0.7) - analysis.repairCosts;
    return maxOffer;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">📊 Deal Analyzer Pro</h1>
      
      {/* Deal Type Selector */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setDealType('flip')}
          className={`px-6 py-3 rounded-lg font-medium ${
            dealType === 'flip' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          🔨 Fix & Flip
        </button>
        <button
          onClick={() => setDealType('rental')}
          className={`px-6 py-3 rounded-lg font-medium ${
            dealType === 'rental' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          🏠 Buy & Hold
        </button>
        <button
          onClick={() => setDealType('wholesale')}
          className={`px-6 py-3 rounded-lg font-medium ${
            dealType === 'wholesale' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          📄 Wholesale
        </button>
      </div>

      {/* Input Form */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📝 Deal Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                value={analysis.purchasePrice}
                onChange={(e) => setAnalysis({...analysis, purchasePrice: Number(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repair Costs
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                value={analysis.repairCosts}
                onChange={(e) => setAnalysis({...analysis, repairCosts: Number(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                After Repair Value (ARV)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                value={analysis.arv}
                onChange={(e) => setAnalysis({...analysis, arv: Number(e.target.value)})}
              />
            </div>
            
            {dealType === 'rental' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={analysis.monthlyRent}
                  onChange={(e) => setAnalysis({...analysis, monthlyRent: Number(e.target.value)})}
                />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">💰 Analysis Results</h2>
          
          {dealType === 'flip' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-green-600">
                  ${calculateFlipProfit().netProfit.toLocaleString()}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">ROI</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calculateFlipProfit().roi.toFixed(1)}%
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">70% Rule Max Offer</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${calculate70Rule().toLocaleString()}
                </p>
              </div>
            </div>
          )}
          
          {dealType === 'rental' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Annual Cash Flow</p>
                <p className="text-2xl font-bold text-green-600">
                  ${calculateRentalROI().cashFlow.toLocaleString()}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Cap Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calculateRentalROI().capRate.toFixed(1)}%
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Cash-on-Cash Return</p>
                <p className="text-2xl font-bold text-purple-600">
                  {calculateRentalROI().cashOnCash.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealAnalyzer;