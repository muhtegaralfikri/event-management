import { createHash } from "node:crypto";
import { cookies } from "next/headers";

const organizerSessionCookieName = "eventtix-organizer-session";

const createOrganizerSessionValue = (pin: string) =>
  createHash("sha256").update(`eventtix:${pin}`).digest("hex");

const getOrganizerPin = () => process.env.ORGANIZER_CHECKIN_PIN?.trim() ?? "";

export const hasOrganizerPinConfigured = () => getOrganizerPin().length > 0;

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

  if (!expectedPin || pin.trim() !== expectedPin) {
    return false;
  }

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
