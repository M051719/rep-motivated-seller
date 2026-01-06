// SMS Consent Management Component
// Allows users to manage their SMS opt-in/opt-out preferences
// TCPA Compliance UI

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface SMSConsentStatus {
  phone_number: string;
  consent_status: "opted_in" | "opted_out" | "pending" | "unknown";
  consent_date?: string;
  opt_out_date?: string;
  marketing_consent: boolean;
  transactional_consent: boolean;
}

interface SMSConsentManagerProps {
  userId?: string;
  initialPhoneNumber?: string;
  onConsentChange?: (status: SMSConsentStatus) => void;
}

export const SMSConsentManager: React.FC<SMSConsentManagerProps> = ({
  userId,
  initialPhoneNumber = "",
  onConsentChange,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [consentStatus, setConsentStatus] = useState<SMSConsentStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [consentHistory, setConsentHistory] = useState<any[]>([]);

  useEffect(() => {
    if (initialPhoneNumber) {
      checkConsentStatus(initialPhoneNumber);
    }
  }, [initialPhoneNumber]);

  const checkConsentStatus = async (phone: string) => {
    if (!phone) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "sms-consent/status",
        {
          body: { phone_number: phone },
        },
      );

      if (error) throw error;

      setConsentStatus(data.consent);
      onConsentChange?.(data.consent);
    } catch (error: any) {
      console.error("Error checking consent:", error);
      toast.error("Failed to check SMS consent status");
    } finally {
      setLoading(false);
    }
  };

  const handleOptIn = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "sms-consent/opt-in",
        {
          body: {
            phone_number: phoneNumber,
            method: "web_form",
            user_id: userId,
            marketing_consent: true,
            transactional_consent: true,
          },
        },
      );

      if (error) throw error;

      toast.success("Successfully opted in to SMS notifications!");
      await checkConsentStatus(phoneNumber);
    } catch (error: any) {
      console.error("Error opting in:", error);
      toast.error("Failed to opt in to SMS notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleOptOut = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    if (!confirm("Are you sure you want to opt out of SMS notifications?")) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "sms-consent/opt-out",
        {
          body: {
            phone_number: phoneNumber,
            method: "web_request",
            reason: "User requested opt-out via web form",
          },
        },
      );

      if (error) throw error;

      toast.success("Successfully opted out of SMS notifications");
      await checkConsentStatus(phoneNumber);
    } catch (error: any) {
      console.error("Error opting out:", error);
      toast.error("Failed to opt out of SMS notifications");
    } finally {
      setLoading(false);
    }
  };

  const loadConsentHistory = async () => {
    if (!phoneNumber) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "sms-consent/history",
        {
          body: { phone_number: phoneNumber },
        },
      );

      if (error) throw error;

      setConsentHistory(data.history || []);
      setShowHistory(true);
    } catch (error: any) {
      console.error("Error loading history:", error);
      toast.error("Failed to load consent history");
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          SMS Notifications
        </h2>
        <p className="text-gray-600">
          Manage your SMS notification preferences. You can opt in or out at any
          time.
        </p>
      </div>

      {/* Phone Number Input */}
      <div className="mb-6">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Phone Number
        </label>
        <div className="flex gap-3">
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="(555) 123-4567"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={14}
          />
          <button
            onClick={() => checkConsentStatus(phoneNumber)}
            disabled={loading || !phoneNumber}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Status
          </button>
        </div>
      </div>

      {/* Consent Status Display */}
      {consentStatus && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Current Status</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                consentStatus.consent_status === "opted_in"
                  ? "bg-green-100 text-green-800"
                  : consentStatus.consent_status === "opted_out"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {consentStatus.consent_status === "opted_in" && "✓ Opted In"}
              {consentStatus.consent_status === "opted_out" && "✗ Opted Out"}
              {consentStatus.consent_status === "pending" && "⏳ Pending"}
              {consentStatus.consent_status === "unknown" && "? Unknown"}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {consentStatus.consent_date && (
              <p>
                <strong>Opted in:</strong>{" "}
                {new Date(consentStatus.consent_date).toLocaleDateString()}
              </p>
            )}
            {consentStatus.opt_out_date && (
              <p>
                <strong>Opted out:</strong>{" "}
                {new Date(consentStatus.opt_out_date).toLocaleDateString()}
              </p>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="flex items-center">
                <span className="mr-2">📢</span>
                <strong>Marketing messages:</strong>
                <span className="ml-2">
                  {consentStatus.marketing_consent ? "Enabled" : "Disabled"}
                </span>
              </p>
              <p className="flex items-center mt-1">
                <span className="mr-2">📋</span>
                <strong>Transactional messages:</strong>
                <span className="ml-2">
                  {consentStatus.transactional_consent ? "Enabled" : "Disabled"}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        {consentStatus?.consent_status !== "opted_in" && (
          <button
            onClick={handleOptIn}
            disabled={loading || !phoneNumber}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? "Processing..." : "✓ Opt In to SMS"}
          </button>
        )}

        {consentStatus?.consent_status === "opted_in" && (
          <button
            onClick={handleOptOut}
            disabled={loading || !phoneNumber}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? "Processing..." : "✗ Opt Out of SMS"}
          </button>
        )}

        <button
          onClick={loadConsentHistory}
          disabled={loading || !phoneNumber}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          View History
        </button>
      </div>

      {/* TCPA Compliance Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>📱 SMS Terms:</strong> By opting in, you agree to receive SMS
          messages from RepMotivatedSeller. Message frequency varies. Message
          and data rates may apply. Reply STOP to opt out at any time, or HELP
          for help. See our{" "}
          <a href="/privacy-policy" className="underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms-of-service" className="underline">
            Terms of Service
          </a>
          .
        </p>
      </div>

      {/* Consent History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Consent History
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {consentHistory.length === 0 ? (
                  <p className="text-gray-600">No consent history found.</p>
                ) : (
                  consentHistory.map((event, index) => (
                    <div
                      key={event.id || index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {event.action.replace("_", " ")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {event.previous_status && (
                              <span>
                                {event.previous_status} → {event.new_status}
                              </span>
                            )}
                            {!event.previous_status && (
                              <span>{event.new_status}</span>
                            )}
                          </p>
                          {event.method && (
                            <p className="text-sm text-gray-500 mt-1">
                              Method: {event.method.replace("_", " ")}
                            </p>
                          )}
                          {event.keyword_received && (
                            <p className="text-sm text-gray-500">
                              Keyword: {event.keyword_received}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMSConsentManager;
