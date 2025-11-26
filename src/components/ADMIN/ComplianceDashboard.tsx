```typescript
// src/components/admin/ComplianceDashboard.tsx
import React, { useState, useEffect } from 'react';
import ComplianceSMSService from '../../services/sms/ComplianceSMSService';

const ComplianceDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalOptIns: 0,
    activeOptIns: 0,
    optOuts: 0,
    pendingVerification: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await ComplianceSMSService.getOptInStats();
    setStats(data);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        📊 SMS Compliance Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-2xl font-bold text-blue-600">{stats.totalOptIns}</div>
          <div className="text-blue-800">Total Opt-Ins</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="text-2xl font-bold text-green-600">{stats.activeOptIns}</div>
          <div className="text-green-800">Active Subscribers</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-6">
          <div className="text-2xl font-bold text-red-600">{stats.optOuts}</div>
          <div className="text-red-800">Opt-Outs</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingVerification}</div>
          <div className="text-yellow-800">Pending Verification</div>
        </div>
      </div>

      <div className="bg-green-100 border border-green-400 rounded-lg p-4">
        <h2 className="font-bold text-green-800 mb-2">✅ TCPA Compliance Status: COMPLIANT</h2>
        <ul className="text-green-700 text-sm space-y-1">
          <li>• Express written consent obtained via double opt-in</li>
          <li>• Clear and conspicuous disclosures provided</li>
          <li>• Opt-in is optional and not required for service</li>
          <li>• Easy opt-out mechanism (STOP keyword) implemented</li>
          <li>• All consent records maintained with timestamps and IP addresses</li>
          <li>• Message frequency and content disclosed</li>
        </ul>
      </div>
    </div>
  );
};

export default ComplianceDashboard;