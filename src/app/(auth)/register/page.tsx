"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUser } from "@/app/actions/auth";
import { PasswordField } from "@/components/ui/password-field";
import { LoaderCircle, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const [error, formAction, isPending] = useActionState(async (state: string | null, formData: FormData) => {
    try {
      await registerUser(formData);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Terjadi kesalahan";
    }
  }, null);

  return (
    <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          Buat Akun Organizer
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Akun hanya diperlukan untuk penyelenggara yang ingin mengelola event.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Nama Lengkap</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-md border border-stone-300 py-2 pl-10 pr-3 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-stone-300 py-2 pl-10 pr-3 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              placeholder="nama@email.com"
            />
          </div>
        </div>

        <PasswordField required minLength={8} placeholder="Minimal 8 karakter" />

        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-wait disabled:opacity-75"
        >
          {isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Membuat akun...
            </>
          ) : (
            "Daftar sebagai organizer"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-stone-600">
        Sudah punya akun organizer?{" "}
        <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-900">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
