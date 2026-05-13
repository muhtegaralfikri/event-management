"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-16 sm:px-6">
      <section className="w-full rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-semibold">Halaman gagal dimuat</h1>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Biasanya ini terjadi karena environment Vercel belum berisi{" "}
                <code>DATABASE_URL</code> atau database PostgreSQL tidak bisa diakses.
              </p>
            </div>
            <p className="break-all rounded-md bg-white/70 px-3 py-2 font-mono text-xs text-stone-700">
              {error.digest ? `digest: ${error.digest}` : error.message}
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Coba lagi
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
