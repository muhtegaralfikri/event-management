"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";

type UserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export const UserMenu = ({ user }: UserMenuProps) => {
  const handleSignOut = () => {
    void signOut();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 shadow-sm">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name || "User"} className="h-5 w-5 rounded-md object-cover" />
        ) : (
          <div className="grid h-5 w-5 place-items-center rounded-md bg-teal-100 text-teal-800">
            <UserIcon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
        <span className="max-w-24 truncate text-sm font-medium text-stone-700 sm:max-w-32">
          {user.name?.split(" ")[0] || "Organizer"}
        </span>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="inline-flex items-center gap-2 rounded-md border border-red-100 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Logout
      </button>
    </div>
  );
};
