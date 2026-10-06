"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGames() {
  return prisma.game.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createGame(formData: FormData) {
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const podiumSize = parseInt(formData.get("podiumSize") as string || "3");
  const config = formData.get("config") as string;

  const timeLimit = parseInt(formData.get("timeLimit") as string || "0");

  await prisma.game.create({
    data: {
      title,
      type,
      podiumSize,
      timeLimit,
      config,
    }
  });

  revalidatePath("/admin");
}

export async function activateGame(id: string) {
  // Desactivar todos
  await prisma.game.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });

  // Activar el seleccionado
  await prisma.game.update({
    where: { id },
    data: { isActive: true, activatedAt: new Date() }
  });

  revalidatePath("/admin");
}

export async function deleteGame(id: string) {
  await prisma.game.delete({ where: { id } });
  revalidatePath("/admin");
}
