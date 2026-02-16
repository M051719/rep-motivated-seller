serve(async (req) => {
  const checks = await Promise.allSettled([
    checkDatabaseHealth(),
    checkStorageHealth(),
    checkAuthHealth(),
    checkExternalAPIs(),
  ]);

  const results = checks.map((check, index) => ({
    service: ["database", "storage", "auth", "external"][index],
    status: check.status === "fulfilled" ? "healthy" : "unhealthy",
    details: check.status === "fulfilled" ? check.value : check.reason,
  }));

  const overallHealth = results.every((r) => r.status === "healthy")
    ? "healthy"
    : "degraded";

  return Response.json({
    status: overallHealth,
    timestamp: new Date().toISOString(),
    services: results,
  });
});
