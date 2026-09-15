import type { Viewer } from "./presentations";

// Supabase Auth lands in a later phase; the seam exists now so that authorization is
// never retrofitted into the pages.
export async function getViewer(): Promise<Viewer> {
  return { isTeamMember: true };
}
