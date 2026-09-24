import "server-only";
import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

// The secret key bypasses row level security, so every read and write through this
// client is filtered by the app layer instead. It must never reach the browser — hence
// `server-only` above. Until Supabase Auth lands there is no user session to build a
// per-request client from.
export const supabase = createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SECRET_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);
