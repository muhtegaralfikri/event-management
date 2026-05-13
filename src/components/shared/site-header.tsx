import Link from "next/link";

export const SiteHeader = () => (
  <header className="border-b border-slate-200 bg-white">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
      <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">
        EventTix
      </Link>
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Link href="/" className="rounded-md px-3 py-2 hover:bg-slate-100">
          Event
        </Link>
        <Link
          href="/organizer/events/new"
          className="rounded-md bg-slate-950 px-3 py-2 text-white hover:bg-slate-800"
        >
          Buat Event
        </Link>
      </nav>
    </div>
  </header>
);
