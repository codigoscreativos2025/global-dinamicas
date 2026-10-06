"use client";

import { useState, useEffect } from "react";
import { submitGameResult } from "@/app/actions/game";
import { useRouter } from "next/navigation";

export function SurveyGame({ game }: { game: any }) {
  const router = useRouter();
  const [config, setConfig] = useState<{q: string, options: string[]}>({ q: "", options: [] });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    try {
      setConfig(JSON.parse(game.config));
      setStartTime(Date.now());
    } catch (e) {
      console.error("Invalid survey config");
    }
  }, [game]);

  const handleOptionSelect = async (index: number) => {
    if (submitting) return;
    setSelectedOption(index);
    if (!game.id) return; // Ignore on preview
    setSubmitting(true);
    
    // For survey, score is 0, timeMs is tracked, and data stores the selected index.
    const timeMs = Date.now() - startTime;
    await submitGameResult(game.id, 0, timeMs, JSON.stringify({ selectedIndex: index }));
    router.refresh();
  };

  if (!config || !config.options || !config.options.length) return null;

  return (
    <div className="flex flex-col h-full relative">
      <div className="mb-8">
        <h3 className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-4">{game.title}</h3>
        <h2 className="text-2xl font-black text-white">{config.q}</h2>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-3">
        {config.options.map((opt, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(index)}
            disabled={submitting}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all font-bold text-lg
              ${selectedOption === index 
                ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-[1.02]' 
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-700'}
            `}
          >
            {opt || `Opción ${index + 1}`}
          </button>
        ))}
      </div>

      {submitting && (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">¡Enviado!</p>
        </div>
      )}
    </div>
  );
}
