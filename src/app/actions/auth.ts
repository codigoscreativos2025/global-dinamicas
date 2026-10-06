"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginOrRegister(formData: FormData) {
  const cedula = formData.get("cedula") as string;
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!cedula || !email) {
    return { error: "Cédula y correo son requeridos" };
  }

  let user = await prisma.user.findUnique({
    where: { cedula },
  });

  if (user) {
    // If name is provided but user exists, just ignore it and log in.
    // If they provided a different email, we could update it, but for simplicity, we just log in.
  } else {
    // User doesn't exist
    if (!name) {
      // Need name to register
      return { needsName: true };
    }
    
    try {
      user = await prisma.user.create({
        data: {
          cedula,
          email,
          name,
        },
      });
    } catch (error) {
      return { error: "El correo o cédula ya están en uso por otra cuenta." };
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
