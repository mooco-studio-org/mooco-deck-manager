import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const REMEMBER_FOR_SECONDS = 60 * 60 * 24 * 30;

function secret(): string {
  const value = process.env.DECK_UNLOCK_SECRET;
  if (!value) {
    throw new Error("Missing environment variable DECK_UNLOCK_SECRET");
  }
  return value;
}

function cookieName(entryId: string): string {
  return `deck-unlock-${entryId}`;
}

// The cookie proves the browser once typed the right password without storing it: it is
// an HMAC of the entry and its current password. Changing the password changes the
// expected value, so every browser that unlocked the old one has to ask again.
function tokenFor(entryId: string, password: string): string {
  return createHmac("sha256", secret()).update(`${entryId}:${password}`).digest("base64url");
}

export function sameSecret(attempt: string, actual: string): boolean {
  const a = Buffer.from(attempt);
  const b = Buffer.from(actual);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isUnlocked(entryId: string, password: string): Promise<boolean> {
  const stored = (await cookies()).get(cookieName(entryId))?.value;
  return stored !== undefined && sameSecret(stored, tokenFor(entryId, password));
}

export async function rememberUnlock(entryId: string, password: string): Promise<void> {
  (await cookies()).set(cookieName(entryId), tokenFor(entryId, password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REMEMBER_FOR_SECONDS,
  });
}
