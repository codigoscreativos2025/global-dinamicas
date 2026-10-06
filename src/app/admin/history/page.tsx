import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      results: {
        include: { user: true },
        orderBy: { score: "desc" }
      }
    }
  });

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white mb-8">Historial de Dinámicas</h2>

      {games.length === 0 && (
        <p className="text-gray-400">No hay dinámicas creadas aún.</p>
      )}

      {games.map(game => (
        <div key={game.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{game.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {game.type} • Creado el {new Date(game.createdAt).toLocaleDateString("es-ES")}
              </p>
            </div>
            <div className="text-right">
              <span className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-full font-bold">
                {game.results.length} Jugadores
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Jugador</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Puntaje</th>
                  <th className="px-4 py-3 rounded-r-lg">Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {game.results.map((r, i) => (
                  <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                    <td className="px-4 py-3 font-medium text-white flex items-center gap-3">
                      <span className="w-6 text-gray-600 text-xs">{i + 1}.</span>
                      {r.user.name}
                    </td>
                    <td className="px-4 py-3">{r.user.phone || "-"}</td>
                    <td className="px-4 py-3 text-orange-400 font-bold">{r.score} PTS</td>
                    <td className="px-4 py-3">{Math.floor(r.timeMs / 1000)}s</td>
                  </tr>
                ))}
                {game.results.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-600">Nadie ha jugado esta dinámica.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
