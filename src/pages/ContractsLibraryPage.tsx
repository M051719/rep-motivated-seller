import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, Filter, BookOpen } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';

interface ContractDocument {
  name: string;
  filename: string;
  category: string;
  description: string;
}

const contracts: ContractDocument[] = [
  {
    name: '100 Point List - Best Practices',
    filename: '100_POINT_LIST_-_BEST_PRACTICES.pdf',
    category: 'Education',
    description: 'Comprehensive checklist for real estate investment best practices'
  },
  {
    name: 'Affidavit of Equitable Interest',
    filename: 'Affidavit-of-Equitable-Interest.pdf',
    category: 'Legal',
    description: 'Legal document establishing equitable interest in property'
  },
  {
    name: 'Assignment Agreement Contract',
    filename: 'Assignment_Agreement_Template.pdf',
    category: 'Wholesale',
    description: 'Standard assignment agreement for wholesale transactions'
  },
  {
    name: 'Assignment of Purchase and Sale Agreement',
    filename: 'Assignment+of+Purchase+and+Sale+Ageement.docx',
    category: 'Wholesale',
    description: 'Complete assignment of purchase and sale agreement template'
  },
  {
    name: 'Benefits of Owner Financing',
    filename: 'BENEFITS OF OWNER FINANCING.docx',
    category: 'Education',
    description: 'Guide to owner financing benefits and strategies'
  },
  {
    name: 'Blank Option Agreement',
    filename: 'Blank-Option-Agreement.pdf',
    category: 'Options',
    description: 'Blank option agreement template for lease options'
  },
  {
    name: 'Buyer Assignment Agreement',
    filename: 'Buyer Assignment Agreement.pdf',
    category: 'Wholesale',
    description: 'Agreement for assigning contracts to end buyers'
  },
  {
    name: 'Confidentiality Agreement',
    filename: 'Confidentiality-agreement-template.pdf',
    category: 'Legal',
    description: 'Non-disclosure agreement for protecting confidential information'
  },
  {
    name: 'Confidentiality Non-Circumvent Agreement',
    filename: 'Confidentiality - Non-Circumvent Agreement.doc',
    category: 'Legal',
    description: 'Protects parties from being bypassed in transactions'
  },
  {
    name: 'Cover Letter for Private Lender Credibility',
    filename: 'Cover+Letter+for+Private+Lender+Credibility+Package.pdf',
    category: 'Financing',
    description: 'Professional cover letter template for private lender packages'
  },
  {
    name: 'Credit Repair eBook',
    filename: 'Credit-Repair-ebook.pdf',
    category: 'Education',
    description: 'Comprehensive guide to credit repair strategies'
  },
  {
    name: 'Deed of Trust Equity',
    filename: 'Deed-of-Trust-Equity-PDF-1.pdf',
    category: 'Legal',
    description: 'Deed of trust document for equity transactions'
  },
  {
    name: 'Executive Summary Template - Wholesale',
    filename: 'Executive Summary template - Wholesale.pdf',
    category: 'Marketing',
    description: 'Professional executive summary for wholesale deals'
  },
  {
    name: 'Exit Strategies as Investors',
    filename: 'Exit+Strategies+as+Investors.pdf',
    category: 'Education',
    description: 'Guide to various exit strategies for real estate investors'
  },
  {
    name: 'JV Agreement',
    filename: 'JV-Agreement-PDF-1.pdf',
    category: 'Partnership',
    description: 'Joint venture agreement template for partnerships'
  },
  {
    name: 'Letter of Intent Template',
    filename: 'LOI_2template.pdf',
    category: 'Negotiation',
    description: 'Standard letter of intent for property purchases'
  },
  {
    name: 'LOI Multi-Family Template',
    filename: 'LOI-Multi-Family-Template-my0cim.pdf',
    category: 'Negotiation',
    description: 'Specialized LOI template for multi-family properties'
  },
  {
    name: 'Limited Partnership Agreement (WA)',
    filename: 'Limited-Partnership-Agreement-Template-WA-Fillable.pdf',
    category: 'Partnership',
    description: 'Washington state limited partnership agreement'
  },
  {
    name: 'Own Nothing Control Everything',
    filename: 'Letter_of_Intent-Own_Nothing_Control_Everything.pdf',
    category: 'Strategy',
    description: 'Asset protection strategy documentation'
  },
  {
    name: 'Purchase and Sale Agreement',
    filename: 'Purchase-and-Sale-Agreement-Template-v1.0-uam30m.pdf',
    category: 'Contract',
    description: 'Standard purchase and sale agreement template'
  }
];

const categories = ['All', 'Wholesale', 'Legal', 'Education', 'Financing', 'Partnership', 'Negotiation', 'Marketing', 'Options', 'Strategy', 'Contract'];

const ContractsLibraryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || contract.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (filename: string, name: string) => {
    const link = document.createElement('a');
    link.href = `/contracts/${filename}`;
    link.download = filename;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Contracts Library
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional real estate contracts, agreements, and educational resources for investors
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredContracts.length} of {contracts.length} contracts
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map((contract, index) => (
            <motion.div
              key={contract.filename}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">
                    {contract.category}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-4">
                  <FileText className="w-12 h-12 text-primary-600" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {contract.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {contract.description}
                </p>

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(contract.filename, contract.name)}
                  className="w-full inline-flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No contracts found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Legal Disclaimer
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  These contract templates are provided for educational purposes only. Always consult with a qualified attorney before using any legal documents. RepMotivatedSeller is not a law firm and does not provide legal advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsLibraryPage;
