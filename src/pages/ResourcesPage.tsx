import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { BackButton } from "../components/ui/BackButton";

interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: "download" | "link" | "tool";
  icon: string;
  link?: string;
}

const ResourcesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();

  const categories = [
    { value: "all", label: "All Resources", icon: "📚" },
    { value: "templates", label: "Templates & Forms", icon: "📄" },
    { value: "guides", label: "Guides & Checklists", icon: "📋" },
    { value: "tools", label: "Calculators & Tools", icon: "🔧" },
    { value: "external", label: "External Resources", icon: "🔗" },
  ];

  const resources: Resource[] = [
    // Deal Analysis Tools (Available Online)
    {
      id: 1,
      title: "Flip Property Analyzer",
      description:
        "Comprehensive flip analyzer with ROI calculations, repair budgets, and profit projections - Free online tool!",
      category: "tools",
      type: "tool",
      icon: "🏘️",
      link: "/calculators",
    },
    {
      id: 2,
      title: "Rental Property Analyzer (Basic)",
      description:
        "Basic rental property analyzer with cash flow and ROI calculations - Free online calculator!",
      category: "tools",
      type: "tool",
      icon: "🏠",
      link: "/calculators",
    },
    {
      id: 3,
      title: "Rental Property Analyzer (Full)",
      description:
        "Advanced rental analyzer with 5-year projections and appreciation modeling - Pro members!",
      category: "tools",
      type: "tool",
      icon: "🏢",
      link: "/calculators",
    },
    {
      id: 4,
      title: "Amortization Calculator",
      description:
        "Loan amortization calculator with payment schedules and interest breakdowns - Free online!",
      category: "tools",
      type: "tool",
      icon: "🧮",
      link: "/calculators",
    },
    {
      id: 5,
      title: "Underwriting Analysis Tool",
      description:
        "Professional underwriting analysis for detailed property evaluation - Enterprise members! ⭐",
      category: "tools",
      type: "tool",
      icon: "📋",
      link: "/calculators",
    },
    {
      id: 6,
      title: "Portfolio Performance Dashboard",
      description:
        "Track and monitor your property portfolio performance with visual dashboards - Enterprise members! ⭐",
      category: "tools",
      type: "tool",
      icon: "📈",
      link: "/calculators",
    },

    // Downloadable Tools
    {
      id: 7,
      title: "Flip vs Rent Decision Tool",
      description:
        "Smart decision calculator comparing flip vs rental strategies with ROI analysis and 5-year projections - Free online!",
      category: "tools",
      type: "download",
      icon: "⚖️",
      link: "/calculators",
    },
    {
      id: 8,
      title: "Repair Cost Estimator",
      description:
        "Detailed repair cost estimation by category with contingency calculator - Free online!",
      category: "tools",
      type: "download",
      icon: "��",
      link: "/calculators",
    },

    // Document Templates & References
    {
      id: 9,
      title: "3 Option LOI with Owner Financing",
      description:
        "Letter of Intent template with three owner financing options (interactive docx)",
      category: "templates",
      type: "download",
      icon: "📝",
      link: "/downloads/Updated 3 Option LOI with Owner Finance Language.docx",
    },
    {
      id: 10,
      title: "CAP RATES Documentation",
      description:
        "Comprehensive guide to capitalization rates and their application in real estate",
      category: "guides",
      type: "download",
      icon: "📖",
      link: "/downloads/CAP RATES.docx",
    },
    {
      id: 11,
      title: "Quarterly Cap Rate Survey",
      description:
        "Market cap rate data and trends across different property types and regions",
      category: "guides",
      type: "download",
      icon: "📊",
      link: "/downloads/Quarterly_Cap_Rate_Survey_D_D_Club_edited_by_Lance_updated2.xlsx",
    },

    // External Resources
    {
      id: 12,
      title: "HUD-Approved Housing Counselors",
      description: "Find free housing counseling services in your area",
      category: "external",
      type: "link",
      icon: "🏛️",
      link: "https://www.hud.gov/findacounselor",
    },
    {
      id: 13,
      title: "Property Market Research",
      description:
        "Access comprehensive market data, trends, and analytics to make informed real estate decisions",
      category: "external",
      type: "link",
      icon: "📊",
      link: "https://www.zillow.com/research/",
    },
    {
      id: 14,
      title: "Consumer Financial Protection Bureau",
      description:
        "Know your rights and file complaints about lender practices",
      category: "external",
      type: "link",
      icon: "🛡️",
      link: "https://www.consumerfinance.gov",
    },
    {
      id: 30,
      title: "Free Hardship Letter Generator",
      description:
        "Create professional hardship letters instantly - no sign-up required. Fill in your info and download personalized letters for foreclosure prevention, loan modification, debt settlement, and more.",
      type: "tool",
      link: "/hardship-letter-generator",
      category: "tools",
      icon: "📝",
    },
  ];

  const filteredResources =
    selectedCategory === "all"
      ? resources
      : resources.filter((resource) => resource.category === selectedCategory);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "download":
        return "⬇️ Download";
      case "link":
        return "🔗 Visit Site";
      case "tool":
        return "🔧 Use Tool";
      default:
        return "View";
    }
  };

  const handleResourceClick = (resource: Resource) => {
    if (!resource.link) return;

    if (resource.type === "tool" && resource.link.startsWith("/")) {
      // Internal navigation for tools
      navigate(resource.link);
    } else {
      // External links or downloads
      window.open(resource.link, "_blank");
    }
  };

  return (
    <>
      <Helmet>
        <title>
          Resources - Templates, Guides & Tools | RepMotivatedSeller
        </title>
        <meta
          name="description"
          content="Free templates, guides, calculators, and tools to help you save your home from foreclosure."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <BackButton />
        </div>
        {/* Hero */}
        <section className="bg-gradient-to-br from-green-900 via-teal-800 to-cyan-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">📚 Resources</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Free templates, guides, calculators, and tools to help you
              navigate foreclosure
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedCategory === category.value
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="h-32 bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center">
                    <div className="text-6xl">{resource.icon}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                    <button
                      onClick={() => handleResourceClick(resource)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      {getTypeLabel(resource.type)}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎓 Popular Resources
              </h2>
              <p className="text-xl text-gray-600">
                Most downloaded and used by homeowners like you
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Hardship Letter Template
                </h3>
                <p className="text-gray-600 mb-4">Downloaded 5,200+ times</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Download
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">🧮</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Investment Calculators
                </h3>
                <p className="text-gray-600 mb-4">Used 12,300+ times</p>
                <Link
                  to="/calculators"
                  className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Use Tools
                </Link>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">📖</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Prevention Guide
                </h3>
                <p className="text-gray-600 mb-4">Downloaded 8,100+ times</p>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                  Download
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-6">Need Personalized Help?</h2>
            <p className="text-xl mb-8">
              These resources are great, but sometimes you need expert guidance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/foreclosure"
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Get Help Now
              </Link>
              <Link
                to="/consultation"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-green-600 transition-colors"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ResourcesPage;
