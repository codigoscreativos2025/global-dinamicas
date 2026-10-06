import { prisma } from "@/lib/prisma";
import { HistoryList } from "./HistoryList";

export default async function HistoryPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      results: {
        include: { user: true },
        orderBy: [
          { score: "desc" },
          { timeMs: "asc" }
        ]
      }
    }
  });

  return <HistoryList games={games} />;
}
