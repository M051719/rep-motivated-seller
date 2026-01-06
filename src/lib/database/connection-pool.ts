import { Pool } from "pg";

class DatabasePool {
  private static instance: DatabasePool;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of connections
      min: 5, // Minimum number of connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log("Executed query", { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error("Database query error", { text, error });
      throw error;
    }
  }

  async end() {
    await this.pool.end();
  }
}

export default DatabasePool.getInstance();
