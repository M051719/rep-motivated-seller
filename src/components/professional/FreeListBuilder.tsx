// src/components/professional/FreeListBuilder.tsx
import React, { useState } from 'react';
import FreePropertyIntelligence from '../../services/FreePropertyIntelligence';

const FreeListBuilder: React.FC = () => {
  const [listType, setListType] = useState('foreclosure');
  const [location, setLocation] = useState({ state: '', county: '', zip: '' });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const buildList = async () => {
    setLoading(true);
    
    try {
      let data;
      switch (listType) {
        case 'foreclosure':
          data = await FreePropertyIntelligence.getForeclosureListings(
            location.state, 
            location.county
          );
          break;
        case 'taxDelinquent':
          data = await FreePropertyIntelligence.getTaxDelinquentProperties(
            location.county,
            location.state
          );
          break;
        case 'absentee':
          data = await FreePropertyIntelligence.findAbsenteeOwners(location.zip);
          break;
        case 'cashBuyers':
          data = await FreePropertyIntelligence.getCashBuyers(
            location.county,
            location.state
          );
          break;
        default:
          data = [];
      }
      
      setResults(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('List building error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = results.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${listType}-list-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">🎯 Free List Builder (PropStream Alternative)</h1>
      
      {/* List Type Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select List Type</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'foreclosure', name: 'Foreclosures', icon: '🏛️', color: 'red' },
            { id: 'taxDelinquent', name: 'Tax Delinquent', icon: '💸', color: 'orange' },
            { id: 'absentee', name: 'Absentee Owners', icon: '✈️', color: 'blue' },
            { id: 'cashBuyers', name: 'Cash Buyers', icon: '💰', color: 'green' },
            { id: 'motivated', name: 'Motivated Sellers', icon: '🔥', color: 'purple' },
            { id: 'fsbo', name: 'FSBO', icon: '🏡', color: 'indigo' },
            { id: 'expired', name: 'Expired Listings', icon: '⏰', color: 'pink' },
            { id: 'vacant', name: 'Vacant Properties', icon: '🏚️', color: 'gray' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setListType(type.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                listType === type.id
                  ? `border-${type.color}-500 bg-${type.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium">{type.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Location Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Location</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="State (e.g., CA)"
            value={location.state}
            onChange={(e) => setLocation({...location, state: e.target.value})}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="County (e.g., Los Angeles)"
            value={location.county}
            onChange={(e) => setLocation({...location, county: e.target.value})}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={location.zip}
            onChange={(e) => setLocation({...location, zip: e.target.value})}
            className="px-4 py-2 border rounded-lg"
          />
        </div>
        
        <button
          onClick={buildList}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Building List...' : '🔍 Build List (Free)'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Results ({results.length} properties)
            </h2>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📥 Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <pre className="text-xs bg-gray-50 p-4 rounded">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeListBuilder;