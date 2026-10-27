"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase-auth";
import { safeNextPath } from "./next-path";

async function currentOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

// Any Google account may sign in: an account on its own grants nothing. What a signed-in
// viewer can open is decided per entry in lib/presentations.ts.
export async function logInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNextPath(String(formData.get("next") ?? ""));
  const callback = new URL("/auth/callback", await currentOrigin());
  callback.searchParams.set("next", next);

  const auth = await createAuthClient();
  const { data, error } = await auth.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });

  if (error || !data.url) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }
  redirect(data.url);
}

export async function logOut(): Promise<void> {
  const auth = await createAuthClient();
  await auth.auth.signOut();
  redirect("/login");
}
