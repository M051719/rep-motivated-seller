import { Pool, type PoolConfig } from "pg";

export type DatabasePoolInitOptions = {
  connectionString?: string;
  ssl?: PoolConfig["ssl"];
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  statement_timeout?: number;
  query_timeout?: number;
};

class DatabasePool {
  private static instance: DatabasePool | undefined;
  private static initOptions: DatabasePoolInitOptions | undefined;

  private pool: Pool;

  private constructor(options?: DatabasePoolInitOptions) {
    const opts = options ?? DatabasePool.initOptions;

    this.pool = new Pool({
      connectionString: opts?.connectionString ?? process.env.DATABASE_URL,
      max: opts?.max ?? 20,
      idleTimeoutMillis: opts?.idleTimeoutMillis ?? 30000,
      connectionTimeoutMillis: opts?.connectionTimeoutMillis ?? 2000,
      statement_timeout: opts?.statement_timeout,
      query_timeout: opts?.query_timeout,
      ssl: opts?.ssl,
    });
  }

  /** Configure and (if already created) rebuild the singleton pool. */
  static init(options: DatabasePoolInitOptions) {
    DatabasePool.initOptions = options;

    if (DatabasePool.instance) {
      // Ignore errors when closing the existing pool to allow graceful recreation
      DatabasePool.instance.pool.end().catch((error) => {
        console.warn("Failed to close existing database pool during reinitialization", error);
      });
      DatabasePool.instance = new DatabasePool(options);
    }
  }

  /** Dispose the singleton pool and clear init options. */
  static async reset() {
    if (DatabasePool.instance) {
      await DatabasePool.instance.pool.end().catch(() => {});
    }
    DatabasePool.instance = undefined;
    DatabasePool.initOptions = undefined;
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
export { DatabasePool };
