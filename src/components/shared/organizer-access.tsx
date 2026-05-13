import { loginOrganizer } from "@/app/actions/organizer";
import { LockKeyhole } from "lucide-react";

type OrganizerAccessProps = {
  redirectTo: string;
  authState?: string;
  title: string;
  description: string;
};

export const OrganizerAccess = ({
  redirectTo,
  authState,
  title,
  description,
}: OrganizerAccessProps) => (
  <div className="mx-auto w-full max-w-md rounded-lg border border-stone-200 bg-[#fffdf8] p-5 shadow-xl">
    <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-stone-950 text-white">
      <LockKeyhole className="h-5 w-5" aria-hidden="true" />
    </div>
    <h2 className="text-xl font-semibold tracking-tight text-stone-950">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    {!redirectTo ? null : (
      <form action={loginOrganizer} className="mt-5 space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="block">
          <span className="text-sm font-medium text-stone-700">PIN organizer</span>
          <input
            name="pin"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
            placeholder="Masukkan PIN"
          />
        </label>
        {authState === "invalid" || authState === "required" ? (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-900">
            PIN organizer belum valid.
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
        >
          Masuk sebagai organizer
        </button>
      </form>
    )}
  </div>
);
