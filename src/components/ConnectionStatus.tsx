import React, { useState, useEffect } from 'react';
import { runEnhancedDiagnostics, quickHealthCheck } from '../utils/diagnostics';

interface ConnectionStatusProps {
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const EnhancedConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetails = false, 
  autoRefresh = true, 
  refreshInterval = 30000 
}) => {
  const [status, setStatus] = useState<{
    overall: 'healthy' | 'degraded' | 'failed' | 'loading';
    details?: any;
    lastCheck: Date | null;
    isChecking: boolean;
  }>({
    overall: 'loading',
    lastCheck: null,
    isChecking: true
  });

  const runCheck = async (detailed = false) => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      if (detailed) {
        const result = await runEnhancedDiagnostics();
        setStatus({
          overall: result.overall,
          details: result,
          lastCheck: new Date(),
          isChecking: false
        });
      } else {
        const healthy = await quickHealthCheck();
        setStatus({
          overall: healthy ? 'healthy' : 'failed',
          lastCheck: new Date(),
          isChecking: false
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus({
        overall: 'failed',
        lastCheck: new Date(),
        isChecking: false
      });
    }
  };

  useEffect(() => {
    // Initial check
    runCheck(showDetails);

    // Auto-refresh
    if (autoRefresh) {
      const interval = setInterval(() => runCheck(false), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [showDetails, autoRefresh, refreshInterval]);

  const getStatusColor = () => {
    switch (status.overall) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = () => {
    switch (status.overall) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'failed': return '🔴';
      default: return '🔄';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <div className="font-semibold">
              System {status.overall.toUpperCase()}
              {status.isChecking && ' (Checking...)'}
            </div>
            {status.lastCheck && (
              <div className="text-xs opacity-75">
                Last check: {status.lastCheck.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => runCheck(true)}
          disabled={status.isChecking}
          className="px-2 py-1 text-xs bg-white rounded hover:bg-gray-50 disabled:opacity-50"
        >
          {status.isChecking ? '⏳' : '🔄'} Check
        </button>
      </div>

      {showDetails && status.details && (
        <div className="mt-3 space-y-1 text-sm border-t pt-2">
          <div className={status.details.environment ? 'text-green-600' : 'text-red-600'}>
            {status.details.environment ? '✅' : '❌'} Environment
          </div>
          <div className={status.details.auth.success ? 'text-green-600' : 'text-red-600'}>
            {status.details.auth.success ? '✅' : '❌'} Authentication 
            {status.details.auth.authenticated && ' (Logged in)'}
          </div>
          <div className={status.details.database ? 'text-green-600' : 'text-red-600'}>
            {status.details.database ? '✅' : '❌'} Database
          </div>
          <div className={status.details.rls.accessible ? 'text-green-600' : 'text-yellow-600'}>
            {status.details.rls.accessible ? '✅' : '⚠️'} Data Access
          </div>
        </div>
      )}
    </div>
  );
};