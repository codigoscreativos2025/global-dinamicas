"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitGameResult } from "@/app/actions/game";
import { useRouter } from "next/navigation";

export function QuizGame({ game }: { game: any }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    try {
      setQuestions(JSON.parse(game.config));
      setStartTime(Date.now());
      if (game.timeLimit > 0) {
        setTimeLeft(game.timeLimit);
      }
    } catch (e) {
      console.error("Invalid game config");
    }
  }, [game]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting) return;
    const t = setInterval(() => {
      setTimeLeft(l => {
        if (l && l <= 1) {
          clearInterval(t);
          finishGame();
          return 0;
        }
        return l ? l - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft, submitting]);

  const finishGame = async (bonusScore = 0) => {
    setSubmitting(true);
    const timeMs = Date.now() - startTime;
    await submitGameResult(game.id, score + bonusScore, timeMs);
    router.refresh();
  };

  const handleOptionSelect = async (index: number) => {
    if (showFeedback || submitting) return;
    
    setSelectedOption(index);
    setShowFeedback(true);

    const isCorrect = index === questions[currentIndex].correct;
    if (isCorrect) {
      setScore(s => s + 1);
    }

    // Wait a bit to show feedback
    setTimeout(async () => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        await finishGame(isCorrect ? 1 : 0);
      }
    }, 1500);
  };

  if (!questions.length) return <p className="text-center text-gray-500">Cargando...</p>;

  const currentQ = questions[currentIndex];

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-orange-500 font-bold uppercase tracking-wider text-sm">{game.title}</h3>
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 text-xl md:text-2xl font-black px-4 py-1.5 rounded-lg border-2 ${timeLeft <= 10 ? 'text-red-500 border-red-500/50 animate-pulse bg-red-500/10' : 'text-orange-400 border-orange-500/30 bg-orange-500/10'}`}>
              ⏳ {timeLeft}s
            </div>
          )}
          <span className="text-gray-400 text-sm font-medium">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center balance-text">
              {currentQ.q}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt: string, idx: number) => {
                let btnStyle = "bg-gray-800 border-gray-700 hover:border-orange-500/50 hover:bg-gray-700 text-white";
                
                if (showFeedback) {
                  if (idx === currentQ.correct) {
                    btnStyle = "bg-green-500/20 border-green-500/50 text-green-400";
                  } else if (idx === selectedOption) {
                    btnStyle = "bg-red-500/20 border-red-500/50 text-red-400";
                  } else {
                    btnStyle = "bg-gray-800/50 border-gray-800 text-gray-500 opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={showFeedback}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 font-medium ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {submitting && (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">Enviando resultados...</p>
        </div>
      )}
    </div>
  );
}
