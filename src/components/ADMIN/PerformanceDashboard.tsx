import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface MetricCardProps {
  title: string;
  value: string | number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    databaseConnections: 0,
    apiResponseTime: 0,
    errorRate: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await supabase.functions.invoke("performance-metrics");
      setMetrics(response.data);
    };

    const interval = setInterval(fetchMetrics, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="performance-dashboard">
      <MetricCard title="DB Connections" value={metrics.databaseConnections} />
      <MetricCard
        title="API Response Time"
        value={`${metrics.apiResponseTime}ms`}
      />
      <MetricCard title="Error Rate" value={`${metrics.errorRate}%`} />
      <MetricCard title="Active Users" value={metrics.activeUsers} />
    </div>
  );
};
