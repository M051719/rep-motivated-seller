export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    databaseConnections: 0,
    apiResponseTime: 0,
    errorRate: 0,
    activeUsers: 0
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await supabase.functions.invoke('performance-metrics')
      setMetrics(response.data)
    }
    
    const interval = setInterval(fetchMetrics, 30000) // Update every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="performance-dashboard">
      <MetricCard title="DB Connections" value={metrics.databaseConnections} />
      <MetricCard title="API Response Time" value={`${metrics.apiResponseTime}ms`} />
      <MetricCard title="Error Rate" value={`${metrics.errorRate}%`} />
      <MetricCard title="Active Users" value={metrics.activeUsers} />
    </div>
  )
}