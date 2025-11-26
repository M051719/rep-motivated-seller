import React, { useState, useEffect } from 'react';
import { HubSpotService, ConnectionTest, SyncStats, SyncError } from '../../services/hubspot/HubSpotService';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';

export const HubSpotSyncDashboard: React.FC = () => {
  const [connectionTests, setConnectionTests] = useState<ConnectionTest[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [syncErrors, setSyncErrors] = useState<SyncError[]>([]);
  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tests, stats, errors, unsynced] = await Promise.all([
        HubSpotService.validateConnection(),
        HubSpotService.getSyncStats(),
        HubSpotService.getSyncErrors(20),
        HubSpotService.getUnsyncedCount()
      ]);

      setConnectionTests(tests);
      setSyncStats(stats);
      setSyncErrors(errors);
      setUnsyncedCount(unsynced);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSync = async () => {
    setSyncing(true);
    try {
      const result = await HubSpotService.bulkSync(10);
      alert(`Sync complete!\nSuccessful: ${result.successful_syncs}\nErrors: ${result.errors}`);
      await loadDashboardData();
    } catch (error) {
      console.error('Bulk sync error:', error);
      alert('Bulk sync failed. Check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  const handleRetryFailed = async () => {
    setSyncing(true);
    try {
      const result = await HubSpotService.retryFailedSyncs();
      alert(`Retry complete!\nSuccessful: ${result.successful_syncs}\nErrors: ${result.errors}`);
      await loadDashboardData();
    } catch (error) {
      console.error('Retry error:', error);
      alert('Retry failed. Check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  const handleResolveError = async (errorId: string) => {
    const notes = prompt('Enter resolution notes (optional):');
    const success = await HubSpotService.resolveError(errorId, notes || undefined);
    
    if (success) {
      alert('Error marked as resolved');
      await loadDashboardData();
    } else {
      alert('Failed to resolve error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">HubSpot Integration Dashboard</h1>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="space-y-3">
          {connectionTests.map((test, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{test.test_name}</p>
                <p className="text-sm text-gray-600">{test.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Statistics */}
      {syncStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
            <p className="text-3xl font-bold text-gray-900">{syncStats.total_submissions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Synced</p>
            <p className="text-3xl font-bold text-green-600">{syncStats.synced_count}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-orange-600">{syncStats.pending_count}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Sync Rate</p>
            <p className="text-3xl font-bold text-blue-600">{syncStats.sync_rate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleBulkSync}
            disabled={syncing || unsyncedCount === 0}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync 10 Submissions
          </button>
          <button
            onClick={handleRetryFailed}
            disabled={syncing || syncErrors.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Retry Failed Syncs
          </button>
          <a
            href="https://app.hubspot.com/contacts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <ExternalLink className="w-4 h-4" />
            Open HubSpot
          </a>
        </div>
        {unsyncedCount > 0 && (
          <p className="mt-4 text-sm text-gray-600">
            {unsyncedCount} unsynced submission{unsyncedCount !== 1 ? 's' : ''} ready to sync
          </p>
        )}
      </div>

      {/* Sync Errors */}
      {syncErrors.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Sync Errors</h2>
          <div className="space-y-3">
            {syncErrors.map((error) => (
              <div key={error.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {error.table_name} - {error.record_id}
                    </p>
                    <p className="text-sm text-red-600 mt-1">{error.error_message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(error.created_at).toLocaleString()} • Attempts: {error.retry_count}
                    </p>
                  </div>
                  <button
                    onClick={() => handleResolveError(error.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Resolve
                  </button>
                </div>
                {error.notes && (
                  <p className="text-sm text-gray-600 mt-2 pl-3 border-l-2 border-gray-300">
                    {error.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {syncErrors.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No sync errors to display</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubSpotSyncDashboard;
