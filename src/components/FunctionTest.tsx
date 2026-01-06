import React, { useState } from "react";
import { api } from "../lib/api";

const FunctionTest = () => {
  const [results, setResults] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const { data, error } = await api.healthCheck();
      setResults(
        error
          ? `❌ Error: ${error.message}`
          : `✅ Health: ${JSON.stringify(data)}`,
      );
    } catch (err) {
      setResults(`❌ Exception: ${err}`);
    }
    setLoading(false);
  };

  const testSMS = async () => {
    setLoading(true);
    try {
      const { data, error } = await api.sendSMS(
        "+1234567890",
        "Test from RepMotivatedSeller",
      );
      setResults(
        error
          ? `❌ SMS Error: ${error.message}`
          : `✅ SMS: ${JSON.stringify(data)}`,
      );
    } catch (err) {
      setResults(`❌ SMS Exception: ${err}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-6">
      <h3 className="text-lg font-semibold mb-4">🔧 Function Tests</h3>

      <div className="space-y-3">
        <button
          onClick={testHealthCheck}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Health Check
        </button>

        <button
          onClick={testSMS}
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test SMS Function
        </button>
      </div>

      {results && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre className="text-sm whitespace-pre-wrap">{results}</pre>
        </div>
      )}
    </div>
  );
};

export default FunctionTest;
