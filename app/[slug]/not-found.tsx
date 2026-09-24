import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Presentación no encontrada</h1>
      <p className="mt-2 opacity-70">
        Este deck no existe o no tienes acceso a él.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm underline underline-offset-4 opacity-60 hover:opacity-100"
      >
        ← Todas las entradas
      </Link>
    </main>
  );
}
