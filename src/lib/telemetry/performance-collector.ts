export class PerformanceCollector {
  private static metrics: Map<string, number[]> = new Map();

  static recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.get(name)!.length > 1000) {
      this.metrics.get(name)!.shift();
    }
  }

  static getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || [];
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  static async sendMetricsToMonitoring() {
    const aggregated = {};
    for (const [key, values] of this.metrics.entries()) {
      aggregated[key] = {
        avg: this.getAverageMetric(key),
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    }

    // Send to monitoring service (implement based on your choice)
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aggregated),
    });
  }
}

// Usage throughout your application:
// PerformanceCollector.recordMetric('api_response_time', responseTime)
// PerformanceCollector.recordMetric('database_query_time', queryTime)
