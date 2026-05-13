import { loginOrganizer } from "@/app/actions/organizer";

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
  <div className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    {!redirectTo ? null : (
      <form action={loginOrganizer} className="mt-5 space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="block">
          <span className="text-sm font-medium text-slate-700">PIN organizer</span>
          <input
            name="pin"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-700"
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
          className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Masuk sebagai organizer
        </button>
      </form>
    )}
  </div>
);
