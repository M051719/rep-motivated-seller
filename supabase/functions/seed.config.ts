import { SeedPg } from "@snaplet/seed/adapter-pg";
import { defineConfig } from "@snaplet/seed/config";
import { Client } from "pg";

export default defineConfig({
  adapter: async () => {
    const client = new Client(/* Use DATABASE_URL environment variable */);
    await client.connect();
    return new SeedPg(client);
  },
});