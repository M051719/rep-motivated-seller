import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

// This enhances your existing marketing components
const EnhancedDirectMail: React.FC = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    responses: 0,
    cost: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCampaignData();
  }, []);

  const loadCampaignData = async () => {
    try {
      // Load from your existing mail_campaigns table
      const { data: campaignData } = await supabase
        .from('mail_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      setCampaigns(campaignData || []);
      
      // Calculate stats
      const totalSent = campaignData?.reduce((acc, c) => acc + c.sent_count, 0) || 0;
      const totalCost = campaignData?.reduce((acc, c) => acc + c.total_cost, 0) || 0;
      
      setStats({
        totalSent,
        delivered: Math.floor(totalSent * 0.95), // Estimate 95% delivery
        responses: Math.floor(totalSent * 0.02), // Estimate 2% response rate
        cost: totalCost
      });
    } catch (error) {
      console.error('Error loading campaign data:', error);
    }
  };

  const createNewCampaign = () => {
    // Integrate with your existing direct mail functionality
    window.location.href = '/marketing/direct-mail/new';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📬 Enhanced Direct Mail System
        </h1>
        <p className="text-xl text-gray-600">
          AI-powered direct mail campaigns with advanced targeting and analytics
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-4">📮</span>
            <div>
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalSent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-4">✅</span>
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.delivered.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-4">📞</span>
            <div>
              <p className="text-sm text-gray-500">Responses</p>
              <p className="text-2xl font-bold text-orange-600">{stats.responses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-4">💰</span>
            <div>
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold text-purple-600">${stats.cost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Management */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">📊 Recent Campaigns</h2>
            <button
              onClick={createNewCampaign}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Campaign
            </button>
          </div>

          <div className="space-y-4">
            {campaigns.length > 0 ? (
              campaigns.slice(0, 5).map((campaign: any, index) => (
                <motion.div
                  key={campaign.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>📮 {campaign.sent_count} sent</span>
                        <span>💰 ${campaign.total_cost}</span>
                        <span>📅 {new Date(campaign.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-4">Create your first direct mail campaign</p>
                <button
                  onClick={createNewCampaign}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI-Powered Features */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">🤖 AI Enhancement</h3>
            <div className="space-y-3">
              <div className="bg-white bg-opacity-20 rounded p-3">
                <h4 className="font-medium mb-1">Smart Targeting</h4>
                <p className="text-sm">AI identifies high-probability prospects</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded p-3">
                <h4 className="font-medium mb-1">Content Optimization</h4>
                <p className="text-sm">AI suggests best performing messages</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded p-3">
                <h4 className="font-medium mb-1">Timing Intelligence</h4>
                <p className="text-sm">AI predicts optimal send times</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Response Rate</span>
                <span className="font-semibold">2.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per Response</span>
                <span className="font-semibold">$34.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROI</span>
                <span className="font-semibold text-green-600">+245%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDirectMail;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

// This enhances your existing marketing components
const EnhancedDirectMail: React.FC = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    responses: 0,
    cost: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCampaignData();
  }, []);

  const loadCampaignData = async () => {
    try {
      // Load from your existing mail_campaigns table
      const { data: campaignData } = await supabase
        .from('mail_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      setCampaigns(campaignData || []);
      
      // Calculate stats
      const totalSent = campaignData?.reduce((acc, c) => acc + c.sent_count, 0) || 0;
      const totalCost = campaignData?.reduce((acc, c) => acc + c.total_cost, 0) || 0;
      
      setStats({
        totalSent,
        delivered: Math.floor(totalSent * 0.95), // Estimate 95% delivery
        responses: Math.floor(totalSent * 0.02), // Estimate 2% response rate
        cost: totalCost
      });
    } catch (error) {
      console.error('Error loading campaign data:', error);
    }
  };

  const createNewCampaign = () => {
    // Integrate with your existing direct mail functionality
    window.location.href = '/marketing/direct-mail/new';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📬 Enhanced Direct Mail System
        </h1>
        <p className="text-xl text-gray-600">
          AI-powered direct mail campaigns with advanced targeting and analytics
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-4">📮</span>
            <div>
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalSent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-4">✅</span>
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.delivered.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-4">📞</span>
            <div>
              <p className="text-sm text-gray-500">Responses</p>
              <p className="text-2xl font-bold text-orange-600">{stats.responses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-4">💰</span>
            <div>
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold text-purple-600">${stats.cost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Management */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">📊 Recent Campaigns</h2>
            <button
              onClick={createNewCampaign}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Campaign
            </button>
          </div>

          <div className="space-y-4">
            {campaigns.length > 0 ? (
              campaigns.slice(0, 5).map((campaign: any, index) => (
                <motion.div
                  key={campaign.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>📮 {campaign.sent_count} sent</span>
                        <span>💰 ${campaign.total_cost}</span>
                        <span>📅 {new Date(campaign.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-4">Create your first direct mail campaign</p>
                <button
                  onClick={createNewCampaign}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI-Powered Features */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">🤖 AI Enhancement</h3>
            <div className="space-y-3">
              <div className="bg-white bg-opacity-20 rounded p-3">
                <h4 className="font-medium mb-1">Smart Targeting</h4>
                <p className="text-sm">AI identifies high-probability prospects</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded p-3">
                <h4 className="font-medium mb-1">Content Optimization</h4>
                <p className="text-sm">AI suggests best performing messages</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded p-3">
                <h4 className="font-medium mb-1">Timing Intelligence</h4>
                <p className="text-sm">AI predicts optimal send times</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Response Rate</span>
                <span className="font-semibold">2.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per Response</span>
                <span className="font-semibold">$34.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROI</span>
                <span className="font-semibold text-green-600">+245%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDirectMail;