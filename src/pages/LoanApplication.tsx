import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { BackButton } from "../components/ui/BackButton";

interface DocumentChecklistItem {
  id: string;
  category: string;
  name: string;
  required: boolean;
  completed: boolean;
  file?: File;
}

interface FormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  ssn: string;
  entityName?: string;
  entityType?: string;

  // Property Information
  propertyAddress: string;
  propertyValue: string;
  purchasePrice: string;
  loanAmount: string;
  loanPurpose: string;

  // Financial Information
  annualIncome: string;
  creditScore: string;

  // Policies Agreement
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToRefund: boolean;
  agreedToDisclaimer: boolean;
  agreedToFraudPolicy: boolean;

  // Signature
  signature: string;
  signatureDate: string;
}

const LoanApplicationPage = () => {
  const [step, setStep] = useState(1);
  const [showFraudPolicy, setShowFraudPolicy] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    ssn: "",
    entityName: "",
    entityType: "",
    propertyAddress: "",
    propertyValue: "",
    purchasePrice: "",
    loanAmount: "",
    loanPurpose: "",
    annualIncome: "",
    creditScore: "",
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToRefund: false,
    agreedToDisclaimer: false,
    agreedToFraudPolicy: false,
    signature: "",
    signatureDate: new Date().toISOString().split("T")[0],
  });

  const [documentChecklist, setDocumentChecklist] = useState<
    DocumentChecklistItem[]
  >([
    // BORROWER DOCUMENTS
    {
      id: "real_estate_owned",
      category: "Borrower Documents",
      name: "Schedule of Real Estate Owned",
      required: true,
      completed: false,
    },
    {
      id: "real_estate_sold",
      category: "Borrower Documents",
      name: "Schedule of Real Estate Sold",
      required: true,
      completed: false,
    },
    {
      id: "fraud_policy",
      category: "Borrower Documents",
      name: "Zero Tolerance Fraud Policy (Signed)",
      required: true,
      completed: false,
    },
    {
      id: "broker_fee",
      category: "Borrower Documents",
      name: "Broker Fee Agreement (if applicable)",
      required: false,
      completed: false,
    },

    // ENTITY DOCUMENTS
    {
      id: "articles_org",
      category: "Entity Documents",
      name: "Articles of Organization/Incorporation",
      required: false,
      completed: false,
    },
    {
      id: "irs_ein",
      category: "Entity Documents",
      name: "IRS EIN Letter",
      required: false,
      completed: false,
    },
    {
      id: "operating_agreement",
      category: "Entity Documents",
      name: "Operating Agreement or Bylaws",
      required: false,
      completed: false,
    },

    // GUARANTORS
    {
      id: "guarantor_id",
      category: "Guarantors on the Loan",
      name: "ALL Guarantor(s) - ID",
      required: true,
      completed: false,
    },
    {
      id: "guarantor_ssn",
      category: "Guarantors on the Loan",
      name: "ALL Guarantor(s) - Social Security Card or ITIN (Signed)",
      required: true,
      completed: false,
    },
    {
      id: "tax_returns",
      category: "Guarantors on the Loan",
      name: "Most Recent 1040 Personal Tax Returns - Page 1 & 2 (Signed)",
      required: true,
      completed: false,
    },

    // CONTRACTS
    {
      id: "purchase_agreement",
      category: "Contracts",
      name: "Purchase & Sales Agreement",
      required: true,
      completed: false,
    },
    {
      id: "earnest_money",
      category: "Contracts",
      name: "Earnest Money Deposit (if applicable)",
      required: false,
      completed: false,
    },

    // BANK INFORMATION
    {
      id: "bank_statements",
      category: "Bank Information",
      name: "Bank Statements - 2 Full Months, All Pages",
      required: true,
      completed: false,
    },

    // INSURANCE
    {
      id: "hazard_insurance",
      category: "Insurance",
      name: "Hazard Insurance Binder for Subject Property",
      required: true,
      completed: false,
    },
    {
      id: "flood_insurance",
      category: "Insurance",
      name: "Flood Insurance Binder (if applicable)",
      required: false,
      completed: false,
    },

    // TITLE INFORMATION
    {
      id: "title_report",
      category: "Title Information",
      name: "Preliminary Title Report",
      required: true,
      completed: false,
    },
    {
      id: "property_survey",
      category: "Title Information",
      name: "Property Survey (if applicable)",
      required: false,
      completed: false,
    },

    // REHAB INFORMATION
    {
      id: "rehab_contract",
      category: "Rehab Information",
      name: "Contractor Agreement (if applicable)",
      required: false,
      completed: false,
    },
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = (documentId: string, file: File) => {
    setDocumentChecklist((prev) =>
      prev.map((doc) =>
        doc.id === documentId ? { ...doc, completed: true, file } : doc,
      ),
    );
    toast.success(`${file.name} uploaded successfully`);
  };

  const handleDownloadTemplate = (documentName: string) => {
    toast.success(`Downloading ${documentName} template...`);
    // In production, this would download actual PDF templates
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.agreedToFraudPolicy) {
        toast.error("You must agree to the Zero Tolerance Fraud Policy");
        return false;
      }
      if (
        !formData.agreedToTerms ||
        !formData.agreedToPrivacy ||
        !formData.agreedToRefund ||
        !formData.agreedToDisclaimer
      ) {
        toast.error("You must agree to all policies to continue");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required documents are uploaded
    const missingDocs = documentChecklist.filter(
      (doc) => doc.required && !doc.completed,
    );
    if (missingDocs.length > 0) {
      toast.error(
        `Please upload all required documents: ${missingDocs.map((d) => d.name).join(", ")}`,
      );
      return;
    }

    // Validate signature
    if (!formData.signature || formData.signature.length < 3) {
      toast.error("Please provide your electronic signature");
      return;
    }

    toast.success(
      "Application submitted successfully! We will review your application and contact you within 7 business days. This allows our representatives to thoroughly review your case and apply appropriate relief options."
    );
    console.log("Application Data:", formData);
    console.log("Documents:", documentChecklist);
  };

  const groupedDocuments = documentChecklist.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    },
    {} as Record<string, DocumentChecklistItem[]>,
  );

  return (
    <>
      <Helmet>
        <title>Pre-Loan Application | RepMotivatedSeller</title>
        <meta
          name="description"
          content="Apply for private money loans - Fast approval, competitive rates, and flexible terms for real estate investors."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <BackButton />
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Pre-Loan Application
            </h1>
            <p className="text-xl text-gray-600">
              Fast approval • 8-15% rates • $30K-FHA cap • 6-24 months
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        step >= stepNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {stepNum}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">
                      {stepNum === 1 && "Policies"}
                      {stepNum === 2 && "Application"}
                      {stepNum === 3 && "Documents"}
                      {stepNum === 4 && "Review"}
                    </span>
                  </div>
                  {stepNum < 4 && (
                    <div className="w-16 h-1 bg-gray-300 mt-0"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* STEP 1: FRAUD POLICY AND AGREEMENTS */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Zero Tolerance Fraud Policy */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-red-600 text-white px-6 py-4">
                  <h2 className="text-2xl font-bold flex items-center">
                    <span className="text-3xl mr-3">⚠️</span>
                    Zero Tolerance Fraud Policy
                  </h2>
                </div>

                <div className="p-6">
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-red-900 mb-4">
                      IMPORTANT NOTICE
                    </h3>
                    <p className="text-red-800 font-semibold mb-4">
                      RepMotivatedSeller maintains a ZERO TOLERANCE policy for
                      fraud, misrepresentation, or false information.
                    </p>

                    <div className="space-y-3 text-gray-800">
                      <p className="font-semibold">
                        By submitting this application, you certify that:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>
                          All information provided is true, accurate, and
                          complete to the best of your knowledge
                        </li>
                        <li>
                          All documents submitted are genuine and unaltered
                        </li>
                        <li>
                          You understand that any false statements or
                          misrepresentations may result in:
                          <ul className="list-circle pl-6 mt-2 space-y-1">
                            <li>
                              Immediate rejection of your loan application
                            </li>
                            <li>Termination of any existing loan agreements</li>
                            <li>
                              Legal action including criminal prosecution for
                              fraud
                            </li>
                            <li>Permanent ban from future services</li>
                          </ul>
                        </li>
                        <li>
                          You authorize RepMotivatedSeller to verify all
                          information provided
                        </li>
                        <li>
                          You understand that submitting false information is a
                          federal crime
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 p-4 bg-white rounded border-2 border-red-300">
                      <p className="text-sm font-bold text-red-900 mb-2">
                        FRAUD WARNING:
                      </p>
                      <p className="text-xs text-gray-700">
                        Under federal law, you may face criminal penalties and
                        civil liability for knowingly making false statements or
                        providing false documents in connection with a loan
                        application. This includes but is not limited to:
                        falsifying income, employment, assets, liabilities,
                        credit history, or identity information.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
                    <input
                      type="checkbox"
                      id="agreedToFraudPolicy"
                      name="agreedToFraudPolicy"
                      checked={formData.agreedToFraudPolicy}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="agreedToFraudPolicy"
                      className="text-sm font-medium text-gray-900"
                    >
                      I have read, understood, and agree to comply with the Zero
                      Tolerance Fraud Policy. I certify that all information I
                      provide will be truthful and accurate. I understand that
                      false statements may result in criminal prosecution.
                    </label>
                  </div>
                </div>
              </div>

              {/* Policy Agreements */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Terms and Policies Agreement
                </h3>
                <p className="text-gray-600 mb-6">
                  By using RepMotivatedSeller services and submitting this
                  application, you acknowledge that you have read, understood,
                  and agree to be bound by all of the following policies:
                </p>

                <div className="space-y-4">
                  {/* Terms of Service */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
                    <input
                      type="checkbox"
                      id="agreedToTerms"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-blue-600"
                    />
                    <label htmlFor="agreedToTerms" className="text-sm">
                      I agree to the{" "}
                      <Link
                        to="/terms-of-service"
                        target="_blank"
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Terms of Service
                      </Link>{" "}
                      and understand my rights and obligations
                    </label>
                  </div>

                  {/* Privacy Policy */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
                    <input
                      type="checkbox"
                      id="agreedToPrivacy"
                      name="agreedToPrivacy"
                      checked={formData.agreedToPrivacy}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-blue-600"
                    />
                    <label htmlFor="agreedToPrivacy" className="text-sm">
                      I agree to the{" "}
                      <Link
                        to="/privacy-policy"
                        target="_blank"
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and consent to the collection and use of my personal
                      information
                    </label>
                  </div>

                  {/* Refund Policy */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
                    <input
                      type="checkbox"
                      id="agreedToRefund"
                      name="agreedToRefund"
                      checked={formData.agreedToRefund}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-blue-600"
                    />
                    <label htmlFor="agreedToRefund" className="text-sm">
                      I agree to the{" "}
                      <Link
                        to="/refund-policy"
                        target="_blank"
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Refund Policy
                      </Link>{" "}
                      and understand the terms for refunds and cancellations
                    </label>
                  </div>

                  {/* Disclaimer */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
                    <input
                      type="checkbox"
                      id="agreedToDisclaimer"
                      name="agreedToDisclaimer"
                      checked={formData.agreedToDisclaimer}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-blue-600"
                    />
                    <label htmlFor="agreedToDisclaimer" className="text-sm">
                      I have read and understand the{" "}
                      <Link
                        to="/disclaimer"
                        target="_blank"
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Disclaimer
                      </Link>{" "}
                      including limitations of liability and no legal advice
                      disclaimer
                    </label>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> You must agree to all policies above
                    to proceed with your loan application. Please click on each
                    policy link to review the full terms before agreeing.
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Link
                  to="/"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back to Home
                </Link>
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={
                    !formData.agreedToFraudPolicy ||
                    !formData.agreedToTerms ||
                    !formData.agreedToPrivacy ||
                    !formData.agreedToRefund ||
                    !formData.agreedToDisclaimer
                  }
                >
                  Continue to Application →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: APPLICATION FORM */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Loan Application Information
              </h2>

              <form className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Social Security Number (Last 4 digits) *
                      </label>
                      <input
                        type="text"
                        name="ssn"
                        required
                        maxLength={4}
                        value={formData.ssn}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234"
                      />
                    </div>
                  </div>
                </div>

                {/* Entity Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Entity Information (if applicable)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entity Name
                      </label>
                      <input
                        type="text"
                        name="entityName"
                        value={formData.entityName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ABC Investment LLC"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entity Type
                      </label>
                      <select
                        name="entityType"
                        value={formData.entityType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select entity type</option>
                        <option value="LLC">LLC</option>
                        <option value="Corporation">Corporation</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Trust">Trust</option>
                        <option value="Individual">Individual</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Property Information
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Address *
                      </label>
                      <input
                        type="text"
                        name="propertyAddress"
                        required
                        value={formData.propertyAddress}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123 Main St, City, State ZIP"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Property Value *
                        </label>
                        <input
                          type="number"
                          name="propertyValue"
                          required
                          value={formData.propertyValue}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="250000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Purchase Price *
                        </label>
                        <input
                          type="number"
                          name="purchasePrice"
                          required
                          value={formData.purchasePrice}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="200000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Requested Loan Amount *
                        </label>
                        <input
                          type="number"
                          name="loanAmount"
                          required
                          value={formData.loanAmount}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="150000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Purpose *
                      </label>
                      <select
                        name="loanPurpose"
                        required
                        value={formData.loanPurpose}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select loan purpose</option>
                        <option value="Purchase">Purchase</option>
                        <option value="Refinance">Refinance</option>
                        <option value="Cash-Out Refinance">
                          Cash-Out Refinance
                        </option>
                        <option value="Construction">Construction</option>
                        <option value="Renovation">Renovation</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Financial Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Income *
                      </label>
                      <input
                        type="number"
                        name="annualIncome"
                        required
                        value={formData.annualIncome}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="75000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Score Range *
                      </label>
                      <select
                        name="creditScore"
                        required
                        value={formData.creditScore}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select your credit score range</option>
                        <option value="750+">750+ (Excellent)</option>
                        <option value="700-749">700-749 (Good)</option>
                        <option value="650-699">650-699 (Fair)</option>
                        <option value="600-649">600-649 (Poor)</option>
                        <option value="Below 600">Below 600</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Continue to Documents →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: DOCUMENT CHECKLIST */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Required Documents
              </h2>
              <p className="text-gray-600 mb-6">
                Please upload all required documents. Documents marked with *
                are mandatory.
              </p>

              <div className="space-y-6">
                {Object.entries(groupedDocuments).map(([category, docs]) => (
                  <div key={category} className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">📄</span>
                      {category}
                    </h3>

                    <div className="space-y-3">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <input
                              type="checkbox"
                              checked={doc.completed}
                              readOnly
                              className="w-5 h-5 text-green-600"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {doc.name}
                                {doc.required && (
                                  <span className="text-red-600 ml-1">*</span>
                                )}
                              </p>
                              {doc.file && (
                                <p className="text-xs text-green-600">
                                  ✓ {doc.file.name}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownloadTemplate(doc.name)}
                              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Download Template
                            </button>
                            <label className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                              Upload
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(doc.id, file);
                                }}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    Upload Progress:
                  </span>
                  <span className="text-blue-600 font-bold">
                    {documentChecklist.filter((d) => d.completed).length} /{" "}
                    {documentChecklist.length} documents
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(documentChecklist.filter((d) => d.completed).length / documentChecklist.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Review & Submit →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: REVIEW AND SUBMIT */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Review and Submit
              </h2>

              {/* Application Summary */}
              <div className="space-y-6 mb-8">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {formData.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {formData.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {formData.phone}
                    </div>
                    {formData.entityName && (
                      <div>
                        <span className="font-medium">Entity:</span>{" "}
                        {formData.entityName} ({formData.entityType})
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Property Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Address:</span>{" "}
                      {formData.propertyAddress}
                    </div>
                    <div>
                      <span className="font-medium">Property Value:</span> $
                      {Number(formData.propertyValue).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Purchase Price:</span> $
                      {Number(formData.purchasePrice).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Loan Amount:</span> $
                      {Number(formData.loanAmount).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Purpose:</span>{" "}
                      {formData.loanPurpose}
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Documents
                  </h3>
                  <div className="text-sm">
                    <p className="mb-2">
                      <span className="font-medium">Uploaded:</span>{" "}
                      {documentChecklist.filter((d) => d.completed).length} of{" "}
                      {documentChecklist.length}
                    </p>
                    <p>
                      <span className="font-medium">Required Remaining:</span>{" "}
                      {
                        documentChecklist.filter(
                          (d) => d.required && !d.completed,
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Electronic Signature */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Electronic Signature
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  By typing your full name below, you electronically sign this
                  application and certify that all information provided is true
                  and accurate. You acknowledge that this electronic signature
                  has the same legal effect as a handwritten signature.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type your full name to sign *
                  </label>
                  <input
                    type="text"
                    name="signature"
                    required
                    value={formData.signature}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-script text-xl"
                    placeholder="John Doe"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Date: {formData.signatureDate}
                  </p>
                </div>
              </div>

              {/* Final Certification */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-red-900 mb-3">
                  Final Certification
                </h3>
                <p className="text-sm text-gray-800">
                  I certify that I have reviewed all information in this
                  application and that it is true, complete, and accurate. I
                  understand that any false statements or misrepresentations may
                  result in rejection of this application, termination of any
                  loan agreement, and potential legal action. I authorize
                  RepMotivatedSeller to verify all information provided.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 shadow-lg"
                >
                  Submit Application
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoanApplicationPage;
