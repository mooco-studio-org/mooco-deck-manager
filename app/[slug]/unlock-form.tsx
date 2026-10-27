"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginPath } from "@/app/login/next-path";
import { unlock, type UnlockState } from "./actions";

const initialState: UnlockState = {};

// Drawn on the deck wrapper's dark ground, so the colours are pinned like the layout's.
export function UnlockForm({
  slug,
  title,
  signedIn,
}: {
  slug: string;
  title: string;
  signedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState(unlock.bind(null, slug), initialState);

  return (
    <main className="flex h-full items-center justify-center px-4">
      <form
        action={formAction}
        className="flex w-full max-w-[380px] flex-col gap-4 rounded-[20px] border border-[#262624] bg-[#0e0e0d] px-7 py-8"
      >
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#8a8a86] uppercase">
          <span className="mr-1.5 text-[8px] opacity-70">◆</span>MOOCO
        </p>
        <h1 className="text-2xl leading-[1.1] font-extrabold tracking-[-0.02em]">{title}</h1>
        <p className="text-sm text-[#8a8a86]">Esta presentación está protegida con contraseña.</p>

        <input
          name="password"
          type="password"
          required
          autoFocus
          aria-label="Contraseña"
          placeholder="Contraseña"
          className="w-full rounded-[10px] border-[1.5px] border-[#262624] bg-[#1a1a19] px-3.5 py-[11px] text-sm font-medium text-[#f4f4f2] placeholder:text-[#55554f] focus:border-[#f4f4f2] focus:outline-none"
        />

        {state.error && (
          <p role="alert" className="text-xs font-medium text-[#d43d3d]">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[#ffe000] px-[18px] py-2.5 text-[13px] font-semibold text-black hover:bg-[#ffee5c] disabled:opacity-50"
        >
          {pending ? "Comprobando…" : "Ver presentación"}
        </button>

        {!signedIn && (
          <Link
            href={loginPath(`/${slug}`)}
            className="text-center text-xs text-[#8a8a86] underline underline-offset-4 hover:text-[#f4f4f2]"
          >
            ¿Eres del equipo de MOOCO? Entra con Google
          </Link>
        )}
      </form>
    </main>
  );
}
