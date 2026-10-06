"use client";
import { useState } from "react";

export function HistoryList({ games }: { games: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-black text-white">Historial de Dinámicas</h2>
        <input 
          type="text" 
          placeholder="Buscar jugador o cédula..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white w-full md:w-64"
        />
      </div>

      {games.length === 0 && (
        <p className="text-gray-400">No hay dinámicas creadas aún.</p>
      )}

      {games.map(game => {
        const filteredResults = game.results.filter((r: any) => 
          r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          r.user.cedula.includes(searchTerm) ||
          (r.user.phone && r.user.phone.includes(searchTerm))
        );

        if (searchTerm && filteredResults.length === 0) return null;

        return (
          <div key={game.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{game.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {game.type} • Creado el {new Date(game.createdAt).toLocaleDateString("es-ES")} a las {new Date(game.createdAt).toLocaleTimeString("es-ES")}
                </p>
              </div>
              <div className="text-right">
                <span className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-full font-bold">
                  {filteredResults.length} Jugadores
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Podio</th>
                    <th className="px-4 py-3">Jugador</th>
                    <th className="px-4 py-3">Cédula</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Puntaje</th>
                    <th className="px-4 py-3 rounded-r-lg">Tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((r: any, i: number) => {
                    // Original index for podium logic
                    const originalIndex = game.results.findIndex((res: any) => res.id === r.id);
                    const isPodium = originalIndex < game.podiumSize;
                    
                    return (
                      <tr key={r.id} className={`border-b border-gray-800/50 transition ${isPodium ? 'bg-orange-500/10 hover:bg-orange-500/20' : 'hover:bg-gray-800/30'}`}>
                        <td className="px-4 py-3 font-bold">
                          {isPodium ? <span className="text-yellow-500">🏆 #{originalIndex + 1}</span> : <span className="text-gray-600">#{originalIndex + 1}</span>}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{r.user.name}</td>
                        <td className="px-4 py-3 font-mono">{r.user.cedula}</td>
                        <td className="px-4 py-3">{r.user.phone || "-"}</td>
                        <td className="px-4 py-3 text-orange-400 font-bold">{r.score} PTS</td>
                        <td className="px-4 py-3">{Math.floor(r.timeMs / 1000)}s</td>
                      </tr>
                    );
                  })}
                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-600">No se encontraron jugadores.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
