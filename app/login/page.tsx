import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { logInWithGoogle } from "./actions";
import { safeNextPath } from "./next-path";

export const metadata: Metadata = {
  title: "Acceder",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(first(params.next));

  const viewer = await getViewer();
  if (viewer.email) {
    redirect(next);
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-surface-alt px-4 py-10">
      <div className="w-full max-w-[420px] rounded-[20px] border border-line bg-page shadow-[0_40px_80px_rgba(0,0,0,0.12)]">
        <div className="border-b border-line px-7 pt-6 pb-5">
          <h1 className="text-2xl leading-[1.1] font-extrabold tracking-[-0.02em]">Acceder</h1>
        </div>
        <form action={logInWithGoogle} className="flex flex-col gap-4 px-7 py-6">
          <input type="hidden" name="next" value={next} />
          <p className="text-sm text-ink-muted">
            Entra con tu cuenta de Google de MOOCO para ver el índice.
          </p>
          {first(params.error) && (
            <p role="alert" className="text-xs font-medium text-danger">
              No se pudo iniciar sesión con Google. Vuelve a intentarlo.
            </p>
          )}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2.5 rounded-full border-[1.5px] border-line px-[18px] py-2.5 text-[13px] font-semibold hover:border-ink"
          >
            <GoogleIcon />
            Entrar con Google
          </button>
        </form>
      </div>
    </main>
  );
}
