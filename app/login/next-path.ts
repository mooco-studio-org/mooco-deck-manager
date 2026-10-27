// `next` arrives from the query string, so it is untrusted: only same-site paths are
// followed, never `//host` or absolute URLs, and never back to the login page itself.
export function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) {
    return "/";
  }
  return next;
}

export function loginPath(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}
