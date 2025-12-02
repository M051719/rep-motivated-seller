import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, Filter, BookOpen, Plus } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import FavoriteButton from '../components/FavoriteButton';
import toast from 'react-hot-toast';

interface ContractDocument {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  file_url: string;
  file_name: string;
  file_type: string;
  download_count: number;
  is_featured: boolean;
  favorite_count?: number;
}

// Keep existing categories for backwards compatibility
const categories = ['All', 'Legal', 'Wholesale', 'Options', 'Financing', 'Marketing', 'Education'];

const ContractsLibraryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [contracts, setContracts] = useState<ContractDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchContracts();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates_forms')
        .select('*')
        .in('category', ['contract', 'form'])
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || contract.subcategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (contract: ContractDocument) => {
    try {
      // Open file in new tab
      window.open(contract.file_url, '_blank');
      
      // Increment download count
      await supabase.rpc('increment_template_download', {
        template_id: contract.id
      });

      // Update local state
      setContracts(prev => prev.map(c => 
        c.id === contract.id 
          ? { ...c, download_count: c.download_count + 1 }
          : c
      ));

      toast.success('Opening document...');
    } catch (error: any) {
      console.error('Error downloading:', error);
      toast.error('Failed to download document');
    }
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

        {/* Admin Upload Button */}
        {isAdmin && (
          <div className="mb-8 text-center">
            <Link
              to="/admin/template-upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Manage Contracts
            </Link>
          </div>
        )}

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

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading contracts...</p>
          </div>
        ) : (
          <>
            {/* Contracts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContracts.map((contract, index) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">
                        {contract.subcategory || contract.category}
                      </span>
                      {contract.is_featured && (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                          ⭐ Featured
                        </span>
                      )}
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
                      {contract.description || 'No description available'}
                    </p>

                    {/* Stats */}
                    {contract.download_count > 0 && (
                      <p className="text-xs text-gray-500 mb-4">
                        📥 {contract.download_count} downloads
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <FavoriteButton 
                        templateId={contract.id}
                        initialFavorited={false}
                        showCount={true}
                        count={contract.favorite_count || 0}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      />
                      <button
                        onClick={() => handleDownload(contract)}
                        className="flex-1 inline-flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
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
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                {isAdmin && (
                  <Link
                    to="/admin/template-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Contracts
                  </Link>
                )}
              </div>
            )}
          </>
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
