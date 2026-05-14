import Image from "next/image";
import Link from "next/link";
import { CalendarDays, QrCode, Search, TicketCheck } from "lucide-react";

export const SiteFooter = () => (
  <footer className="border-t border-stone-200 bg-[#f7f4ee]">
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
      <div>
        <Link href="/" className="inline-flex items-center" aria-label="EventTix home">
          <Image
            src="/eventtix-logo.png"
            alt="EventTix"
            width={360}
            height={107}
            className="h-8 w-auto"
          />
        </Link>
        <p className="mt-4 max-w-md text-sm leading-6 text-stone-600">
          Platform event dan tiket digital untuk pendaftaran, pembayaran, tiket QR,
          dan check-in peserta.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-stone-950">Pengunjung</h2>
        <nav className="mt-3 grid gap-2 text-sm text-stone-600">
          <Link href="/#events" className="inline-flex items-center gap-2 hover:text-teal-800">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Lihat event
          </Link>
          <Link href="/tickets" className="inline-flex items-center gap-2 hover:text-teal-800">
            <Search className="h-4 w-4" aria-hidden="true" />
            Cari tiket
          </Link>
        </nav>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-stone-950">Organizer</h2>
        <nav className="mt-3 grid gap-2 text-sm text-stone-600">
          <Link href="/organizer/events/new" className="inline-flex items-center gap-2 hover:text-teal-800">
            <TicketCheck className="h-4 w-4" aria-hidden="true" />
            Buat event
          </Link>
          <Link href="/organizer/check-in" className="inline-flex items-center gap-2 hover:text-teal-800">
            <QrCode className="h-4 w-4" aria-hidden="true" />
            Scan tiket
          </Link>
        </nav>
      </div>

      <nav className="flex flex-wrap gap-4 text-sm text-stone-600 lg:col-span-3">
        <Link href="/privacy" className="hover:text-teal-800">
          Kebijakan Privasi
        </Link>
        <Link href="/terms" className="hover:text-teal-800">
          Syarat Layanan
        </Link>
      </nav>
    </div>
    <div className="border-t border-stone-200 px-4 py-4 text-center text-xs text-stone-500 sm:px-6">
      &copy; {new Date().getFullYear()} EventTix. Tiket digital untuk event yang lebih rapi.
    </div>
  </footer>
);
