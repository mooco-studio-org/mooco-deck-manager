import { NextResponse, type NextRequest } from "next/server";
import { createAuthClient } from "@/lib/supabase-auth";
import { safeNextPath } from "@/app/login/next-path";

// Google sends the visitor back here with a one-time code. Exchanging it writes the session
// cookies; the code verifier it needs was stored in a cookie when the sign-in started.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next") ?? undefined);

  if (code) {
    const auth = await createAuthClient();
    const { error } = await auth.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  const failed = new URL("/login", request.url);
  failed.searchParams.set("error", "1");
  failed.searchParams.set("next", next);
  return NextResponse.redirect(failed);
}
