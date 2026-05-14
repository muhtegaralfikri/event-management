import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/site-header";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | EventTix",
  description: "Ringkasan penggunaan data pada aplikasi EventTix.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <p className="text-sm font-semibold text-teal-800">EventTix</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
            Kebijakan Privasi
          </h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-stone-700">
            <p>
              EventTix adalah proyek portfolio untuk manajemen event dan tiket digital. Data yang
              dimasukkan digunakan untuk menjalankan fitur pendaftaran event, penerbitan tiket QR,
              login organizer, dan check-in peserta.
            </p>
            <p>
              Data peserta yang diproses meliputi nama, email, kode tiket, status pembayaran,
              status check-in, dan event yang diikuti. Data organizer meliputi nama, email, dan
              informasi event yang dibuat.
            </p>
            <p>
              Login Google hanya meminta akses profil dasar dan alamat email. Aplikasi tidak
              meminta akses ke Gmail, Google Drive, kontak, atau password akun Google.
            </p>
            <p>
              Untuk penggunaan production yang menerima transaksi nyata, kebijakan privasi ini perlu
              disesuaikan dengan proses bisnis, provider pembayaran, provider email, dan ketentuan
              hukum yang berlaku.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
