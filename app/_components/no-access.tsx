import { logOut } from "@/app/login/actions";

// Shown to someone signed in with an account that is not on the MOOCO team: they may hold
// links to decks shared with them, but the index and the form are team-only.
export function NoAccess({ email }: { email: string }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-surface-alt px-4 py-10">
      <div className="w-full max-w-[420px] rounded-[20px] border border-line bg-page px-7 py-8 text-center shadow-[0_40px_80px_rgba(0,0,0,0.12)]">
        <h1 className="text-2xl leading-[1.1] font-extrabold tracking-[-0.02em]">Sin acceso</h1>
        <p className="mt-3 text-sm text-ink-muted">
          La cuenta <strong className="font-semibold text-ink">{email}</strong> no tiene acceso al
          índice. Si te enviaron el link de un deck, ábrelo directamente.
        </p>
        <form action={logOut} className="mt-6">
          <button
            type="submit"
            className="rounded-full border-[1.5px] border-line px-4 py-[9px] text-[13px] font-medium hover:border-ink"
          >
            Entrar con otra cuenta
          </button>
        </form>
      </div>
    </main>
  );
}
