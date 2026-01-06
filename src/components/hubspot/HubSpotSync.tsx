import React, { useState } from "react";
import { testConnection, manualSync } from "../../utils/hubspotTest";

const HubSpotSync: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string>("");

  const handleTest = async () => {
    setLoading(true);
    setResults("Testing connection...");

    try {
      await testConnection();
      setResults("Connection test completed. Check console for details.");
    } catch (error) {
      setResults(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setResults("Starting sync...");

    try {
      await manualSync(10);
      setResults("Sync completed. Check console for details.");
    } catch (error) {
      setResults(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">HubSpot Integration</h2>

      <div className="space-y-4">
        <button
          onClick={handleTest}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          Test Connection
        </button>

        <button
          onClick={handleSync}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded ml-2"
        >
          Manual Sync (10 records)
        </button>
      </div>

      {results && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre className="text-sm">{results}</pre>
        </div>
      )}
    </div>
  );
};

export default HubSpotSync;
