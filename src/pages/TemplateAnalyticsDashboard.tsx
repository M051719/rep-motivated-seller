import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, BarChart3, Download, Star, FileText, PieChart } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface TrendingTemplate {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  recent_downloads: number;
  total_downloads: number;
}

interface CategoryStat {
  category: string;
  subcategory: string;
  template_count: number;
  total_downloads: number;
  avg_downloads: number;
}

const TemplateAnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [trendingTemplates, setTrendingTemplates] = useState<TrendingTemplate[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [mostPopular, setMostPopular] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch trending templates
      const { data: trending, error: trendingError } = await supabase
        .rpc('get_trending_templates', { days_back: 30, limit_count: 10 });

      if (trendingError) throw trendingError;
      setTrendingTemplates(trending || []);

      // Fetch category stats
      const { data: catStats, error: catError } = await supabase
        .rpc('get_category_stats');

      if (catError) throw catError;
      setCategoryStats(catStats || []);

      // Calculate totals
      const { data: templates, error: templatesError } = await supabase
        .from('templates_forms')
        .select('download_count')
        .eq('is_active', true);

      if (templatesError) throw templatesError;

      setTotalTemplates(templates?.length || 0);
      const totalDL = templates?.reduce((sum, t) => sum + (t.download_count || 0), 0) || 0;
      setTotalDownloads(totalDL);

      // Get most popular template
      const { data: popular, error: popularError } = await supabase
        .from('templates_forms')
        .select('name, download_count, category')
        .eq('is_active', true)
        .order('download_count', { ascending: false })
        .limit(1)
        .single();

      if (!popularError) setMostPopular(popular);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-4 rounded-full bg-opacity-10 ${color.replace('border', 'bg')}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton fallbackPath="/admin" />

        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Template Analytics
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Track downloads, trends, and popular templates
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={FileText}
                label="Total Templates"
                value={totalTemplates}
                color="border-blue-500"
              />
              <StatCard
                icon={Download}
                label="Total Downloads"
                value={totalDownloads.toLocaleString()}
                color="border-green-500"
              />
              <StatCard
                icon={TrendingUp}
                label="Trending Templates"
                value={trendingTemplates.length}
                color="border-purple-500"
              />
              <StatCard
                icon={Star}
                label="Most Popular"
                value={mostPopular?.name.substring(0, 15) + '...' || 'N/A'}
                color="border-yellow-500"
              />
            </div>

            {/* Trending Templates */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Trending Templates (Last 30 Days)
                </h2>
              </div>

              {trendingTemplates.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No trending templates yet. Downloads will appear here.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Template Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Recent Downloads
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Downloads
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trendingTemplates.map((template, index) => (
                        <tr key={template.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {template.name}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            <div>
                              <p className="font-medium">{template.category}</p>
                              {template.subcategory && (
                                <p className="text-xs text-gray-500">{template.subcategory}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                              {template.recent_downloads}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {template.total_downloads}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Category Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Category Statistics
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryStats.map((stat, index) => (
                  <motion.div
                    key={`${stat.category}-${stat.subcategory}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {stat.category}
                        </h3>
                        {stat.subcategory && (
                          <p className="text-sm text-gray-600">{stat.subcategory}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {stat.template_count}
                        </p>
                        <p className="text-xs text-gray-500">templates</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Downloads</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {Number(stat.total_downloads).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Avg Downloads</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {Number(stat.avg_downloads).toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateAnalyticsDashboard;
