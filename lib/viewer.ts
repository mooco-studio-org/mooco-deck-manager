import { cache } from "react";
import type { Viewer } from "./presentations";
import { supabase } from "./supabase";
import { createAuthClient } from "./supabase-auth";

const TEAM_DOMAIN = "@mooco.studio";

const ANONYMOUS: Viewer = { email: null, isTeamMember: false, isAdmin: false };

async function isAdmin(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data !== null;
}

// getClaims() verifies the session token instead of trusting the cookie's contents, so the
// email it returns can be used for access decisions. cache() keeps it to one check per
// request, however many components ask.
export const getViewer = cache(async (): Promise<Viewer> => {
  const auth = await createAuthClient();
  const { data } = await auth.auth.getClaims();
  const email = data?.claims.email?.toLowerCase();
  if (!email) {
    return ANONYMOUS;
  }

  return {
    email,
    isTeamMember: email.endsWith(TEAM_DOMAIN),
    isAdmin: await isAdmin(email),
  };
});
