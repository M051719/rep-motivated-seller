/**
 * Real-Time Data Widget
 * Displays real-time market data powered by Dappier
 */

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { useDappier } from "../hooks/useDappier";

interface RealTimeDataWidgetProps {
  location?: string;
  topic?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export default function RealTimeDataWidget({
  location,
  topic,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes default
}: RealTimeDataWidgetProps) {
  const {
    data,
    isLoading,
    error,
    searchRealTime,
    getMarketData,
    isConfigured,
  } = useDappier();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    if (location) {
      await getMarketData(location);
    } else if (topic) {
      await searchRealTime(topic);
    }
    setLastRefresh(new Date());
  }, [getMarketData, location, searchRealTime, topic]);

  useEffect(() => {
    if (isConfigured && (location || topic)) {
      fetchData();
    }
  }, [fetchData, isConfigured, location, topic]);

  useEffect(() => {
    if (autoRefresh && isConfigured) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData, isConfigured, refreshInterval]);

  if (!isConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">
              Real-Time Data Not Configured
            </h4>
            <p className="text-sm text-yellow-800">
              Add your Dappier API key to enable real-time market data and
              insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center gap-3 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading real-time data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 mb-1">
              Error Loading Data
            </h4>
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Real-Time Data</h3>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 flex items-center gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {/* Main Content */}
        {data.content && (
          <div className="text-gray-700 leading-relaxed">{data.content}</div>
        )}

        {/* Sources */}
        {data.sources && data.sources.length > 0 && (
          <div className="pt-4 border-t border-blue-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Sources:
            </h4>
            <div className="space-y-2">
              {data.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-blue-600 hover:text-blue-700 group"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium group-hover:underline">
                      {source.title}
                    </div>
                    {source.snippet && (
                      <div className="text-gray-600 text-xs mt-1">
                        {source.snippet}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-500 pt-2 border-t border-blue-100">
          Last updated: {new Date(lastRefresh).toLocaleString()}
          {autoRefresh && (
            <span className="ml-2">
              • Auto-refreshing every {refreshInterval / 60000} minutes
            </span>
          )}
        </div>
      </div>

      {/* Powered by Dappier badge */}
      <div className="mt-4 pt-4 border-t border-blue-100">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>Powered by</span>
          <a
            href="https://dappier.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Dappier
          </a>
        </div>
      </div>
    </div>
  );
}
