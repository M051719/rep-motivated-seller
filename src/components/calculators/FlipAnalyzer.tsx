import { useState, useMemo } from "react";
import { DollarSign } from "lucide-react";

export function FlipAnalyzer() {
  const [inputs, setInputs] = useState({
    purchasePrice: 150000,
    arv: 250000,
    repairCosts: 40000,
    holdingMonths: 6,
    closingCosts: 3000,
    sellingCosts: 6,
  });

  const calculate = () => {
    const totalCosts =
      inputs.purchasePrice + inputs.repairCosts + inputs.closingCosts;
    const sellingCostsDollar = (inputs.arv * inputs.sellingCosts) / 100;
    const profit = inputs.arv - totalCosts - sellingCostsDollar;
    const roi = (profit / totalCosts) * 100;
    const annualizedROI = (roi / inputs.holdingMonths) * 12;

    return { totalCosts, sellingCostsDollar, profit, roi, annualizedROI };
  };

  const results = useMemo(() => calculate(), [inputs]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-green-600" />
        Flip Analyzer
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Purchase Price
            </label>
            <input
              type="number"
              value={inputs.purchasePrice}
              onChange={(e) =>
                setInputs({ ...inputs, purchasePrice: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              After Repair Value (ARV)
            </label>
            <input
              type="number"
              value={inputs.arv}
              onChange={(e) =>
                setInputs({ ...inputs, arv: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Repair Costs
            </label>
            <input
              type="number"
              value={inputs.repairCosts}
              onChange={(e) =>
                setInputs({ ...inputs, repairCosts: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Holding Period (Months)
            </label>
            <input
              type="number"
              value={inputs.holdingMonths}
              onChange={(e) =>
                setInputs({ ...inputs, holdingMonths: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Closing Costs
            </label>
            <input
              type="number"
              value={inputs.closingCosts}
              onChange={(e) =>
                setInputs({ ...inputs, closingCosts: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Selling Costs (%)
            </label>
            <input
              type="number"
              value={inputs.sellingCosts}
              onChange={(e) =>
                setInputs({ ...inputs, sellingCosts: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-4">Analysis Results</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Investment:</span>
              <span className="font-bold">
                ${results.totalCosts.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Selling Costs:</span>
              <span className="font-bold">
                ${results.sellingCostsDollar.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t-2 border-green-200">
              <span className="text-gray-900 font-semibold">Net Profit:</span>
              <span
                className={`font-bold text-lg ${results.profit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${results.profit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ROI:</span>
              <span className="font-bold">{results.roi.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annualized ROI:</span>
              <span className="font-bold">
                {results.annualizedROI.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Export to Reports Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                const analysisData = {
                  inputs,
                  results,
                  timestamp: new Date().toISOString(),
                  propertyType: "flip",
                };
                localStorage.setItem(
                  "lastFlipAnalysis",
                  JSON.stringify(analysisData),
                );
                window.location.href = "/reports?source=flip-calculator";
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              📄 Generate Professional Report
            </button>
            <button
              onClick={() => {
                const analysisData = {
                  inputs,
                  results,
                  timestamp: new Date().toISOString(),
                  propertyType: "flip",
                };
                localStorage.setItem(
                  "lastFlipAnalysis",
                  JSON.stringify(analysisData),
                );
                window.location.href =
                  "/contracts?template=acquisition-proposal&data=flip";
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              📋 Create Acquisition Proposal
            </button>
            <button
              onClick={() => {
                const analysisData = {
                  inputs,
                  results,
                  timestamp: new Date().toISOString(),
                  propertyType: "flip",
                };
                localStorage.setItem(
                  "lastFlipAnalysis",
                  JSON.stringify(analysisData),
                );
                window.location.href = "/foreclosure?prefill=calculator";
              }}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
            >
              🏠 Pre-Foreclosure Solution Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
