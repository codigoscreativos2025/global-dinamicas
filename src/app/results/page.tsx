"use client";

import { useEffect, useState } from "react";
import { getLiveResults } from "@/app/actions/results";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ResultsPage() {
  const [data, setData] = useState<{game: any, results: any[]}>({ game: null, results: [] });

  // Component to render timer client-side without re-rendering everything
  const TimeLeftDisplay = ({ activatedAt, timeLimit }: { activatedAt: string, timeLimit: number }) => {
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

    if (timeLeft <= 0) return <p className="text-red-500 font-bold mt-2 animate-pulse">¡TIEMPO AGOTADO!</p>;
    
    return (
      <p className="text-orange-400 font-bold mt-2 text-2xl">
        ⏳ {timeLeft}s
      </p>
    );
  };

  useEffect(() => {
    // Initial fetch
    getLiveResults().then(setData);

    // Poll every 3 seconds
    const interval = setInterval(() => {
      getLiveResults().then(setData);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!data.game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black relative overflow-hidden">
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-orange-500/30 rounded-full"
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0, 0.5, 0],
              scale: [0, Math.random() * 2 + 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
        <motion.div 
          animate={{ scale: [0.95, 1.05, 0.95], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/logotipo.png" alt="Logo" width={400} height={130} className="relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
        </motion.div>
        <p className="mt-8 text-gray-500 font-bold uppercase tracking-widest animate-pulse">Esperando dinámica...</p>
      </div>
    );
  }

  const isPodium = data.game.podiumSize > 1;
  const isSurvey = data.game.type === "SURVEY";
  
  let surveyConfig = null;
  let surveyCounts: number[] = [];
  if (isSurvey) {
    try {
      surveyConfig = JSON.parse(data.game.config);
      surveyCounts = Array(surveyConfig.options.length).fill(0);
      data.results.forEach(r => {
        try {
          const parsedData = JSON.parse(r.data);
          if (parsedData && typeof parsedData.selectedIndex === 'number') {
            surveyCounts[parsedData.selectedIndex]++;
          }
        } catch(e){}
      });
    } catch(e){}
  }

  const totalVotes = surveyCounts.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-orange-600/20 rounded-full blur-[150px] pointer-events-none" />

      <header className="p-8 flex items-center justify-between relative z-10">
        <Image src="/logotipo.png" alt="Logo" width={200} height={60} className="drop-shadow-xl" />
        <div className="text-right">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 uppercase tracking-widest drop-shadow-sm">
            {isSurvey ? "Respuestas" : "Resultados"}
          </h1>
          <p className="text-xl text-gray-400 font-medium">{data.game.title}</p>
          {data.game.timeLimit > 0 && data.game.activatedAt && (
            <TimeLeftDisplay 
              activatedAt={data.game.activatedAt} 
              timeLimit={data.game.timeLimit} 
            />
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        {data.results.length === 0 ? (
          <p className="text-2xl text-gray-500 animate-pulse">Esperando jugadores...</p>
        ) : isSurvey && surveyConfig ? (
          <div className="w-full max-w-4xl">
            <h2 className="text-3xl font-black text-center mb-12">{surveyConfig.q}</h2>
            {surveyConfig.chartType === "vertical" ? (
              <div className="flex items-end justify-center gap-8 h-80">
                {surveyConfig.options.map((opt: string, i: number) => {
                  const count = surveyCounts[i];
                  const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="text-orange-400 font-bold">{percentage}%</span>
                      <div className="w-24 bg-gray-900 rounded-t-lg overflow-hidden border-t border-x border-gray-800 relative h-64 flex flex-col justify-end">
                        <motion.div 
                          className="w-full bg-gradient-to-t from-orange-600 to-orange-400"
                          initial={{ height: 0 }}
                          animate={{ height: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <span className="font-bold max-w-[96px] text-center text-sm">{opt}</span>
                    </div>
                  );
                })}
              </div>
            ) : surveyConfig.chartType === "pie" ? (
              <div className="flex flex-col items-center">
                <div 
                  className="w-80 h-80 rounded-full mb-8 relative shadow-2xl"
                  style={{
                    background: `conic-gradient(${surveyConfig.options.map((opt: string, i: number) => {
                      const prevCounts = surveyCounts.slice(0, i).reduce((a,b)=>a+b, 0);
                      const start = totalVotes === 0 ? 0 : (prevCounts / totalVotes) * 100;
                      const end = totalVotes === 0 ? 0 : ((prevCounts + surveyCounts[i]) / totalVotes) * 100;
                      const colors = ["#f97316", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#64748b"];
                      return `${colors[i % colors.length]} ${start}% ${end}%`;
                    }).join(', ')})`
                  }}
                />
                <div className="flex flex-wrap justify-center gap-6">
                  {surveyConfig.options.map((opt: string, i: number) => {
                    const count = surveyCounts[i];
                    const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                    const colors = ["bg-orange-500", "bg-yellow-500", "bg-red-500", "bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-slate-500"];
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${colors[i % colors.length]}`} />
                        <span className="font-bold">{opt} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {surveyConfig.options.map((opt: string, i: number) => {
                  const count = surveyCounts[i];
                  const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>{opt}</span>
                        <span className="text-orange-400">{percentage}% ({count})</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-8 overflow-hidden border border-gray-800 relative">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-5xl flex items-end justify-center gap-4 md:gap-8 min-h-[400px]">
            <AnimatePresence>
              {data.results.map((result, index) => {
                // Determine podium position styling (2nd, 1st, 3rd logic for visual podium)
                let visualOrder = index; // 0, 1, 2
                let height = "h-64";
                let color = "from-gray-400 to-gray-600";
                let scale = 1;

                if (isPodium && data.results.length >= 3) {
                  // Visual order: 2nd on left, 1st in center, 3rd on right
                  if (index === 0) { visualOrder = 1; height = "h-96"; color = "from-yellow-400 to-yellow-600"; scale = 1.1; } // 1st
                  if (index === 1) { visualOrder = 0; height = "h-72"; color = "from-gray-300 to-gray-500"; } // 2nd
                  if (index === 2) { visualOrder = 2; height = "h-56"; color = "from-orange-700 to-amber-900"; } // 3rd
                } else if (index === 0) {
                  // Just 1st place
                  height = "h-96"; color = "from-yellow-400 to-yellow-600"; scale = 1.1;
                }

                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="flex flex-col items-center"
                    style={{ order: visualOrder }}
                  >
                    {/* Score Bubble */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: scale }}
                      transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
                      className="mb-6 flex flex-col items-center"
                    >
                      <div className="text-3xl md:text-5xl font-black text-white whitespace-nowrap mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        {result.user.name}
                      </div>
                      <div className="bg-gray-900/80 border border-gray-700 px-4 py-2 rounded-full text-orange-400 font-bold tracking-widest shadow-xl">
                        {result.score} PTS
                      </div>
                    </motion.div>

                    {/* Podium Pillar */}
                    <div className={`w-32 md:w-48 rounded-t-lg bg-gradient-to-t ${color} shadow-2xl relative overflow-hidden flex justify-center pt-4 border-t-2 border-white/20 ${height}`}>
                      <span className="text-6xl font-black text-black/20">{index + 1}</span>
                      
                      {/* Shine effect */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
