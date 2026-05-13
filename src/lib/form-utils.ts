import { headers } from "next/headers";

/**
 * Normalkan form field value — trim whitespace, return string kosong jika null.
 */
export const normalizeText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

/**
 * Normalkan form field opsional — return null jika string kosong setelah trim.
 */
export const normalizeOptionalText = (value: FormDataEntryValue | null) => {
  const text = normalizeText(value);

  return text.length > 0 ? text : null;
};

/**
 * Ambil identifier client untuk rate limiting.
 * Menggunakan header x-forwarded-for (dari reverse proxy / Vercel)
 * atau fallback ke string statis jika tidak tersedia.
 */
export const getClientIdentifier = async (): Promise<string> => {
  try {
    const headerStore = await headers();
    return (
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      "unknown-client"
    );
  } catch {
    return "unknown-client";
  }
};
