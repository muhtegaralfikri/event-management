import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";
import { CalendarX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <section className="mx-auto w-full max-w-md px-4 py-16 text-center sm:px-6">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-stone-100">
            <CalendarX className="h-8 w-8 text-stone-400" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            URL yang dituju tidak tersedia atau sudah dipindahkan. Periksa kembali alamatnya
            atau kembali ke halaman utama.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Kembali ke beranda
          </Link>
        </section>
      </main>
    </>
  );
}
