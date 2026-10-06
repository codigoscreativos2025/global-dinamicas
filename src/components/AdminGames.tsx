"use client";

import { useState, useEffect, useTransition } from "react";
import { createGame, activateGame, deleteGame } from "@/app/actions/admin";
import { QuizGame } from "./games/QuizGame";
import { WordSearchGame } from "./games/WordSearchGame";
import { SurveyGame } from "./games/SurveyGame";

export function AdminGames({ games }: { games: any[] }) {
  const [isPending, startTransition] = useTransition();

  // Timer component for active games
  const AdminTimer = ({ activatedAt, timeLimit }: { activatedAt: string, timeLimit: number }) => {
    const [timeLeft, setTimeLeft] = useState(() => {
      const elapsed = Math.floor((Date.now() - new Date(activatedAt).getTime()) / 1000);
      return Math.max(0, timeLimit - elapsed);
    });

    useEffect(() => {
      if (timeLeft <= 0) return;
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(activatedAt).getTime()) / 1000);
        setTimeLeft(Math.max(0, timeLimit - elapsed));
      }, 1000);
      return () => clearInterval(interval);
    }, [activatedAt, timeLimit, timeLeft]);

    if (timeLeft <= 0) return <span className="text-red-500 font-bold ml-2">Finalizado</span>;
    return <span className="text-orange-400 font-bold ml-2">⏳ {timeLeft}s</span>;
  };
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("QUIZ");
  const [showQR, setShowQR] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("0");
  const [podiumSize, setPodiumSize] = useState("3");

  // Quiz Builder State
  const [questions, setQuestions] = useState([{ q: "", options: ["", ""], correct: 0 }]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Word Search Builder State
  const [words, setWords] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    setCurrentUrl(window.location.origin);
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("podiumSize", podiumSize);
    formData.append("timeLimit", timeLimit);
    
    let configStr = "";
    if (type === "QUIZ") {
      configStr = JSON.stringify(questions);
    } else if (type === "WORD_SEARCH") {
      configStr = JSON.stringify(words.filter(w => w.trim() !== ""));
    } else if (type === "SURVEY") {
      configStr = JSON.stringify({ 
        q: questions[0].q, 
        options: questions[0].options.filter(o => o.trim() !== ""),
        chartType: (questions[0] as any).chartType || "horizontal"
      });
    } else {
      configStr = "[]";
    }
    formData.append("config", configStr);

    startTransition(async () => {
      await createGame(formData);
      setTitle("");
      setQuestions([{ q: "", options: ["", ""], correct: 0 }]);
      setCurrentQIndex(0);
      setWords(["", "", ""]);
      setLoading(false);
    });
  };

  const handleActivate = (id: string) => {
    startTransition(async () => {
      await activateGame(id);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteGame(id);
    });
  };

  // Preview mock game object
  const previewGame = {
    title: title || "Título del Juego",
    type: type,
    config: type === "QUIZ" 
      ? JSON.stringify(questions) 
      : type === "SURVEY"
        ? JSON.stringify({ 
            q: questions[0].q || "Pregunta de ejemplo", 
            options: questions[0].options.length > 0 ? questions[0].options : ["Opción 1", "Opción 2"],
            chartType: (questions[0] as any).chartType || "horizontal"
          })
        : JSON.stringify(words.some(w => w.trim() !== "") ? words.filter(w => w.trim() !== "") : ["HOLA", "MUNDO"]),
    timeLimit: parseInt(timeLimit) || 0,
    podiumSize: parseInt(podiumSize) || 3
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Modal QR */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl flex flex-col items-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Escanea para Jugar</h3>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`}
              alt="QR Code"
              width={300} height={300}
              className="mb-6 rounded-lg shadow-sm"
            />
            <p className="text-gray-600 font-medium mb-6">{currentUrl}</p>
            <button type="button" onClick={() => setShowQR(false)} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: BUILDER */}
      <div className="lg:col-span-5 bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
          Creador de Juegos
        </h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título de la Dinámica</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white" placeholder="Ej. Reto de Jóvenes" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo de Juego</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm" title="Selecciona el tipo de dinámica">
                <option value="QUIZ" title="El jugador que responda más preguntas correctamente en menos tiempo gana.">Quiz Interactivo</option>
                <option value="WORD_SEARCH" title="El jugador que encuentre más palabras en menos tiempo gana.">Sopa de Letras</option>
                <option value="SURVEY" title="No hay ganador. Las respuestas se muestran en vivo en la pantalla de ProPresenter.">Encuesta Rápida</option>
              </select>
              <p className="text-[10px] text-gray-500 mt-1">
                {type === "QUIZ" && "Gana quien tenga más respuestas correctas en menos tiempo."}
                {type === "WORD_SEARCH" && "Gana quien encuentre más palabras en menos tiempo."}
                {type === "SURVEY" && "No hay podio. Los resultados se grafican en vivo."}
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Premiación</label>
              <select value={podiumSize} onChange={e => setPodiumSize(e.target.value)} disabled={type === "SURVEY"} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm disabled:opacity-50">
                <option value="1">Solo 1er Lugar</option>
                <option value="3">Top 3 (Podio)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Límite de Tiempo (segundos)</label>
            <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white" placeholder="0 = Sin límite" />
          </div>

          <div className="pt-6 border-t border-gray-800">
            {/* QUIZ BUILDER WIZARD */}
            {type === "QUIZ" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-orange-400 font-bold text-sm">Pregunta {currentQIndex + 1} de {questions.length}</h4>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))} disabled={currentQIndex === 0} className="px-2 py-1 bg-gray-800 text-gray-400 rounded disabled:opacity-30 hover:text-white">&lt;</button>
                    <button type="button" onClick={() => setCurrentQIndex(Math.min(questions.length - 1, currentQIndex + 1))} disabled={currentQIndex === questions.length - 1} className="px-2 py-1 bg-gray-800 text-gray-400 rounded disabled:opacity-30 hover:text-white">&gt;</button>
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl space-y-4">
                  <input 
                    type="text" placeholder="Escribe la pregunta aquí..."
                    value={questions[currentQIndex].q} 
                    onChange={e => {
                      const n = [...questions];
                      n[currentQIndex].q = e.target.value;
                      setQuestions(n);
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-medium"
                  />
                  
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Opciones de respuesta (Marca la correcta)</label>
                    {questions[currentQIndex].options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <input 
                          type="radio" name="correctOpt" checked={questions[currentQIndex].correct === oIdx}
                          onChange={() => {
                            const n = [...questions];
                            n[currentQIndex].correct = oIdx;
                            setQuestions(n);
                          }}
                          className="w-5 h-5 text-orange-500 bg-gray-900 border-gray-700 focus:ring-orange-500"
                        />
                        <input 
                          type="text" placeholder={`Opción ${oIdx + 1}`}
                          value={opt} 
                          onChange={e => {
                            const n = [...questions];
                            n[currentQIndex].options[oIdx] = e.target.value;
                            setQuestions(n);
                          }}
                          className={`flex-1 bg-gray-900 border rounded-lg px-3 py-2 text-sm text-white transition-all ${questions[currentQIndex].correct === oIdx ? 'border-orange-500 shadow-[0_0_10px_rgba(249,112,21,0.2)]' : 'border-gray-700'}`}
                        />
                        <button type="button" onClick={() => {
                          const n = [...questions];
                          n[currentQIndex].options.splice(oIdx, 1);
                          if (n[currentQIndex].correct >= n[currentQIndex].options.length) n[currentQIndex].correct = 0;
                          setQuestions(n);
                        }} className="text-gray-600 hover:text-red-500">
                          ✖
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => {
                      const n = [...questions];
                      n[currentQIndex].options.push("");
                      setQuestions(n);
                    }} className="text-orange-500 text-sm font-medium hover:underline mt-2">
                      + Añadir opción
                    </button>
                  </div>
                </div>

                <button type="button" onClick={() => {
                  setQuestions([...questions, { q: "", options: ["", ""], correct: 0 }]);
                  setCurrentQIndex(questions.length);
                }} className="w-full py-3 border-2 border-dashed border-gray-700 text-gray-400 rounded-xl font-medium hover:border-gray-500 hover:text-white transition">
                  + Nueva Pregunta
                </button>
              </div>
            )}

            {/* WORD SEARCH BUILDER WIZARD */}
            {type === "WORD_SEARCH" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-orange-400">Palabras a esconder</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {words.map((w, idx) => (
                    <div key={idx} className="relative">
                      <input 
                        type="text" placeholder="PALABRA"
                        value={w} onChange={e => {
                          const n = [...words];
                          n[idx] = e.target.value.toUpperCase();
                          setWords(n);
                        }}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white uppercase text-center focus:border-orange-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => {
                        const n = [...words];
                        n.splice(idx, 1);
                        setWords(n);
                      }} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 opacity-0 hover:opacity-100 transition">
                        ✖
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setWords([...words, ""])} className="w-full py-2 border-2 border-dashed border-gray-700 text-gray-400 rounded-lg text-sm font-medium hover:border-gray-500 hover:text-white transition">
                    + Añadir
                  </button>
                </div>
              </div>
            )}

            {/* SURVEY BUILDER */}
            {type === "SURVEY" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-orange-400">Pregunta de la Encuesta</label>
                <input 
                  type="text" placeholder="Ej. ¿Qué tema te gustaría tocar la próxima semana?"
                  value={questions[0].q} 
                  onChange={e => {
                    const n = [...questions];
                    n[0].q = e.target.value;
                    setQuestions(n);
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-medium"
                />

                <label className="block text-sm font-medium text-orange-400 mt-4">Tipo de Gráfico</label>
                <select 
                  value={questions[0].chartType || "horizontal"} 
                  onChange={e => {
                    const n = [...questions];
                    n[0].chartType = e.target.value;
                    setQuestions(n);
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm"
                >
                  <option value="horizontal">Barras Horizontales</option>
                  <option value="vertical">Barras Verticales</option>
                  <option value="pie">Gráfico de Torta</option>
                </select>
                
                <label className="block text-sm font-medium text-orange-400 mt-4">Opciones de respuesta</label>
                <div className="space-y-2">
                  {questions[0].options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-3">
                      <input 
                        type="text" placeholder={`Opción ${oIdx + 1}`}
                        value={opt} 
                        onChange={e => {
                          const n = [...questions];
                          n[0].options[oIdx] = e.target.value;
                          setQuestions(n);
                        }}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                      <button type="button" onClick={() => {
                        const n = [...questions];
                        n[0].options.splice(oIdx, 1);
                        setQuestions(n);
                      }} className="text-gray-600 hover:text-red-500">
                        ✖
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const n = [...questions];
                    n[0].options.push("");
                    setQuestions(n);
                  }} className="text-orange-500 text-sm font-medium hover:underline mt-2">
                    + Añadir opción
                  </button>
                </div>
              </div>
            )}
          </div>

          <button type="button" onClick={handleCreate} disabled={loading || isPending} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/25 transition disabled:opacity-50 mt-6">
            {loading || isPending ? "Guardando..." : "Crear Dinámica"}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: GAMES LIST & PREVIEW */}
      <div className="lg:col-span-7 space-y-8 flex flex-col h-full">
        {/* Games List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              Juegos Registrados
            </h3>
            <div className="flex items-center gap-2">
              <a href="/results" target="_blank" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-purple-500/20 transition flex items-center gap-2">
                Resultados en vivo
              </a>
              <a href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(currentUrl)}`} target="_blank" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                QR
              </a>
            </div>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {games.map(g => (
              <div key={g.id} className={`p-4 border rounded-xl flex items-center justify-between gap-4 transition-all ${g.isActive ? 'bg-orange-500/10 border-orange-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-white">{g.title}</h4>
                    {g.isActive && <span className="bg-orange-500 text-[10px] px-2 py-0.5 rounded-full text-white font-bold tracking-wider uppercase">Activo</span>}
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400 mt-1 font-medium">
                    <span>{g.type === 'QUIZ' ? '📝 Quiz' : '🔍 Sopa Letras'}</span>
                    <span>🏆 Top {g.podiumSize}</span>
                    {g.timeLimit > 0 && <span>⏳ {g.timeLimit}s</span>}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {g.isActive && g.timeLimit > 0 && g.activatedAt && (
                    <AdminTimer activatedAt={g.activatedAt} timeLimit={g.timeLimit} />
                  )}
                  {!g.isActive && (
                    <button type="button" onClick={() => handleActivate(g.id)} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs font-bold transition shadow-sm">
                      Activar
                    </button>
                  )}
                  <button type="button" onClick={() => handleDelete(g.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md text-xs font-bold transition">
                    Borrar
                  </button>
                </div>
              </div>
            ))}
            {games.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay juegos creados.</p>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col relative overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
            Previsualización en Vivo
          </h3>
          <p className="text-sm text-gray-400 mb-6">Así es como los jugadores verán el juego que estás creando a la izquierda.</p>
          
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            {/* Phone Mockup Frame */}
            <div className="w-full max-w-sm h-[600px] max-h-full bg-gray-950 border-[6px] border-gray-800 rounded-[2.5rem] p-4 relative shadow-2xl overflow-hidden flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20"></div>
              
              <div className="flex-1 overflow-y-auto mt-4 pointer-events-none">
                {type === "QUIZ" && <QuizGame key={JSON.stringify(previewGame)} game={previewGame} />}
                {type === "WORD_SEARCH" && <WordSearchGame key={JSON.stringify(previewGame)} game={previewGame} />}
                {type === "SURVEY" && <SurveyGame key={JSON.stringify(previewGame)} game={previewGame} />}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
