// db-config.js
// PostgreSQL connection config using 'pg' library
module.exports = {
  user: process.env.PGUSER || 'your_db_user',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'fsbo_db',
  password: process.env.PGPASSWORD || 'your_db_password',
  port: process.env.PGPORT || 5432,
};
