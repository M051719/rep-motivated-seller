export const databaseCommands = {
  "high-urgency-cases": async (timeframe = "week") => {
    const query = `
      SELECT * FROM foreclosure_responses
      WHERE urgency_level = 'high'
      AND created_at >= NOW() - INTERVAL '1 ${timeframe}'
    `;
    return await executeQuery(query);
  },
};
