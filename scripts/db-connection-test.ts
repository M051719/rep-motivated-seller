import { Pool } from 'pg';
import { DATABASE_URL } from 'dotenv';

const url = process.argv[2] || DATABASE_URL;

const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false } // For SSL mode require
});

const query = async () => {
    try {
        const res = await pool.query(`select 1 as ok, current_database() as db, current_user as user, now() as now;`);
        console.log('✅ Database connection successful:', res.rows);
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

query();
