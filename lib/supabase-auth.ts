import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

// Signs visitors in and reads who they are from the session cookies. It uses the
// publishable key and acts as the visitor — data reads and writes still go through the
// secret-key client in lib/supabase.ts. A new client per request, as @supabase/ssr requires.
export async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        // Server Components cannot write cookies; there the refreshed session is written by
        // proxy.ts instead. Server Actions can, so sign-in and sign-out land here.
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {}
      },
    },
  });
}
