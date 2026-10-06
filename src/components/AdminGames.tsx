"use client";

import { useState } from "react";
import { createGame, activateGame, deleteGame } from "@/app/actions/admin";

export function AdminGames({ games }: { games: any[] }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("QUIZ");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createGame(formData);
    e.currentTarget.reset();
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Nuevo Juego</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título</label>
            <input name="title" required className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="Ej. Dinámica de Jóvenes" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo de Juego</label>
            <select name="type" value={type} onChange={(e)=>setType(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white">
              <option value="QUIZ">Quiz (Selección Múltiple)</option>
              <option value="WORD_SEARCH">Sopa de Letras</option>
              <option value="SURVEY">Encuesta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Premiación (Puestos)</label>
            <select name="podiumSize" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white">
              <option value="1">Solo 1er Lugar</option>
              <option value="3">Podio (Top 3)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Configuración (JSON por ahora)
            </label>
            <textarea name="config" required className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm font-mono" rows={5} placeholder={type === "WORD_SEARCH" ? '["DIOS", "AMOR", "PAZ"]' : '[{"q":"¿Pregunta?","options":["A","B"],"correct":0}]'} defaultValue={type === "WORD_SEARCH" ? '["DIOS", "AMOR", "PAZ"]' : '[{"q":"¿Pregunta?","options":["A","B"],"correct":0}]'}></textarea>
            <p className="text-xs text-gray-500 mt-1">Más adelante esto tendrá una UI más amigable.</p>
          </div>
          <button disabled={loading} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-md font-medium transition disabled:opacity-50">
            Crear Juego
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-lg font-semibold text-white">Juegos Registrados</h3>
        {games.map(g => (
          <div key={g.id} className={`p-4 border rounded-xl flex items-center justify-between ${g.isActive ? 'bg-orange-500/10 border-orange-500/50' : 'bg-gray-900 border-gray-800'}`}>
            <div>
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-white">{g.title}</h4>
                {g.isActive && <span className="bg-orange-500 text-xs px-2 py-0.5 rounded text-white">Activo Hoy</span>}
              </div>
              <p className="text-sm text-gray-400">{g.type} • Top {g.podiumSize}</p>
            </div>
            <div className="flex gap-2">
              {!g.isActive && (
                <button onClick={() => activateGame(g.id)} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition">
                  Activar
                </button>
              )}
              <button onClick={() => deleteGame(g.id)} className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded text-sm transition">
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {games.length === 0 && (
          <p className="text-gray-500">No hay juegos configurados aún.</p>
        )}
      </div>
    </div>
  );
}
