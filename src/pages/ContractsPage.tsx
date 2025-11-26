import React from 'react';
import { BackButton } from '../components/ui/BackButton';

export const ContractsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-4">Contract Generator</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Wholesale Contract</h3>
            <p className="text-gray-600 mb-4">Generate wholesale real estate contracts</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Contract
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Fix-and-Flip</h3>
            <p className="text-gray-600 mb-4">Generate fix-and-flip contracts</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Contract
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Cash-Out Refinance</h3>
            <p className="text-gray-600 mb-4">Generate cash-out refi applications</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsPage;
