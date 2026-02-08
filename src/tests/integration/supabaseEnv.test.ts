import { describe, it, expect } from "vitest";
import { supabase } from "../../lib/supabase";

describe("Supabase environment configuration", () => {
  it("initializes the client when VITE_ env vars are present", () => {
    expect(process.env.VITE_SUPABASE_URL).toBeTruthy();
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeTruthy();
    expect(supabase).toBeDefined();
  });
});
