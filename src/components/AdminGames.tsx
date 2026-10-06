"use client";

import { useState, useEffect } from "react";
import { createGame, activateGame, deleteGame } from "@/app/actions/admin";
import Image from "next/image";

export function AdminGames({ games }: { games: any[] }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("QUIZ");
  const [showQR, setShowQR] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Quiz Builder State
  const [questions, setQuestions] = useState([{ q: "", options: ["", ""], correct: 0 }]);

  // Word Search Builder State
  const [words, setWords] = useState<string[]>([""]);

  useEffect(() => {
    setCurrentUrl(window.location.origin);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Inject the config based on the visual builder
    let configStr = "";
    if (type === "QUIZ") {
      configStr = JSON.stringify(questions);
    } else if (type === "WORD_SEARCH") {
      configStr = JSON.stringify(words.filter(w => w.trim() !== ""));
    } else {
      configStr = formData.get("config") as string || "[]";
    }
    formData.set("config", configStr);

    await createGame(formData);
    form.reset();
    
    // Reset builders
    setQuestions([{ q: "", options: ["", ""], correct: 0 }]);
    setWords([""]);
    
    setLoading(false);
  };

  const addQuestion = () => setQuestions([...questions, { q: "", options: ["", ""], correct: 0 }]);
  const updateQuestion = (idx: number, field: string, val: any) => {
    const n = [...questions];
    if (field === "q") n[idx].q = val;
    if (field === "correct") n[idx].correct = val;
    setQuestions(n);
  };
  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const n = [...questions];
    n[qIdx].options[oIdx] = val;
    setQuestions(n);
  };
  const addOption = (qIdx: number) => {
    const n = [...questions];
    n[qIdx].options.push("");
    setQuestions(n);
  };

  const addWord = () => setWords([...words, ""]);
  const updateWord = (idx: number, val: string) => {
    const n = [...words];
    n[idx] = val.toUpperCase();
    setWords(n);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl flex flex-col items-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Escanea para Jugar</h3>
            <Image 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`}
              alt="QR Code"
              width={300} height={300}
              className="mb-6 rounded-lg shadow-sm"
            />
            <p className="text-gray-600 font-medium mb-6">{currentUrl}</p>
            <button onClick={() => setShowQR(false)} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-6 h-fit">
        <h3 className="text-lg font-semibold text-white mb-4">Nuevo Juego</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título</label>
            <input name="title" required className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="Ej. Dinámica de Jóvenes" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo</label>
              <select name="type" value={type} onChange={(e)=>setType(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm">
                <option value="QUIZ">Quiz</option>
                <option value="WORD_SEARCH">Sopa de Letras</option>
                {/* <option value="SURVEY">Encuesta</option> */}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Puestos</label>
              <select name="podiumSize" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm">
                <option value="1">1er Lugar</option>
                <option value="3">Top 3</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Límite de Tiempo (segundos)</label>
            <input type="number" name="timeLimit" defaultValue="0" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="0 para sin límite" />
          </div>

          <div className="pt-4 border-t border-gray-800">
            {type === "QUIZ" && (
              <div className="space-y-6">
                <label className="block text-sm font-medium text-orange-400">Preguntas del Quiz</label>
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                    <input 
                      type="text" required placeholder={`Pregunta ${qIdx + 1}`}
                      value={q.q} onChange={e => updateQuestion(qIdx, "q", e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                    />
                    <div className="space-y-2 pl-2 border-l-2 border-gray-700">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input 
                            type="radio" name={`correct-${qIdx}`} checked={q.correct === oIdx}
                            onChange={() => updateQuestion(qIdx, "correct", oIdx)}
                            className="text-orange-500 focus:ring-orange-500"
                          />
                          <input 
                            type="text" required placeholder={`Opción ${oIdx + 1}`}
                            value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          />
                        </div>
                      ))}
                      <button type="button" onClick={() => addOption(qIdx)} className="text-xs text-orange-500 hover:text-orange-400">
                        + Agregar Opción
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addQuestion} className="w-full py-2 border border-dashed border-gray-600 text-gray-400 rounded-lg text-sm hover:border-gray-500 hover:text-white transition">
                  + Nueva Pregunta
                </button>
              </div>
            )}

            {type === "WORD_SEARCH" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-orange-400">Palabras a buscar</label>
                <div className="flex flex-wrap gap-2">
                  {words.map((w, idx) => (
                    <input 
                      key={idx} type="text" required placeholder="PALABRA"
                      value={w} onChange={e => updateWord(idx, e.target.value)}
                      className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white uppercase text-center"
                    />
                  ))}
                  <button type="button" onClick={addWord} className="w-24 border border-dashed border-gray-600 text-gray-400 rounded text-sm hover:border-gray-500 hover:text-white transition">
                    + Añadir
                  </button>
                </div>
                <p className="text-xs text-gray-500">El sistema generará la sopa de letras y las esconderá automáticamente usando estas palabras.</p>
              </div>
            )}
            
            {type === "SURVEY" && (
              <div>
                <textarea name="config" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm" placeholder="Configuración JSON"></textarea>
              </div>
            )}
          </div>

          <button disabled={loading} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-bold transition disabled:opacity-50 mt-4 shadow-lg shadow-orange-500/20">
            {loading ? "Creando..." : "Crear Juego"}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Juegos Registrados</h3>
          <button onClick={() => setShowQR(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
            Mostrar QR
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {games.map(g => (
            <div key={g.id} className={`p-5 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${g.isActive ? 'bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/50 shadow-md shadow-orange-500/5' : 'bg-gray-900 border-gray-800'}`}>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-white text-lg">{g.title}</h4>
                  {g.isActive && <span className="bg-orange-500 text-[10px] px-2 py-0.5 rounded-full text-white font-bold tracking-wider uppercase shadow-sm">Activo Hoy</span>}
                </div>
                <div className="flex gap-3 text-sm text-gray-400">
                  <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">{g.type}</span>
                  <span>Podio: Top {g.podiumSize}</span>
                  {g.timeLimit > 0 && <span>⏳ {g.timeLimit}s</span>}
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {!g.isActive && (
                  <button onClick={() => activateGame(g.id)} className="flex-1 sm:flex-none px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition">
                    Activar
                  </button>
                )}
                <button onClick={() => deleteGame(g.id)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {games.length === 0 && (
            <div className="p-8 text-center bg-gray-900 border border-gray-800 rounded-2xl">
              <p className="text-gray-500">No hay juegos configurados aún. ¡Crea el primero!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
