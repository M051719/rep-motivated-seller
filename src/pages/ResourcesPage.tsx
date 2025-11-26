import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BackButton } from '../components/ui/BackButton';

interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: 'download' | 'link' | 'tool';
  icon: string;
  link?: string;
}

const ResourcesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Resources', icon: '📚' },
    { value: 'templates', label: 'Templates & Forms', icon: '📄' },
    { value: 'guides', label: 'Guides & Checklists', icon: '📋' },
    { value: 'tools', label: 'Calculators & Tools', icon: '🔧' },
    { value: 'external', label: 'External Resources', icon: '🔗' }
  ];

  const resources: Resource[] = [
    // Deal Analysis Tools
    {
      id: 1,
      title: 'Deal Analysis Software',
      description: 'Comprehensive real estate deal analyzer for evaluating investment opportunities',
      category: 'tools',
      type: 'download',
      icon: '📊',
      link: '/downloads/Deal Analysis Software.xlsx'
    },
    {
      id: 2,
      title: 'Deal Analyzer for Flips',
      description: 'Specialized analyzer for flip properties with ROI calculations and profit projections',
      category: 'tools',
      type: 'download',
      icon: '🏘️',
      link: '/downloads/Deal+Analyzer+for+Flips.xlsx'
    },
    {
      id: 3,
      title: 'Deal Analyzer for Rentals (Basic)',
      description: 'Basic rental property analyzer with cash flow and ROI calculations',
      category: 'tools',
      type: 'download',
      icon: '🏠',
      link: '/downloads/Deal+Analyzer+for+Rentals+BASIC.xlsx'
    },
    {
      id: 4,
      title: 'Deal Analyzer for Rentals (Full)',
      description: 'Full-featured rental property analyzer with advanced metrics and projections',
      category: 'tools',
      type: 'download',
      icon: '🏢',
      link: '/downloads/Deal+Analyzer+for+Rentals+FULL.xlsx'
    },
    {
      id: 5,
      title: 'Flip or Rent Calculator',
      description: 'Decision tool to determine whether to flip or rent a property based on market conditions',
      category: 'tools',
      type: 'download',
      icon: '⚖️',
      link: '/downloads/Flip-Or-Rent-Calculator-from-Rehab-Valuator-1.xlsx'
    },
    {
      id: 6,
      title: 'Underwriting Deal Analysis Software',
      description: 'Professional underwriting analysis tool for detailed property evaluation',
      category: 'tools',
      type: 'download',
      icon: '📋',
      link: '/downloads/underwriting Deal Analysis Software.xlsx'
    },

    // Financial Calculators
    {
      id: 7,
      title: 'Amortization Table',
      description: 'Loan amortization calculator with payment schedules and interest breakdowns',
      category: 'tools',
      type: 'download',
      icon: '🧮',
      link: '/downloads/Amortization Table.xls'
    },
    {
      id: 8,
      title: 'Mortgage Calculator (Online)',
      description: 'Calculate your monthly payment and see amortization schedules instantly',
      category: 'tools',
      type: 'tool',
      icon: '💰',
      link: '/tools'
    },

    // Performance & Tracking
    {
      id: 9,
      title: 'Performance Dashboard',
      description: 'Track and monitor your property portfolio performance with visual dashboards',
      category: 'tools',
      type: 'download',
      icon: '📈',
      link: '/downloads/Performance Dashboard-2.xls'
    },
    {
      id: 10,
      title: 'Repair Estimator Worksheet',
      description: 'Detailed repair cost estimation tool for renovation projects',
      category: 'tools',
      type: 'download',
      icon: '🔧',
      link: '/downloads/Repair+Estimator+Worksheet.xlsx'
    },

    // Document Templates & References
    {
      id: 11,
      title: '3 Option LOI with Owner Financing',
      description: 'Letter of Intent template with three owner financing options (interactive docx)',
      category: 'templates',
      type: 'download',
      icon: '📝',
      link: '/downloads/Updated 3 Option LOI with Owner Finance Language.docx'
    },
    {
      id: 12,
      title: 'CAP RATES Documentation',
      description: 'Comprehensive guide to capitalization rates and their application in real estate',
      category: 'guides',
      type: 'download',
      icon: '📖',
      link: '/downloads/CAP RATES.docx'
    },
    {
      id: 13,
      title: 'Quarterly Cap Rate Survey',
      description: 'Market cap rate data and trends across different property types and regions',
      category: 'guides',
      type: 'download',
      icon: '📊',
      link: '/downloads/Quarterly_Cap_Rate_Survey_D_D_Club_edited_by_Lance_updated2.xlsx'
    },

    // External Resources
    {
      id: 14,
      title: 'HUD-Approved Housing Counselors',
      description: 'Find free housing counseling services in your area',
      category: 'external',
      type: 'link',
      icon: '🏛️',
      link: 'https://www.hud.gov/findacounselor'
    },
    {
      id: 15,
      title: 'BiggerPockets Resources',
      description: 'Access calculators, forums, and education from the largest real estate investing community',
      category: 'external',
      type: 'link',
      icon: '🌐',
      link: 'https://www.biggerpockets.com/resources'
    },
    {
      id: 16,
      title: 'Consumer Financial Protection Bureau',
      description: 'Know your rights and file complaints about lender practices',
      category: 'external',
      type: 'link',
      icon: '🛡️',
      link: 'https://www.consumerfinance.gov'
    }
  ];

  const filteredResources = selectedCategory === 'all'
    ? resources
    : resources.filter(resource => resource.category === selectedCategory);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'download': return '⬇️ Download';
      case 'link': return '🔗 Visit Site';
      case 'tool': return '🔧 Use Tool';
      default: return 'View';
    }
  };

  return (
    <>
      <Helmet>
        <title>Resources - Templates, Guides & Tools | RepMotivatedSeller</title>
        <meta name="description" content="Free templates, guides, calculators, and tools to help you save your home from foreclosure." />
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
              Free templates, guides, calculators, and tools to help you navigate foreclosure
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
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center">
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hardship Letter Template</h3>
                <p className="text-gray-600 mb-4">Downloaded 5,200+ times</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Download
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">🧮</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Calculator</h3>
                <p className="text-gray-600 mb-4">Used 12,300+ times</p>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                  Use Tool
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">📖</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Prevention Guide</h3>
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
