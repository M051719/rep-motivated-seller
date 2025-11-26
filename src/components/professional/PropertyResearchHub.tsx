// src/components/professional/PropertyResearchHub.tsx - Updated version
import React, { useState } from 'react';
import PropertyDataService from '../../services/PropertyDataService';

const PropertyResearchHub: React.FC = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [propertyData, setPropertyData] = useState<any>(null);

  const searchProperty = async () => {
    setLoading(true);
    
    try {
      // Use free sources first
      const freeData = await PropertyDataService.getPropertyDataFree(address);
      
      // Only use paid APIs if user is on professional plan
      const subscription = await getUserSubscription();
      
      let paidData = null;
      if (subscription.tier === 'professional' || subscription.tier === 'enterprise') {
        paidData = await Promise.all([
          PropertyDataService.getAttomData(address).catch(() => null),
          PropertyDataService.getMLSData(address).catch(() => null),
          PropertyDataService.getForeclosureData(address).catch(() => null)
        ]);
      }
      
      setPropertyData({
        free: freeData,
        paid: paidData,
        combined: mergeAllData(freeData, paidData)
      });
      
    } catch (error) {
      console.error('Property search failed:', error);
      alert('Property search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">🔍 Property Research Hub</h1>
      
      {/* Search Interface */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <input
          type="text"
          placeholder="Enter property address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg text-lg mb-4"
        />
        
        <button
          onClick={searchProperty}
          disabled={loading || !address}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search Property'}
        </button>
      </div>

      {/* Results Display */}
      {propertyData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Public Data (Free)</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(propertyData.free, null, 2)}
            </pre>
          </div>
          
          {/* Paid Data (if available) */}
          {propertyData.paid && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">💎 Premium Data</h2>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(propertyData.paid, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};