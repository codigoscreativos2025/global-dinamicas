"use server";

import { prisma } from "@/lib/prisma";

export async function getLiveResults() {
  const activeGame = await prisma.game.findFirst({
    where: { isActive: true }
  });

  if (!activeGame) return { game: null, results: [] };

  const results = await prisma.gameResult.findMany({
    where: { gameId: activeGame.id },
    include: { user: { select: { name: true } } },
    orderBy: [
      { score: 'desc' },
      { timeMs: 'asc' } // Tie breaker: fastest time
    ],
    take: activeGame.podiumSize // Only take the required podium size
  });

  return { game: activeGame, results };
}
