"use server";

import { redirect } from "next/navigation";
import { authorizeOrganizerSession, clearOrganizerSession } from "@/lib/organizer-auth";
import { normalizeText } from "@/lib/form-utils";

export const loginOrganizer = async (formData: FormData) => {
  const pin = normalizeText(formData.get("pin"));
  const redirectTo = normalizeText(formData.get("redirectTo")) || "/organizer/check-in";

  const authorized = await authorizeOrganizerSession(pin);

  redirect(authorized ? redirectTo : `${redirectTo}?auth=invalid`);
};

export const logoutOrganizer = async () => {
  await clearOrganizerSession();
  redirect("/");
};
