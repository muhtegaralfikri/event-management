"use server";

import { getPrisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { normalizeText } from "@/lib/form-utils";
import { UserRole } from "@/generated/prisma/enums";
import { redirect } from "next/navigation";

export const registerUser = async (formData: FormData) => {
  const name = normalizeText(formData.get("name"));
  const email = normalizeText(formData.get("email"));
  const password = normalizeText(formData.get("password"));

  if (!name || !email || !password) {
    throw new Error("Semua field wajib diisi.");
  }

  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter.");
  }

  const prisma = getPrisma();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email sudah terdaftar.");
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: UserRole.ATTENDEE,
    },
  });

  // Redirect ke login dengan pesan sukses
  redirect("/login?registered=true");
};
