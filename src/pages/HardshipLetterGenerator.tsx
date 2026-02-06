import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Mail,
  Calendar,
  Home,
  DollarSign,
  AlertCircle,
  ChevronRight,
  CheckCircle,
  Printer,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import BackButton from "../components/ui/BackButton";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

interface LetterTemplate {
  id: string;
  title: string;
  description: string;
  category: "foreclosure" | "credit" | "mortgage" | "payment" | "tax" | "other";
  icon: React.ReactNode;
}

interface FormData {
  // Personal Information
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;

  // Lender Information
  lenderName: string;
  lenderAddress: string;
  accountNumber: string;

  // Hardship Details
  hardshipType: string;
  hardshipDate: string;
  hardshipDescription: string;
  incomeReduction: string;
  currentIncome: string;
  monthlyExpenses: string;

  // Resolution Request
  requestedAction: string;
  proposedSolution: string;
}

const templates: LetterTemplate[] = [
  {
    id: "stop-foreclosure",
    title: "Stop Foreclosure Hardship Letter",
    description:
      "Request loan modification or forbearance to prevent foreclosure",
    category: "foreclosure",
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: "short-sale",
    title: "Short Sale Hardship Letter",
    description: "Request approval for short sale due to financial hardship",
    category: "foreclosure",
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: "deed-in-lieu",
    title: "Deed in Lieu of Foreclosure",
    description: "Offer to surrender property to avoid foreclosure",
    category: "foreclosure",
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: "loan-modification",
    title: "Loan Modification Request",
    description: "Request mortgage terms modification due to hardship",
    category: "mortgage",
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    id: "late-mortgage",
    title: "Late Mortgage Payment Explanation",
    description:
      "Explain late mortgage payment and request waiver of late fees",
    category: "payment",
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    id: "credit-card-hardship",
    title: "Credit Card Hardship Program",
    description: "Request reduced interest rate or payment plan",
    category: "credit",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    id: "debt-settlement",
    title: "Debt Settlement Letter",
    description: "Negotiate debt settlement due to financial hardship",
    category: "credit",
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    id: "medical-bills",
    title: "Medical Bills Hardship Letter",
    description: "Request payment plan or reduction for medical debt",
    category: "other",
    icon: <AlertCircle className="w-6 h-6" />,
  },
  {
    id: "property-tax",
    title: "Property Tax Hardship Letter",
    description: "Request property tax deferral or payment plan",
    category: "tax",
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    id: "wage-garnishment",
    title: "Wage Garnishment Hardship Letter",
    description: "Request reduction or removal of wage garnishment",
    category: "payment",
    icon: <AlertCircle className="w-6 h-6" />,
  },
];

export default function HardshipLetterGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [step, setStep] = useState<"select" | "fill" | "preview">("select");
  const [emailCaptured, setEmailCaptured] = useState<boolean>(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    lenderName: "",
    lenderAddress: "",
    accountNumber: "",
    hardshipType: "",
    hardshipDate: "",
    hardshipDescription: "",
    incomeReduction: "",
    currentIncome: "",
    monthlyExpenses: "",
    requestedAction: "",
    proposedSolution: "",
  });

  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Track page views and template selections for analytics
  useEffect(() => {
    // Track page view
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_title: "Hardship Letter Generator",
        page_location: window.location.href,
        page_path: "/hardship-letter-generator",
      });
    }
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      // Track template selection
      if (window.gtag) {
        window.gtag("event", "template_selected", {
          event_category: "Hardship Letter",
          event_label: selectedTemplate,
          value: 1,
        });
      }
    }
  }, [selectedTemplate]);

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "foreclosure", label: "Foreclosure" },
    { id: "mortgage", label: "Mortgage" },
    { id: "credit", label: "Credit & Debt" },
    { id: "payment", label: "Payments" },
    { id: "tax", label: "Taxes" },
    { id: "other", label: "Other" },
  ];

  const filteredTemplates =
    filterCategory === "all"
      ? templates
      : templates.filter((t) => t.category === filterCategory);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep("fill");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateLetter = () => {
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return "";

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `${today}

${formData.lenderName}
${formData.lenderAddress}

Re: Account Number ${formData.accountNumber}
     Request for ${formData.requestedAction}

Dear Sir or Madam,

I am writing to formally request ${formData.requestedAction} on my account due to significant financial hardship. My name is ${formData.fullName}, and I currently reside at ${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}.

HARDSHIP CIRCUMSTANCES:

${formData.hardshipDescription}

This hardship began on ${new Date(formData.hardshipDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}, and has resulted in a ${formData.incomeReduction}% reduction in my household income. My current monthly income is $${formData.currentIncome}, while my necessary monthly expenses total $${formData.monthlyExpenses}.

CURRENT FINANCIAL SITUATION:

Despite my best efforts to maintain regular payments, the circumstances described above have made it impossible for me to continue making payments under the current terms. I have exhausted my savings and explored all available options to remedy this situation.

PROPOSED RESOLUTION:

${formData.proposedSolution}

I am committed to meeting my financial obligations and believe that the proposed resolution will enable me to do so while addressing my current hardship. I am requesting your compassionate consideration of this matter and hope we can work together to find a mutually acceptable solution.

I have attached supporting documentation including:
• Proof of income
• Bank statements
• Medical bills / lay-off notice / hardship evidence
• Monthly budget breakdown

I am available to discuss this matter further at your convenience. You may reach me at ${formData.phone} or ${formData.email}. Thank you for your time and consideration.

Sincerely,

${formData.fullName}
${formData.phone}
${formData.email}`;
  };

  const handleDownloadTXT = () => {
    const letter = generateLetter();
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hardship-letter-${selectedTemplate}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Track download
    if (window.gtag) {
      window.gtag("event", "download", {
        event_category: "Hardship Letter",
        event_label: `${selectedTemplate}-txt`,
        value: 1,
      });
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const letter = generateLetter();

    // Set up PDF styling
    doc.setFont("times", "normal");
    doc.setFontSize(12);

    // Split text into lines that fit the page width
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    const lines = doc.splitTextToSize(letter, maxLineWidth);

    // Add text to PDF with pagination
    let y = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.getHeight();

    lines.forEach((line: string, index: number) => {
      if (y + lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    // Save the PDF
    doc.save(`hardship-letter-${selectedTemplate}-${Date.now()}.pdf`);

    // Track download
    if (window.gtag) {
      window.gtag("event", "download", {
        event_category: "Hardship Letter",
        event_label: `${selectedTemplate}-pdf`,
        value: 1,
      });
    }

    // Show email prompt if not captured yet
    if (!emailCaptured && formData.email) {
      setShowEmailPrompt(true);
      captureEmail();
    }
  };

  const captureEmail = async () => {
    if (emailCaptured || !formData.email) return;

    try {
      // Track email capture
      if (window.gtag) {
        window.gtag("event", "lead_capture", {
          event_category: "Hardship Letter",
          event_label: "email_captured",
          value: 1,
        });
      }

      // Here you would send to your backend/CRM
      // For now, just mark as captured
      setEmailCaptured(true);

      // Send to backend API
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/capture-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.fullName,
          source: "hardship_letter_generator",
          template: selectedTemplate,
          tags: ["hardship_letter", "lead_magnet"],
        }),
      }).catch(() => null); // Silent fail for now
    } catch (error) {
      console.error("Email capture error:", error);
    }
  };

  const handlePrint = () => {
    window.print();

    // Track print action
    if (window.gtag) {
      window.gtag("event", "print", {
        event_category: "Hardship Letter",
        event_label: selectedTemplate,
        value: 1,
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName &&
      formData.email &&
      formData.lenderName &&
      formData.hardshipDescription &&
      formData.requestedAction
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Helmet>
        <title>Free Hardship Letter Generator | RepMotivatedSeller</title>
        <meta
          name="description"
          content="Generate professional hardship letters for foreclosure prevention, loan modification, debt settlement, and more. Free tool - no sign-up required."
        />
        <meta
          name="keywords"
          content="hardship letter, foreclosure prevention, loan modification, debt settlement, financial hardship, mortgage assistance"
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <BackButton />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FileText className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Free Hardship Letter Generator
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create professional hardship letters in minutes. No sign-up
            required. Fill in your information and download a personalized
            letter instantly.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>100% Free</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No Login</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Instant Download</span>
            </div>
          </div>
        </motion.div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${step === "select" ? "text-blue-600 font-semibold" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "select" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                1
              </div>
              <span>Choose Template</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div
              className={`flex items-center space-x-2 ${step === "fill" ? "text-blue-600 font-semibold" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "fill" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                2
              </div>
              <span>Fill Information</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div
              className={`flex items-center space-x-2 ${step === "preview" ? "text-blue-600 font-semibold" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "preview" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                3
              </div>
              <span>Preview & Download</span>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        {step === "select" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterCategory === cat.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer border-2 border-transparent hover:border-blue-500"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                      <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                        <span>Select Template</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Form Fill */}
        {step === "fill" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <button
                  onClick={() => setStep("select")}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Change Template</span>
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Fill in Your Information
              </h2>

              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">
                      1
                    </div>
                    <span>Personal Information</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="CA"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) =>
                            handleInputChange("zipCode", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="90001"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lender Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">
                      2
                    </div>
                    <span>Lender/Creditor Information</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lender/Creditor Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lenderName}
                        onChange={(e) =>
                          handleInputChange("lenderName", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ABC Bank"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) =>
                          handleInputChange("accountNumber", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="XXXX-XXXX-1234"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lender Address
                      </label>
                      <input
                        type="text"
                        value={formData.lenderAddress}
                        onChange={(e) =>
                          handleInputChange("lenderAddress", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="456 Bank Plaza, New York, NY 10001"
                      />
                    </div>
                  </div>
                </div>

                {/* Hardship Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">
                      3
                    </div>
                    <span>Hardship Details</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type of Hardship *
                      </label>
                      <select
                        value={formData.hardshipType}
                        onChange={(e) =>
                          handleInputChange("hardshipType", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select hardship type...</option>
                        <option value="job-loss">
                          Job Loss / Unemployment
                        </option>
                        <option value="medical">
                          Medical Emergency / Illness
                        </option>
                        <option value="divorce">Divorce / Separation</option>
                        <option value="death">Death in Family</option>
                        <option value="income-reduction">
                          Income Reduction
                        </option>
                        <option value="disability">Disability</option>
                        <option value="natural-disaster">
                          Natural Disaster
                        </option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hardship Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.hardshipDate}
                          onChange={(e) =>
                            handleInputChange("hardshipDate", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Income Reduction %
                        </label>
                        <input
                          type="number"
                          value={formData.incomeReduction}
                          onChange={(e) =>
                            handleInputChange("incomeReduction", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Monthly Income
                        </label>
                        <input
                          type="number"
                          value={formData.currentIncome}
                          onChange={(e) =>
                            handleInputChange("currentIncome", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="3000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Expenses
                      </label>
                      <input
                        type="number"
                        value={formData.monthlyExpenses}
                        onChange={(e) =>
                          handleInputChange("monthlyExpenses", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="2500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Describe Your Hardship *
                      </label>
                      <textarea
                        value={formData.hardshipDescription}
                        onChange={(e) =>
                          handleInputChange(
                            "hardshipDescription",
                            e.target.value,
                          )
                        }
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Explain the circumstances that led to your financial hardship..."
                      />
                    </div>
                  </div>
                </div>

                {/* Resolution Request */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">
                      4
                    </div>
                    <span>Requested Resolution</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        What Are You Requesting? *
                      </label>
                      <input
                        type="text"
                        value={formData.requestedAction}
                        onChange={(e) =>
                          handleInputChange("requestedAction", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="loan modification, payment plan, debt settlement, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proposed Solution
                      </label>
                      <textarea
                        value={formData.proposedSolution}
                        onChange={(e) =>
                          handleInputChange("proposedSolution", e.target.value)
                        }
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Explain how you propose to resolve the situation..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep("select")}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Templates
                </button>
                <button
                  onClick={() => setStep("preview")}
                  disabled={!isFormValid()}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isFormValid()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Preview Letter
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview & Download */}
        {step === "preview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6 flex justify-between items-center">
                <button
                  onClick={() => setStep("fill")}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Edit Information</span>
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <Printer className="w-5 h-5" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadTXT}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download TXT</span>
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Hardship Letter
              </h2>

              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {generateLetter()}
                </pre>
              </div>

              <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  📋 Next Steps:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>
                    Download your letter using the buttons above (PDF
                    recommended)
                  </li>
                  <li>Print and sign the letter in blue ink</li>
                  <li>Gather supporting documents (see checklist below)</li>
                  <li>Make copies of everything for your records</li>
                  <li>Mail via certified mail with return receipt requested</li>
                  <li>
                    Follow up with your lender/creditor in 7-10 business days
                  </li>
                  <li>Document all communications (dates, names, outcomes)</li>
                </ol>
              </div>

              {/* Supporting Documents Checklist */}
              <div className="mt-6 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  📎 Required Supporting Documents:
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Income Verification:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Last 2 months of pay stubs</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Last 2 years of tax returns</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>W-2 forms or 1099s</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Unemployment benefit statements</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Hardship Proof:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Medical bills or discharge papers</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Layoff or termination notice</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Divorce decree or separation agreement</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Death certificate (if applicable)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Financial Statements:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Last 2-3 months bank statements</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Credit card statements</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Monthly budget breakdown</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Asset statements (retirement, savings)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Property Documents:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Property tax statements</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Homeowner's insurance policy</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>HOA statements (if applicable)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>Utility bills</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border border-yellow-300">
                  <p className="text-sm text-gray-700">
                    <strong>💡 Pro Tip:</strong> Organize documents in the order
                    listed above. Include a cover sheet with a table of
                    contents. Number each page for easy reference.
                  </p>
                </div>
              </div>

              {/* CTA for sign up */}
              <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Need More Help?</h3>
                <p className="mb-4">
                  Join RepMotivatedSeller for personalized foreclosure
                  assistance, one-on-one consultations, and access to our
                  complete resource library.
                </p>
                <button
                  onClick={() => (window.location.href = "/auth")}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Email Confirmation Modal */}
        {showEmailPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEmailPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Letter Downloaded Successfully!
                </h3>
                <p className="text-gray-600 mb-6">
                  We've sent helpful tips and next steps to{" "}
                  <strong>{formData.email}</strong>
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowEmailPrompt(false);
                      window.location.href = "/auth";
                    }}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Get Personalized Help (Free Account)
                  </button>
                  <button
                    onClick={() => setShowEmailPrompt(false)}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continue Browsing
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  No spam, ever. Unsubscribe anytime.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
