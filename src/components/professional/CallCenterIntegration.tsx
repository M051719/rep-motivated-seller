// src/components/professional/CallCenterIntegration.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const CallCenterIntegration: React.FC = () => {
  const [campaign, setCampaign] = useState({
    name: '',
    script: '',
    leadList: [],
    status: 'draft'
  });

  // Integrate with multiple services
  const callServices = {
    twilio: {
      name: 'Twilio Flex',
      features: ['Auto-dialing', 'Call recording', 'Live transfer'],
      pricing: '$150/agent/month'
    },
    aircall: {
      name: 'Aircall',
      features: ['Power dialer', 'Click-to-call', 'Analytics'],
      pricing: '$30/user/month'
    },
    justcall: {
      name: 'JustCall',
      features: ['Auto-dialer', 'SMS', 'Call tracking'],
      pricing: '$48/user/month'
    },
    calltools: {
      name: 'CallTools',
      features: ['Predictive dialer', 'Lead management', 'Scripts'],
      pricing: '$99/agent/month'
    }
  };

  const initiateAICall = async (phoneNumber: string) => {
    // Using your existing Twilio setup
    const response = await fetch('/api/functions/v1/ai-voice-handler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneNumber,
        from: '+18187284993', // Your Twilio number
        script: `
          Hello, this is RepMotivatedSeller calling about foreclosure prevention assistance.
          We noticed your property may be at risk. 
          Would you like to speak with a specialist who can help you keep your home?
          Press 1 for yes, 2 for no.
        `,
        transferTo: '+18337289278' // Your business number
      })
    });
    
    return response.json();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">📞 Call Center Management</h1>
      
      {/* AI Auto-Dialer */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🤖 AI-Powered Auto Dialer</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Campaign Setup</h3>
            <input
              type="text"
              placeholder="Campaign Name"
              className="w-full px-3 py-2 border rounded-lg mb-3"
              value={campaign.name}
              onChange={(e) => setCampaign({...campaign, name: e.target.value})}
            />
            
            <textarea
              placeholder="Call Script"
              className="w-full px-3 py-2 border rounded-lg h-32"
              value={campaign.script}
              onChange={(e) => setCampaign({...campaign, script: e.target.value})}
            />
            
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Start Campaign
            </button>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Live Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span>Calls Made:</span>
                <span className="font-bold">247</span>
              </div>
              <div className="flex justify-between p-3 bg-green-50 rounded">
                <span>Connected:</span>
                <span className="font-bold text-green-600">89</span>
              </div>
              <div className="flex justify-between p-3 bg-yellow-50 rounded">
                <span>Interested:</span>
                <span className="font-bold text-yellow-600">34</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 rounded">
                <span>Appointments Set:</span>
                <span className="font-bold text-blue-600">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outsourced Call Centers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">🌍 Outsourced Call Centers</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-bold">Philippines Team</h3>
            <p className="text-sm text-gray-600">$5-8/hour</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>✓ English fluent</li>
              <li>✓ Real estate trained</li>
              <li>✓ 24/7 availability</li>
            </ul>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Hire Team
            </button>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-bold">Latin America Team</h3>
            <p className="text-sm text-gray-600">$6-10/hour</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>✓ Same timezone</li>
              <li>✓ Bilingual (Spanish)</li>
              <li>✓ Cultural alignment</li>
            </ul>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Hire Team
            </button>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-bold">US-Based Team</h3>
            <p className="text-sm text-gray-600">$15-25/hour</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>✓ Local knowledge</li>
              <li>✓ Licensed agents</li>
              <li>✓ Premium service</li>
            </ul>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Hire Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallCenterIntegration;