// dappier-search.js
// Utility to call Dappier Datamodel API from backend
const fetch = require('node-fetch');

const DAPPIER_API_URL = 'https://api.dappier.com/app/aimodel/am_01j06ytn18ejftedz6dyhz2b15';
const DAPPIER_API_KEY = process.env.DAPPIER_API_KEY || 'YOUR_API_KEY_HERE';

async function queryDappier(query) {
  const res = await fetch(DAPPIER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAPPIER_API_KEY}`
    },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Dappier API error');
  const data = await res.json();
  return data.response;
}

module.exports = { queryDappier };
