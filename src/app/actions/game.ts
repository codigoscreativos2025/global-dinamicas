"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function checkActiveGame() {
  const activeGame = await prisma.game.findFirst({
    where: { isActive: true },
    select: { id: true }
  });
  return !!activeGame;
}

export async function getActiveGameForPlayer() {
  const cookieStore = await cookies();
  const playerId = cookieStore.get("playerId")?.value;

  if (!playerId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: playerId }
  });

  if (!user) {
    redirect("/");
  }

  const activeGame = await prisma.game.findFirst({
    where: { isActive: true }
  });

  if (!activeGame) {
    return { user, game: null };
  }

  // Check if user already played
  const existingResult = await prisma.gameResult.findFirst({
    where: {
      userId: user.id,
      gameId: activeGame.id
    }
  });

  return { user, game: activeGame, hasPlayed: !!existingResult };
}

export async function submitGameResult(gameId: string, score: number, timeMs: number, data?: string) {
  const cookieStore = await cookies();
  const playerId = cookieStore.get("playerId")?.value;

  if (!playerId) return { error: "No autorizado" };

  await prisma.gameResult.create({
    data: {
      userId: playerId,
      gameId,
      score,
      timeMs,
      data
    }
  });

  return { success: true };
}
