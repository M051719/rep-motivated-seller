import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres.ltxqodqlexvojqqxquew:Lamage02#007@aws-0-us-east-2.pooler.supabase.com:6543/postgres",
  },
} satisfies Config;
