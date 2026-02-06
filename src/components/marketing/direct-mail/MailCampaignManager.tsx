// src/components/marketing/direct-mail/MailCampaignManager.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import LobService from "../../../services/mail/LobService";
import CanvaUploader from "./CanvaUploader";

interface MailingList {
  id: string;
  name: string;
  addresses: Array<{
    name: string;
    address_line1: string;
    address_line2?: string;
    address_city: string;
    address_state: string;
    address_zip: string;
    property_type?: string;
    estimated_value?: number;
  }>;
}

const MailCampaignManager: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [templateUrl, setTemplateUrl] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [selectedList, setSelectedList] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    fetchMailingLists();
  }, []);

  const fetchMailingLists = async () => {
    // This would fetch your mailing lists from Supabase
    // For now, we'll use sample data
    setMailingLists([
      {
        id: "1",
        name: "Foreclosure Risk - High Priority",
        addresses: [
          {
            name: "John Smith",
            address_line1: "123 Main St",
            address_city: "Anytown",
            address_state: "CA",
            address_zip: "90210",
            property_type: "Single Family",
            estimated_value: 450000,
          },
        ],
      },
      {
        id: "2",
        name: "Pre-Foreclosure Leads",
        addresses: [],
      },
    ]);
  };

  const handleFileUploaded = (fileUrl: string, fileName: string) => {
    setTemplateUrl(fileUrl);
    setTemplateName(fileName);
    setCurrentStep(2);
  };

  const handleSendCampaign = async () => {
    if (!selectedList || !templateUrl || !campaignName) {
      alert("Please complete all fields");
      return;
    }

    setSending(true);

    try {
      const list = mailingLists.find((l) => l.id === selectedList);
      if (!list) return;

      // Calculate cost first
      const costInfo = LobService.calculateCost(list.addresses.length);

      const confirmSend = confirm(
        `Send ${list.addresses.length} postcards?\n\n` +
          `Estimated cost: $${costInfo.totalCost.toFixed(2)}\n` +
          `Delivery: ${costInfo.estimatedDelivery}\n\n` +
          `Click OK to proceed with sending.`,
      );

      if (!confirmSend) {
        setSending(false);
        return;
      }

      // Send the campaign
      const sendResult = await LobService.sendBulkMail(
        list.addresses,
        templateUrl,
        campaignName,
      );

      setResults(sendResult);
      setCurrentStep(4);

      // Save campaign to database
      await supabase.from("mail_campaigns").insert({
        name: campaignName,
        template_url: templateUrl,
        mailing_list_id: selectedList,
        sent_count: sendResult.results.filter((r) => r.mailId).length,
        failed_count: sendResult.results.filter((r) => r.error).length,
        total_cost: costInfo.totalCost,
        status: "completed",
      });
    } catch (error) {
      console.error("Campaign send failed:", error);
      alert("Campaign failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📬 Direct Mail Campaign Manager
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, title: "Upload Design", icon: "🎨" },
            { num: 2, title: "Campaign Details", icon: "📝" },
            { num: 3, title: "Send Campaign", icon: "📮" },
            { num: 4, title: "Results", icon: "📊" },
          ].map((step, index) => (
            <div key={step.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.num
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <span className="text-lg">{step.icon}</span>
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.num ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < 3 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.num ? "bg-blue-600" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload Design */}
      {currentStep === 1 && (
        <CanvaUploader onFileUploaded={handleFileUploaded} />
      )}

      {/* Step 2: Campaign Details */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📝 Campaign Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Foreclosure Help Q4 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Template
              </label>
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-2xl mr-3">📄</span>
                <div>
                  <p className="font-medium text-green-800">{templateName}</p>
                  <p className="text-sm text-green-600">Ready to use</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mailing List
              </label>
              <select
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a mailing list...</option>
                {mailingLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list.addresses.length} addresses)
                  </option>
                ))}
              </select>
            </div>

            {selectedList && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  📊 Campaign Summary
                </h3>
                {(() => {
                  const list = mailingLists.find((l) => l.id === selectedList);
                  const cost = LobService.calculateCost(
                    list?.addresses.length || 0,
                  );
                  return (
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>Recipients: {list?.addresses.length || 0}</p>
                      <p>Cost per piece: ${cost.unitCost}</p>
                      <p>Total cost: ${cost.totalCost.toFixed(2)}</p>
                      <p>Estimated delivery: {cost.estimatedDelivery}</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!campaignName || !selectedList}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Send Campaign */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📮 Ready to Send</h2>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">
                ⚠️ Final Review
              </h3>
              <p className="text-sm text-yellow-700">
                Once sent, this campaign cannot be stopped. Please review all
                details carefully.
              </p>
            </div>

            {(() => {
              const list = mailingLists.find((l) => l.id === selectedList);
              const cost = LobService.calculateCost(
                list?.addresses.length || 0,
              );
              return (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-600">
                      Campaign
                    </p>
                    <p className="text-lg">{campaignName}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-600">
                      Recipients
                    </p>
                    <p className="text-lg">
                      {list?.addresses.length || 0} addresses
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-600">
                      Total Cost
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      ${cost.totalCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-600">
                      Delivery Time
                    </p>
                    <p className="text-lg">{cost.estimatedDelivery}</p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={sending}
            >
              ← Back
            </button>
            <button
              onClick={handleSendCampaign}
              disabled={sending}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {sending ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Campaign...
                </>
              ) : (
                "🚀 Send Campaign"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {currentStep === 4 && results && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Campaign Results</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">
                {results.results.filter((r: any) => r.mailId).length}
              </div>
              <p className="text-green-600 font-medium">Sent Successfully</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-600">
                {results.results.filter((r: any) => r.error).length}
              </div>
              <p className="text-red-600 font-medium">Failed</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">
                {results.results.length}
              </div>
              <p className="text-blue-600 font-medium">Total Processed</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Detailed Results:</h3>
            <div className="max-h-64 overflow-y-auto border rounded">
              {results.results.map((result: any, index: number) => (
                <div
                  key={index}
                  className={`p-2 border-b ${
                    result.mailId ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {result.address.name} - {result.address.address_city},{" "}
                      {result.address.address_state}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        result.mailId
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {result.mailId ? "✓ Sent" : "✗ Failed"}
                    </span>
                  </div>
                  {result.error && (
                    <p className="text-xs text-red-600 mt-1">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                setCurrentStep(1);
                setCampaignName("");
                setTemplateUrl("");
                setTemplateName("");
                setSelectedList("");
                setResults(null);
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start New Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailCampaignManager;
