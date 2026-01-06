// index.js
// PostgreSQL client setup
const { Pool } = require('pg');
const config = require('./db-config');

const pool = new Pool(config);

module.exports = pool;
