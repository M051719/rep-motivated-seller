// src/components/professional/ProfessionalDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const ProfessionalDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeCalls: 0,
    mailsSent: 0,
    dealsAnalyzed: 0,
    propertiesResearched: 0,
    totalProfit: 0,
    activeLeads: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // Load real stats from database
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch stats from various tables
    const [calls, mails, deals, properties] = await Promise.all([
      supabase.from('call_campaigns').select('calls_made').eq('user_id', user.id),
      supabase.from('mailing_campaigns').select('sent_count').eq('user_id', user.id),
      supabase.from('deal_analyses').select('*').eq('user_id', user.id),
      supabase.from('property_searches').select('*').eq('user_id', user.id)
    ]);

    setStats({
      activeCalls: calls.data?.reduce((sum, c) => sum + c.calls_made, 0) || 0,
      mailsSent: mails.data?.reduce((sum, m) => sum + m.sent_count, 0) || 0,
      dealsAnalyzed: deals.data?.length || 0,
      propertiesResearched: properties.data?.length || 0,
      totalProfit: 0, // Calculate from deals
      activeLeads: 0 // Calculate from CRM
    });
  };

  const tools = [
    {
      title: 'Call Center',
      icon: '📞',
      description: 'AI-powered auto-dialing and outsourced teams',
      link: '/pro/call-center',
      color: 'from-blue-500 to-blue-600',
      stats: `${stats.activeCalls} calls made`
    },
    {
      title: 'Direct Mail',
      icon: '📬',
      description: 'Send LOIs, postcards, and offers automatically',
      link: '/pro/mailing',
      color: 'from-green-500 to-green-600',
      stats: `${stats.mailsSent} pieces sent`
    },
    {
      title: 'Property Research',
      icon: '🔍',
      description: 'Title search, liens, Zillow & Google data',
      link: '/pro/property-research',
      color: 'from-purple-500 to-purple-600',
      stats: `${stats.propertiesResearched} researched`
    },
    {
      title: 'Deal Analyzer',
      icon: '📊',
      description: 'Flip, rental, and wholesale analysis',
      link: '/pro/deal-analyzer',
      color: 'from-orange-500 to-orange-600',
      stats: `${stats.dealsAnalyzed} analyzed`
    },
    {
      title: 'Lead Manager',
      icon: '👥',
      description: 'CRM and pipeline management',
      link: '/pro/leads',
      color: 'from-indigo-500 to-indigo-600',
      stats: `${stats.activeLeads} active leads`
    },
    {
      title: 'Documents',
      icon: '📄',
      description: 'Contracts, LOIs, and templates',
      link: '/pro/documents',
      color: 'from-pink-500 to-pink-600',
      stats: 'All templates ready'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🏆 Professional Tools Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Everything you need to find, analyze, and close real estate deals
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">This Month's Profit</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalProfit.toLocaleString()}
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Leads</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.activeLeads}
              </p>
            </div>
            <span className="text-3xl">🎯</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Properties Analyzed</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.propertiesResearched}
              </p>
            </div>
            <span className="text-3xl">🏠</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Marketing Sent</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.mailsSent + stats.activeCalls}
              </p>
            </div>
            <span className="text-3xl">📮</span>
          </div>
        </motion.div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={tool.link}
              className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className={`h-2 bg-gradient-to-r ${tool.color} rounded-t-lg`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{tool.icon}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {tool.stats}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {tool.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📈 Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Property analyzed: 123 Main St</span>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center space-x-3">
              <span className="text-blue-500">📞</span>
              <span className="text-sm">Call campaign completed: 50 contacts</span>
            </div>
            <span className="text-xs text-gray-500">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center space-x-3">
              <span className="text-purple-500">📬</span>
              <span className="text-sm">100 postcards sent to pre-foreclosure list</span>
            </div>
            <span className="text-xs text-gray-500">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;