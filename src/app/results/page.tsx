"use client";

import { useEffect, useState } from "react";
import { getLiveResults } from "@/app/actions/results";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ResultsPage() {
  const [data, setData] = useState<{game: any, results: any[]}>({ game: null, results: [] });

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Image src="/logotipo.png" alt="Logo" width={300} height={100} className="opacity-20" />
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
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        {data.results.length === 0 ? (
          <p className="text-2xl text-gray-500 animate-pulse">Esperando jugadores...</p>
        ) : isSurvey && surveyConfig ? (
          <div className="w-full max-w-4xl space-y-6">
            <h2 className="text-3xl font-black text-center mb-12">{surveyConfig.q}</h2>
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
