import Link from "next/link";
import { CalendarDays, QrCode, Search, LogIn } from "lucide-react";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/ui/user-menu";
import { UserRole } from "@/generated/prisma/enums";

export const SiteHeader = async () => {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#fffdf8]/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-stone-950">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-teal-700 text-white shadow-sm">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>EventTix</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-stone-700">
          <Link href="/" className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-stone-100">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Event
          </Link>
          <Link href="/tickets" className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-stone-100">
            <Search className="h-4 w-4" aria-hidden="true" />
            Cari Tiket
          </Link>
          
          {session?.user?.role === UserRole.ORGANIZER && (
            <Link href="/organizer/check-in" className="inline-flex items-center gap-2 rounded-md px-3 py-2 hover:bg-stone-100">
              <QrCode className="h-4 w-4" aria-hidden="true" />
              Scan Tiket
            </Link>
          )}

          {session?.user ? (
            <div className="ml-2">
              <UserMenu user={session.user} />
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 text-white shadow-sm hover:bg-stone-800"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Login / Daftar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
