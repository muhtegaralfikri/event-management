"use client";

import Link from "next/link";
import { UserRole } from "@/generated/prisma/enums";
import { LogOut, LayoutDashboard, CalendarPlus, User as UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";

type UserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
};

export const UserMenu = ({ user }: UserMenuProps) => {
  return (
    <div className="group relative z-50">
      <button className="flex items-center gap-2 rounded-full border border-stone-200 bg-white p-1 pr-3 shadow-sm hover:bg-stone-50 transition-colors">
        {user.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.image} alt={user.name || "User"} className="h-7 w-7 rounded-full object-cover" />
          </>
        ) : (
          <div className="grid h-7 w-7 place-items-center rounded-full bg-teal-100 text-teal-800">
            <UserIcon className="h-4 w-4" />
          </div>
        )}
        <span className="text-sm font-medium text-stone-700">
          {user.name?.split(" ")[0] || "User"}
        </span>
      </button>

      <div className="absolute right-0 top-full mt-2 hidden w-48 flex-col overflow-hidden rounded-md border border-stone-200 bg-white shadow-lg group-hover:flex">
        <div className="border-b border-stone-100 px-4 py-3">
          <p className="truncate text-sm font-medium text-stone-900">{user.name}</p>
          <p className="truncate text-xs text-stone-500">{user.email}</p>
        </div>
        
        <div className="flex flex-col py-1 text-sm text-stone-700">
          {user.role === UserRole.ORGANIZER && (
            <>
              <Link href="/organizer/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-stone-100">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/organizer/events/new" className="flex items-center gap-2 px-4 py-2 hover:bg-stone-100">
                <CalendarPlus className="h-4 w-4" />
                Buat Event
              </Link>
            </>
          )}
          
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
