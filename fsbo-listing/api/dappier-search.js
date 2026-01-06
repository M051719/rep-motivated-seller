// dappier-search.js API endpoint
const { queryDappier } = require('../utils/dappier-search');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing query' });
    const response = await queryDappier(query);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: 'Dappier API error' });
  }
};
