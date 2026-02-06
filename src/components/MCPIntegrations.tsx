import React from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Github,
  Container,
  Database,
  Zap,
  Shield,
  CreditCard,
  CloudRain,
  Bot,
  Sparkles,
  ExternalLink,
  Link2,
} from "lucide-react";

interface MCPService {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  capabilities: string[];
  knowledgeBaseLinks: string[];
  status: "active" | "configured" | "available";
}

const MCPIntegrations: React.FC = () => {
  const mcpServices: MCPService[] = [
    {
      name: "Claude Desktop",
      description:
        "AI-powered assistant for intelligent data analysis and retrieval",
      icon: <Bot className="w-8 h-8" />,
      color: "from-purple-500 to-indigo-600",
      capabilities: [
        "Natural language queries for property data",
        "Intelligent document summarization",
        "Real-time market analysis",
        "Automated property comparisons",
      ],
      knowledgeBaseLinks: [
        "Government Resources",
        "Educational Materials",
        "Market Trends",
        "Legal Documents",
      ],
      status: "active",
    },
    {
      name: "Cloudflare",
      description:
        "Edge computing and content delivery for lightning-fast data access",
      icon: <Cloud className="w-8 h-8" />,
      color: "from-orange-500 to-red-600",
      capabilities: [
        "Global CDN for property images",
        "DDoS protection for listings",
        "Edge caching for market data",
        "Real-time updates worldwide",
      ],
      knowledgeBaseLinks: [
        "Property Listings",
        "Market Data",
        "Public Records",
      ],
      status: "active",
    },
    {
      name: "Dappier AI",
      description: "Advanced AI data processing and real estate insights",
      icon: <Sparkles className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-600",
      capabilities: [
        "Predictive property valuations",
        "Market trend forecasting",
        "Investor sentiment analysis",
        "Automated due diligence",
      ],
      knowledgeBaseLinks: [
        "Market Analytics",
        "Investment Strategies",
        "Risk Assessment",
      ],
      status: "configured",
    },
    {
      name: "Docker Hub",
      description: "Containerized services for scalable data operations",
      icon: <Container className="w-8 h-8" />,
      color: "from-sky-500 to-blue-600",
      capabilities: [
        "Isolated data processing environments",
        "Scalable API containers",
        "Automated deployment pipelines",
        "Version-controlled services",
      ],
      knowledgeBaseLinks: ["API Documentation", "Developer Resources"],
      status: "configured",
    },
    {
      name: "GitHub",
      description: "Version control and collaborative data repositories",
      icon: <Github className="w-8 h-8" />,
      color: "from-gray-700 to-gray-900",
      capabilities: [
        "Template repository access",
        "Contract version history",
        "Community contributions",
        "Open-source tools integration",
      ],
      knowledgeBaseLinks: [
        "Contract Templates",
        "Educational Resources",
        "Code Examples",
      ],
      status: "active",
    },
    {
      name: "OpenWeather API",
      description: "Weather and environmental data for property assessment",
      icon: <CloudRain className="w-8 h-8" />,
      color: "from-teal-500 to-green-600",
      capabilities: [
        "Property location weather patterns",
        "Climate risk assessment",
        "Seasonal market trends",
        "Environmental impact data",
      ],
      knowledgeBaseLinks: [
        "Property Analysis",
        "Risk Factors",
        "Location Data",
      ],
      status: "active",
    },
    {
      name: "StackHawk",
      description: "Application security and vulnerability scanning",
      icon: <Shield className="w-8 h-8" />,
      color: "from-green-500 to-emerald-600",
      capabilities: [
        "Automated security testing",
        "Data protection compliance",
        "Vulnerability detection",
        "Secure API endpoints",
      ],
      knowledgeBaseLinks: ["Security Policies", "Compliance Documentation"],
      status: "configured",
    },
    {
      name: "Stripe",
      description: "Payment processing for premium services",
      icon: <CreditCard className="w-8 h-8" />,
      color: "from-violet-500 to-purple-600",
      capabilities: [
        "Secure payment transactions",
        "Subscription management",
        "Invoice generation",
        "Financial reporting",
      ],
      knowledgeBaseLinks: ["Pricing", "Billing Documentation", "Payment FAQs"],
      status: "active",
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      active: "bg-green-100 text-green-800 border-green-300",
      configured: "bg-blue-100 text-blue-800 border-blue-300",
      available: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return badges[status as keyof typeof badges] || badges.available;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Link2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">
              Model Context Protocol (MCP) Integrations
            </h2>
            <p className="text-purple-100">
              Connected AI services for intelligent data retrieval and analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-purple-100 text-sm">Active Services</p>
            <p className="text-3xl font-bold mt-1">
              {mcpServices.filter((s) => s.status === "active").length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-purple-100 text-sm">Configured</p>
            <p className="text-3xl font-bold mt-1">
              {mcpServices.filter((s) => s.status === "configured").length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-purple-100 text-sm">Total MCPs</p>
            <p className="text-3xl font-bold mt-1">{mcpServices.length}</p>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              How MCP Integrations Enhance Your Experience
            </h3>
            <p className="text-gray-700 mb-3">
              Model Context Protocol (MCP) services connect our platform to
              external data sources, AI models, and cloud services. These
              integrations enable:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                <span>
                  <strong>Real-time data retrieval</strong> from government
                  agencies, public records, and market databases
                </span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                <span>
                  <strong>AI-powered analysis</strong> of property values,
                  market trends, and investment opportunities
                </span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                <span>
                  <strong>Intelligent search</strong> across local, state, and
                  federal real estate resources
                </span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                <span>
                  <strong>Automated data updates</strong> from news sources,
                  educational materials, and market reports
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* MCP Services Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {mcpServices.map((service, index) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow"
          >
            {/* Service Header */}
            <div className={`bg-gradient-to-r ${service.color} text-white p-6`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  {service.icon}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusBadge(
                    service.status,
                  )}`}
                >
                  {service.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
              <p className="text-white/90 text-sm">{service.description}</p>
            </div>

            {/* Service Content */}
            <div className="p-6">
              {/* Capabilities */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                  Key Capabilities
                </h4>
                <ul className="space-y-2">
                  {service.capabilities.map((capability, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-sm text-gray-700"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Knowledge Base Links */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <Link2 className="w-4 h-4 mr-2 text-blue-500" />
                  Connected to Knowledge Base
                </h4>
                <div className="flex flex-wrap gap-2">
                  {service.knowledgeBaseLinks.map((link, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-700"
                    >
                      {link}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all">
                <ExternalLink className="w-4 h-4" />
                <span>View Integration Details</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage Guide */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-green-600" />
          How to Use MCP Services
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">
              1. Ask the AI Assistant
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Use the floating AI chat button (bottom-right) to ask questions.
              The AI automatically queries relevant MCP services to find the
              best answers.
            </p>
            <div className="bg-white rounded-lg p-3 text-sm text-gray-600 italic border border-green-200">
              "What are the current foreclosure programs in LA County?"
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">
              2. Access Knowledge Base
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Navigate to the Knowledge Base page to browse categorized
              resources that pull live data from MCP services.
            </p>
            <div className="bg-white rounded-lg p-3 text-sm text-gray-600 italic border border-green-200">
              Government Resources → HUD Programs (powered by Claude + APIs)
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">
              3. Property Analysis Tools
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Our calculators use MCP integrations to fetch current market data,
              interest rates, and property valuations.
            </p>
            <div className="bg-white rounded-lg p-3 text-sm text-gray-600 italic border border-green-200">
              Professional Underwriting → Auto-fetches market comps via Dappier
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">
              4. Educational Materials
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Educational content is continuously updated with the latest real
              estate trends, news, and regulations via MCP feeds.
            </p>
            <div className="bg-white rounded-lg p-3 text-sm text-gray-600 italic border border-green-200">
              Education → Market Trends (refreshed daily via GitHub & APIs)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPIntegrations;
