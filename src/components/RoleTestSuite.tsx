import React, { useState, useEffect } from "react";
import { RoleVerification } from "../utils/role-verification";
import { supabase } from "../lib/supabase";

const RoleTestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const runCompleteTest = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      addResult("🧪 Starting comprehensive role test suite...");

      // Test 1: Authentication
      addResult("1️⃣ Testing authentication...");
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        addResult("❌ Authentication failed - please sign in first");
        return;
      }

      addResult(`✅ Authenticated as: ${user.email}`);

      // Test 2: Current Role
      addResult("2️⃣ Getting current user role...");
      const userRole = await RoleVerification.getCurrentUserRole();
      addResult(
        `👤 Current role: ${userRole.role} (Admin: ${userRole.isAdmin})`,
      );

      // Test 3: JWT Verification
      addResult("3️⃣ Verifying JWT token...");
      const jwtInfo = await RoleVerification.verifyJWTToken();
      addResult(`🔐 JWT Status: ${jwtInfo.isValid ? "Valid" : "Invalid"}`);
      addResult(`🏷️ Role in JWT: ${jwtInfo.role}`);

      // Test 4: Database Role Check
      addResult("4️⃣ Checking database role...");
      const { data: dbRole, error: dbError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (dbError) {
        addResult(`❌ Database role check failed: ${dbError.message}`);
      } else {
        addResult(`💾 Database role: ${dbRole?.role || "Not found"}`);
      }

      // Test 5: RLS Policy Test
      addResult("5️⃣ Testing RLS policy access...");
      const { data: callIntents, error: rlsError } = await supabase
        .from("call_intents")
        .select("*")
        .limit(1);

      if (rlsError) {
        addResult(`❌ RLS test failed: ${rlsError.message}`);
      } else {
        addResult(
          `✅ RLS test passed - can access ${callIntents?.length || 0} records`,
        );
      }

      addResult("🎉 Test suite completed!");
    } catch (error) {
      addResult(`❌ Test suite error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🧪 Role-Based Auth Test Suite</h2>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={runCompleteTest}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "⏳ Running Tests..." : "🚀 Run Complete Test Suite"}
          </button>

          <button
            onClick={clearResults}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            🗑️ Clear Results
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">📊 Test Results:</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`text-sm font-mono p-2 rounded ${
                    result.includes("❌")
                      ? "bg-red-100 text-red-800"
                      : result.includes("✅")
                        ? "bg-green-100 text-green-800"
                        : result.includes("⚠️")
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleTestSuite;
