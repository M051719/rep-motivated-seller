import { describe, it, expect } from 'vitest';

describe('Vitest Setup Test', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have environment variables', () => {
    expect(process.env.VITE_SUPABASE_URL).toBeDefined();
  });
});
