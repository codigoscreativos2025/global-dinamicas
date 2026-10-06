"use server";

import { prisma } from "@/lib/prisma";

export async function getLiveResults() {
  let activeGame = await prisma.game.findFirst({
    where: { isActive: true }
  });

  if (activeGame && activeGame.timeLimit > 0 && activeGame.activatedAt) {
    const elapsedMs = Date.now() - activeGame.activatedAt.getTime();
    if (elapsedMs >= activeGame.timeLimit * 1000) {
      activeGame = await prisma.game.update({ where: { id: activeGame.id }, data: { isActive: false } });
    }
  }

  // If no active game, find the most recently activated game today
  const gameToShow = activeGame || await prisma.game.findFirst({
    orderBy: { updatedAt: 'desc' }
  });

  if (!gameToShow) return { game: null, results: [] };

  const results = await prisma.gameResult.findMany({
    where: { gameId: gameToShow.id },
    include: { user: { select: { name: true } } },
    orderBy: [
      { score: 'desc' },
      { timeMs: 'asc' }
    ],
    take: gameToShow.type === "SURVEY" ? undefined : gameToShow.podiumSize
  });

  return { game: gameToShow, results };
}
