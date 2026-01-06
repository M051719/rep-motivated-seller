import React, { useState } from "react";
import { Mail, MapPin, CreditCard, Send, CheckCircle } from "lucide-react";
import { BackButton } from "../components/ui/BackButton";
import { toast } from "react-hot-toast";

interface MailingAddress {
  name: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

interface MailTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  type: "postcard" | "letter";
  size: string;
}

const DirectMailPage: React.FC = () => {
  const [step, setStep] = useState<
    "template" | "address" | "preview" | "success"
  >("template");
  const [selectedTemplate, setSelectedTemplate] = useState<MailTemplate | null>(
    null,
  );
  const [recipient, setRecipient] = useState<MailingAddress>({
    name: "",
    address_line1: "",
    address_line2: "",
    address_city: "",
    address_state: "",
    address_zip: "",
  });
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const templates: MailTemplate[] = [
    {
      id: "postcard_intro",
      name: "Introduction Postcard",
      description: "Introduce your services to property owners",
      thumbnail: "📬",
      type: "postcard",
      size: "6x9",
    },
    {
      id: "postcard_followup",
      name: "Follow-up Postcard",
      description: "Follow up with potential leads",
      thumbnail: "📮",
      type: "postcard",
      size: "6x9",
    },
    {
      id: "letter_offer",
      name: "Property Offer Letter",
      description: "Professional offer letter for properties",
      thumbnail: "✉️",
      type: "letter",
      size: "8.5x11",
    },
    {
      id: "postcard_foreclosure",
      name: "Foreclosure Assistance",
      description: "Offer help to homeowners facing foreclosure",
      thumbnail: "🏠",
      type: "postcard",
      size: "6x9",
    },
  ];

  const handleTemplateSelect = (template: MailTemplate) => {
    setSelectedTemplate(template);
    setStep("address");
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("preview");
  };

  const handleSendMail = async () => {
    setSending(true);
    try {
      // Call LOB API through your backend
      const response = await fetch("/api/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: selectedTemplate?.id,
          recipient,
          message,
        }),
      });

      if (!response.ok) throw new Error("Failed to send mail");

      setStep("success");
      toast.success("Mail sent successfully!");
    } catch (error) {
      console.error("Error sending mail:", error);
      toast.error("Failed to send mail. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setStep("template");
    setSelectedTemplate(null);
    setRecipient({
      name: "",
      address_line1: "",
      address_line2: "",
      address_city: "",
      address_state: "",
      address_zip: "",
    });
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📮 Direct Mail Service
          </h1>
          <p className="text-xl text-gray-600">
            Send professional postcards and letters to property owners
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`flex items-center ${step === "template" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step === "template" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Template</span>
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div
              className={`flex items-center ${step === "address" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step === "address" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Address</span>
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div
              className={`flex items-center ${step === "preview" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step === "preview" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Preview & Send</span>
            </div>
          </div>
        </div>

        {/* Step 1: Template Selection */}
        {step === "template" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border-2 border-transparent hover:border-blue-500"
              >
                <div className="text-6xl mb-4 text-center">
                  {template.thumbnail}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {template.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {template.type}
                  </span>
                  <span>{template.size}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Address Form */}
        {step === "address" && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recipient Information
            </h2>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipient.name}
                  onChange={(e) =>
                    setRecipient({ ...recipient, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={recipient.address_line1}
                  onChange={(e) =>
                    setRecipient({
                      ...recipient,
                      address_line1: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={recipient.address_line2}
                  onChange={(e) =>
                    setRecipient({
                      ...recipient,
                      address_line2: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient.address_city}
                    onChange={(e) =>
                      setRecipient({
                        ...recipient,
                        address_city: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="San Francisco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient.address_state}
                    onChange={(e) =>
                      setRecipient({
                        ...recipient,
                        address_state: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient.address_zip}
                    onChange={(e) =>
                      setRecipient({
                        ...recipient,
                        address_zip: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="94102"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a personal message..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep("template")}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Preview
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Preview & Send */}
        {step === "preview" && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Review & Send
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Template</h3>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedTemplate?.thumbnail}</span>
                <div>
                  <p className="font-medium">{selectedTemplate?.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedTemplate?.size} {selectedTemplate?.type}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Recipient
              </h3>
              <div className="text-gray-700">
                <p className="font-medium">{recipient.name}</p>
                <p>{recipient.address_line1}</p>
                {recipient.address_line2 && <p>{recipient.address_line2}</p>}
                <p>
                  {recipient.address_city}, {recipient.address_state}{" "}
                  {recipient.address_zip}
                </p>
              </div>
            </div>

            {message && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Personal Message
                </h3>
                <p className="text-gray-700 italic">{message}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Estimated Cost:</strong> $0.75 - $2.50 per piece
                depending on type and quantity
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep("address")}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleSendMail}
                disabled={sending}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Mail
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {step === "success" && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mail Sent Successfully!
            </h2>
            <p className="text-gray-600 mb-8">
              Your {selectedTemplate?.type} will be printed and mailed within
              1-2 business days.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Send Another
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMailPage;
