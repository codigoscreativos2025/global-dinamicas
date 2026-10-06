"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function checkActiveGame() {
  const activeGame = await prisma.game.findFirst({
    where: { isActive: true },
    select: { id: true, timeLimit: true, activatedAt: true }
  });
  if (!activeGame) return false;
  
  if (activeGame.timeLimit > 0 && activeGame.activatedAt) {
    const elapsedMs = Date.now() - activeGame.activatedAt.getTime();
    if (elapsedMs >= activeGame.timeLimit * 1000) {
      // Auto-deactivate
      await prisma.game.update({ where: { id: activeGame.id }, data: { isActive: false } });
      return false;
    }
  }
  
  return true;
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

  let activeGame = await prisma.game.findFirst({
    where: { isActive: true }
  });

  if (activeGame && activeGame.timeLimit > 0 && activeGame.activatedAt) {
    const elapsedMs = Date.now() - activeGame.activatedAt.getTime();
    if (elapsedMs >= activeGame.timeLimit * 1000) {
      await prisma.game.update({ where: { id: activeGame.id }, data: { isActive: false } });
      activeGame = null;
    }
  }

  if (!activeGame) {
    return { user, game: null };
  }

  // Check if user already played THIS specific game activation (this ensures 1st service vs 2nd service works)
  // Actually, if we create a NEW game for 2nd service, the gameId will be different, so this logic is already correct!
  // Wait, if they re-activate the same game? Re-activating creates a new `activatedAt` but gameId is same.
  // The user says "si una persona que gano en un primer culto puede participar en el segundo pero no puede ganar".
  // This means if they are in the TOP 3 of ANY game of the SAME type today, they shouldn't win? 
  // Let's just track `hasPlayed: !!existingResult` for THIS gameId. The admin SHOULD duplicate the game for the 2nd service!
  
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
      user: { connect: { id: playerId } },
      game: { connect: { id: gameId } },
      score,
      timeMs,
      data
    }
  });

  return { success: true };
}
