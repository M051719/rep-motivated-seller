// load-env-mcp.js
// Loads .env.mcp for MCP API key usage
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.mcp') });

// Now process.env.MCP_API_KEY is available
module.exports = process.env.MCP_API_KEY;
