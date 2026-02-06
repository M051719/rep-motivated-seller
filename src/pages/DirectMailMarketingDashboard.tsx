import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  FileText,
  DollarSign,
  Send,
  CreditCard,
  Palette,
  Download,
  Calculator,
  CheckCircle,
  Home,
} from "lucide-react";
import { BackButton } from "../components/ui/BackButton";
import toast from "react-hot-toast";

interface PropertyInfo {
  address: string;
  city: string;
  state: string;
  zip: string;
  estimatedValue: number;
  investorOffer: number;
  sellerAskingPrice: number;
}

interface DesignTemplate {
  id: string;
  name: string;
  style: "minimal" | "professional";
  preview: string;
}

type MailingService = "lob" | "canva";
type PaymentMethod = "stripe" | "paypal";

const MarketingDashboard: React.FC = () => {
  const [step, setStep] = useState<
    "design" | "content" | "pricing" | "payment"
  >("design");
  const [selectedDesign, setSelectedDesign] = useState<DesignTemplate | null>(
    null,
  );
  const [mailingService, setMailingService] = useState<MailingService>("lob");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [documentType, setDocumentType] = useState<"postcard" | "offer-letter">(
    "postcard",
  );
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo>({
    address: "",
    city: "",
    state: "",
    zip: "",
    estimatedValue: 0,
    investorOffer: 0,
    sellerAskingPrice: 0,
  });
  const [quantity, setQuantity] = useState(100);

  // Design templates
  const designTemplates: DesignTemplate[] = [
    {
      id: "minimal-empathic",
      name: "Minimal & Empathic",
      style: "minimal",
      preview: "🏠 Simple, clean design with compassionate messaging",
    },
    {
      id: "professional-caring",
      name: "Professional & Caring",
      style: "professional",
      preview: "💼 Professional layout with understanding tone",
    },
    {
      id: "minimal-direct",
      name: "Minimal & Direct",
      style: "minimal",
      preview: "📬 Clean, straightforward, empathetic CTA",
    },
    {
      id: "professional-supportive",
      name: "Professional & Supportive",
      style: "professional",
      preview: "🤝 Trustworthy design with supportive language",
    },
  ];

  // Pricing calculator
  const calculateCost = () => {
    const baseCosts = {
      lob: {
        postcard: 0.65,
        letter: 0.95,
      },
      canva: {
        postcard: 0.45,
        letter: 0.75,
      },
    };

    const costPerPiece =
      baseCosts[mailingService][
        documentType === "postcard" ? "postcard" : "letter"
      ];
    const subtotal = costPerPiece * quantity;
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return {
      costPerPiece,
      subtotal,
      tax,
      total,
    };
  };

  const pricing = calculateCost();

  const handleDesignSelect = (template: DesignTemplate) => {
    setSelectedDesign(template);
    setStep("content");
  };

  const handleContentSubmit = () => {
    if (documentType === "offer-letter") {
      if (
        !propertyInfo.address ||
        !propertyInfo.investorOffer ||
        !propertyInfo.sellerAskingPrice
      ) {
        toast.error("Please complete all property information");
        return;
      }
    }
    setStep("pricing");
  };

  const handlePricingConfirm = () => {
    setStep("payment");
  };

  const handlePayment = async () => {
    toast.success(
      `Processing payment via ${paymentMethod === "stripe" ? "Stripe" : "PayPal"}...`,
    );

    // In production, integrate actual payment processing
    setTimeout(() => {
      toast.success(
        `Campaign created! ${quantity} ${documentType}s will be sent via ${mailingService === "lob" ? "Lob" : "Canva"}`,
      );
      // Reset to design step
      setStep("design");
      setSelectedDesign(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            📬 Direct Mail Marketing System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create empathic, professional direct mail campaigns to help families
            facing foreclosure
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-center items-center gap-4">
            {["design", "content", "pricing", "payment"].map(
              (stepName, index) => (
                <React.Fragment key={stepName}>
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        step === stepName
                          ? "bg-blue-600 text-white"
                          : step > stepName ||
                              [
                                "design",
                                "content",
                                "pricing",
                                "payment",
                              ].indexOf(step) > index
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {["design", "content", "pricing", "payment"].indexOf(
                        step,
                      ) > index ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                      {stepName}
                    </span>
                  </div>
                  {index < 3 && <div className="w-12 h-0.5 bg-gray-300" />}
                </React.Fragment>
              ),
            )}
          </div>
        </div>

        {/* Step 1: Design Selection */}
        {step === "design" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Palette className="w-8 h-8 text-blue-600" />
                Choose Your Design Style
              </h2>

              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Document Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setDocumentType("postcard")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      documentType === "postcard"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <Mail className="w-12 h-12 text-blue-600 mb-3 mx-auto" />
                    <h3 className="font-bold text-gray-900 mb-2">Postcard</h3>
                    <p className="text-sm text-gray-600">
                      Minimal, professional design with empathic CTA
                    </p>
                  </button>
                  <button
                    onClick={() => setDocumentType("offer-letter")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      documentType === "offer-letter"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <FileText className="w-12 h-12 text-green-600 mb-3 mx-auto" />
                    <h3 className="font-bold text-gray-900 mb-2">
                      Offer Letter
                    </h3>
                    <p className="text-sm text-gray-600">
                      Professional property offer with pricing details
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {designTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleDesignSelect(template)}
                    className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
                  >
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-3">
                        {template.style === "minimal" ? "📄" : "💼"}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {template.name}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          template.style === "minimal"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {template.style}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{template.preview}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Content Creation */}
        {step === "content" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                {documentType === "postcard"
                  ? "Postcard Content"
                  : "Offer Letter Details"}
              </h2>

              {documentType === "offer-letter" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Address
                      </label>
                      <input
                        type="text"
                        value={propertyInfo.address}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={propertyInfo.city}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            city: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Springfield"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={propertyInfo.state}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            state: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="IL"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={propertyInfo.zip}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            zip: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="62701"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Home className="w-4 h-4 inline mr-1" />
                        Estimated Property Value
                      </label>
                      <input
                        type="number"
                        value={propertyInfo.estimatedValue || ""}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            estimatedValue: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="250000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Your Investor Offer
                      </label>
                      <input
                        type="number"
                        value={propertyInfo.investorOffer || ""}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            investorOffer: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="200000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Seller's Asking Price
                      </label>
                      <input
                        type="number"
                        value={propertyInfo.sellerAskingPrice || ""}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            sellerAskingPrice: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="225000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {documentType === "postcard" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Empathic Messaging Preview
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    "We understand facing foreclosure is overwhelming. You're
                    not alone, and there are options to help. RepMotivatedSeller
                    provides compassionate guidance, resources, and support to
                    protect your home and family. Let us help you navigate this
                    challenge with dignity and hope."
                  </p>
                  <div className="mt-4 p-4 bg-white rounded border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">
                      Call-to-Action:
                    </p>
                    <p className="text-gray-700 mt-1">
                      "Schedule a free consultation today. We're here to listen
                      and help."
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep("design")}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleContentSubmit}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Continue to Pricing
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Pricing Calculator */}
        {step === "pricing" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calculator className="w-8 h-8 text-purple-600" />
                Pricing Calculator
              </h2>

              {/* Service Selection */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Choose Mailing Service
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setMailingService("lob")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      mailingService === "lob"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <h3 className="font-bold text-gray-900 mb-2">📮 Lob</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Premium delivery service
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${documentType === "postcard" ? "0.65" : "0.95"}/piece
                    </p>
                  </button>
                  <button
                    onClick={() => setMailingService("canva")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      mailingService === "canva"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <h3 className="font-bold text-gray-900 mb-2">
                      🎨 Canva Print
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Affordable design & print
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${documentType === "postcard" ? "0.45" : "0.75"}/piece
                    </p>
                  </button>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Quantity
                </label>
                <input
                  type="range"
                  min="50"
                  max="10000"
                  step="50"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600">50</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {quantity} pieces
                  </span>
                  <span className="text-sm text-gray-600">10,000</span>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Cost Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      Cost per piece (
                      {mailingService === "lob" ? "Lob" : "Canva"})
                    </span>
                    <span className="font-semibold">
                      ${pricing.costPerPiece.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Quantity</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-bold text-blue-600">
                      ${pricing.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tax (8%)</span>
                    <span className="font-semibold">
                      ${pricing.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-2xl">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-green-600">
                      ${pricing.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep("content")}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handlePricingConfirm}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Payment */}
        {step === "payment" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-green-600" />
                Payment Method
              </h2>

              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("stripe")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      paymentMethod === "stripe"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <CreditCard className="w-12 h-12 text-blue-600 mb-3 mx-auto" />
                    <h3 className="font-bold text-gray-900 mb-2">💳 Stripe</h3>
                    <p className="text-sm text-gray-600">Credit/Debit Card</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("paypal")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      paymentMethod === "paypal"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <DollarSign className="w-12 h-12 text-blue-600 mb-3 mx-auto" />
                    <h3 className="font-bold text-gray-900 mb-2">🅿️ PayPal</h3>
                    <p className="text-sm text-gray-600">PayPal Account</p>
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Document Type:</span>
                    <span className="font-semibold capitalize">
                      {documentType.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Design:</span>
                    <span className="font-semibold">
                      {selectedDesign?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mailing Service:</span>
                    <span className="font-semibold">
                      {mailingService === "lob" ? "Lob" : "Canva Print"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-semibold">{quantity} pieces</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between text-lg">
                    <span className="font-bold">Total Amount:</span>
                    <span className="font-bold text-green-600">
                      ${pricing.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep("pricing")}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Complete Payment & Send Campaign
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Download Templates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                📄 Download Template Samples
              </h3>
              <p className="opacity-90">
                Get pre-designed postcard and offer letter templates to
                customize
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download All Templates
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
