"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginOrRegister(formData: FormData) {
  const cedula = formData.get("cedula") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!cedula) {
    return { error: "La Cédula es requerida" };
  }

  let user = await prisma.user.findUnique({
    where: { cedula },
  });

  if (!user) {
    // User doesn't exist
    if (!name || !phone) {
      // Need name and phone to register
      return { needsNameAndPhone: true };
    }
    
    try {
      user = await prisma.user.create({
        data: {
          cedula,
          phone,
          name,
        },
      });
    } catch (error) {
      return { error: "La cédula ya está registrada." };
    }
  }

  // Set cookie for quick auth (in a real app, use JWT/Session)
  const cookieStore = await cookies();
  cookieStore.set("playerId", user.id, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 // 24 hours
  });

  redirect("/play");
}
