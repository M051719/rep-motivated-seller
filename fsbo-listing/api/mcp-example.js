// mcp-example.js
// Example: Using MCP API key from .env.mcp in an API call
const MCP_API_KEY = require('../load-env-mcp');
const fetch = require('node-fetch');

async function callMcpApi(query) {
  const response = await fetch('https://api.mcp.com/endpoint', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MCP_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error('MCP API error');
  return await response.json();
}

// Example usage:
// callMcpApi('your-query-here').then(console.log).catch(console.error);

module.exports = { callMcpApi };
