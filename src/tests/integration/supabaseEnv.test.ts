import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { resolveSupabaseEnv, supabase } from "../../lib/supabase";

const restoreEnvValue = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

describe("Supabase environment configuration", () => {
  it("initializes the client when VITE_ env vars are present", () => {
    const env = resolveSupabaseEnv();
    expect(process.env.VITE_SUPABASE_URL).toBeTruthy();
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeTruthy();
    expect(env.url).toBe(process.env.VITE_SUPABASE_URL);
    expect(env.anonKey).toBe(process.env.VITE_SUPABASE_ANON_KEY);
    expect(supabase).toBeDefined();
  });

  it("falls back to SUPABASE_ env vars when VITE_ values are missing", () => {
    const originalEnv = {
      viteUrl: process.env.VITE_SUPABASE_URL,
      viteKey: process.env.VITE_SUPABASE_ANON_KEY,
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_ANON_KEY,
    };

    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;
    process.env.SUPABASE_URL = "https://fallback.supabase.co";
    process.env.SUPABASE_ANON_KEY = "fallback-anon-key";

    const env = resolveSupabaseEnv();
    expect(env.url).toBe("https://fallback.supabase.co");
    expect(env.anonKey).toBe("fallback-anon-key");

    expect(() => createClient(env.url!, env.anonKey!)).not.toThrow();

    restoreEnvValue("VITE_SUPABASE_URL", originalEnv.viteUrl);
    restoreEnvValue("VITE_SUPABASE_ANON_KEY", originalEnv.viteKey);
    restoreEnvValue("SUPABASE_URL", originalEnv.url);
    restoreEnvValue("SUPABASE_ANON_KEY", originalEnv.key);
  });
});
