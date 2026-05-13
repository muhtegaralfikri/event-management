import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { organizerLoginLimiter } from "@/lib/rate-limiter";

const organizerSessionCookieName = "eventtix-organizer-session";

const createOrganizerSessionValue = (pin: string) =>
  createHash("sha256").update(`eventtix:${pin}`).digest("hex");

const getOrganizerPin = () => process.env.ORGANIZER_CHECKIN_PIN?.trim() ?? "";

export const hasOrganizerPinConfigured = () => getOrganizerPin().length > 0;

/**
 * Ambil identifier client untuk rate limiting.
 * Menggunakan header x-forwarded-for (dari reverse proxy / Vercel)
 * atau fallback ke string statis jika tidak tersedia.
 */
const getClientIdentifier = async (): Promise<string> => {
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

export const isOrganizerAuthorized = async () => {
  const pin = getOrganizerPin();

  if (!pin) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(organizerSessionCookieName)?.value;

  return session === createOrganizerSessionValue(pin);
};

export const authorizeOrganizerSession = async (pin: string) => {
  const cookieStore = await cookies();
  const expectedPin = getOrganizerPin();

  // ── Brute Force Protection ────────────────────────────────────────
  // Max 5 percobaan login per 15 menit per IP.
  // Ini mencegah attacker melakukan brute force pada PIN organizer.
  const clientId = await getClientIdentifier();
  const rateLimitKey = `organizer-login:${clientId}`;
  const rateCheck = organizerLoginLimiter.check(rateLimitKey);

  if (!rateCheck.allowed) {
    return false;
  }

  if (!expectedPin || pin.trim() !== expectedPin) {
    return false;
  }

  // Login berhasil — reset rate limiter untuk IP ini
  organizerLoginLimiter.reset(rateLimitKey);

  cookieStore.set(organizerSessionCookieName, createOrganizerSessionValue(expectedPin), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return true;
};

export const clearOrganizerSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(organizerSessionCookieName);
};
