"use server";

import { redirect } from "next/navigation";
import { unlockDeck } from "@/lib/presentations";

export type UnlockState = { error?: string };

// A wrong password costs a second, which keeps guessing slow without making a mistyped
// password noticeably worse for a real client.
const FAILED_ATTEMPT_DELAY_MS = 1000;

export async function unlock(
  slug: string,
  _previous: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const attempt = formData.get("password");
  if (typeof attempt === "string" && attempt && (await unlockDeck(slug, attempt))) {
    redirect(`/${slug}`);
  }

  await new Promise((resolve) => setTimeout(resolve, FAILED_ATTEMPT_DELAY_MS));
  return { error: "Contraseña incorrecta." };
}
