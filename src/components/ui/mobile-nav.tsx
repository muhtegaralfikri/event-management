"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarDays, CalendarPlus, LayoutDashboard, LogIn, LogOut, Menu, QrCode, Search, User, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { UserRole } from "@/generated/prisma/enums";

type MobileNavProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role?: UserRole;
  } | null;
};

const baseLinks = [
  { href: "/", label: "Event", icon: CalendarDays },
  { href: "/tickets", label: "Cari Tiket", icon: Search },
];

const organizerLinks = [
  { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organizer/events/new", label: "Buat Event", icon: CalendarPlus },
  { href: "/organizer/check-in", label: "Scan Tiket", icon: QrCode },
];

export const MobileNav = ({ user }: MobileNavProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const links = user?.role === UserRole.ORGANIZER ? [...baseLinks, ...organizerLinks] : baseLinks;

  const closeMenu = () => setIsOpen(false);
  const handleSignOut = () => {
    closeMenu();
    void signOut();
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="grid h-10 w-10 place-items-center rounded-md border border-stone-200 bg-white text-stone-800 shadow-sm"
        aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      {isOpen ? (
        <div className="absolute inset-x-0 top-full border-b border-stone-200 bg-[#fffdf8] px-4 py-4 shadow-lg sm:px-6">
          {user ? (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-100 text-teal-800">
                <User className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-950">{user.name || "Organizer"}</p>
                <p className="truncate text-xs text-stone-500">{user.email}</p>
              </div>
            </div>
          ) : null}

          <nav className="grid gap-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${
                    isActive
                      ? "bg-teal-50 text-teal-900"
                      : "text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-2 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="mt-2 flex items-center justify-center gap-2 rounded-md bg-stone-950 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-800"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Organizer Login
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
};
