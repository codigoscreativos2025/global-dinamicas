"use client";

import { useState, useEffect } from "react";
import { submitGameResult } from "@/app/actions/game";
import { useRouter } from "next/navigation";

// Utility to generate a word search grid
function generateGrid(words: string[], size: number = 10) {
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const answerMap: Record<string, {r:number, c:number}[]> = {};
  const dirs = [[0,1], [1,0], [1,1], [-1,1]]; // right, down, diag-down-right, diag-up-right

  const placeWord = (word: string) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + d[0] * i;
        const c = col + d[1] * i;
        if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] !== "" && grid[r][c] !== word[i])) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        const cells = [];
        for (let i = 0; i < word.length; i++) {
          const r = row + d[0] * i;
          const c = col + d[1] * i;
          grid[r][c] = word[i];
          cells.push({ r, c });
        }
        answerMap[word] = cells;
        return true;
      }
    }
    return false;
  };

  words.forEach(w => placeWord(w.toUpperCase()));

  const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return { grid, answerMap };
}

export function WordSearchGame({ game }: { game: any }) {
  const router = useRouter();
  const [words, setWords] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{r:number, c:number}[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [answerMap, setAnswerMap] = useState<Record<string, {r:number, c:number}[]>>({});

  useEffect(() => {
    try {
      const parsedWords = JSON.parse(game.config) as string[];
      setWords(parsedWords);
      // Auto-hide words based on a 10x10 or 12x12 grid
      const size = parsedWords.join("").length > 30 ? 12 : 10;
      const generated = generateGrid(parsedWords, size);
      setGrid(generated.grid);
      setAnswerMap(generated.answerMap);
      setStartTime(Date.now());
      if (game.timeLimit > 0) {
        setTimeLeft(game.timeLimit);
      }
    } catch (e) {
      console.error("Invalid word search config");
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

  const toggleCell = (r: number, c: number) => {
    const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
    let newSelected;
    if (isSelected) {
      newSelected = selectedCells.filter(cell => !(cell.r === r && cell.c === c));
    } else {
      newSelected = [...selectedCells, { r, c }];
    }
    setSelectedCells(newSelected);

    // Check if the current selection exactly matches any word's coordinates in the answerMap
    // Regardless of the order the user clicked them!
    const selectedKeys = newSelected.map(cell => `${cell.r},${cell.c}`).sort();
    
    let matchedWord = null;
    for (const [word, cells] of Object.entries(answerMap)) {
      if (cells.length !== selectedKeys.length) continue;
      const answerKeys = cells.map(cell => `${cell.r},${cell.c}`).sort();
      if (selectedKeys.every((val, index) => val === answerKeys[index])) {
        matchedWord = word;
        break;
      }
    }

    if (matchedWord && !foundWords.includes(matchedWord)) {
      const newFound = [...foundWords, matchedWord];
      setFoundWords(newFound);
      setSelectedCells([]); // clear selection

      // Check if finished
      if (newFound.length === words.length) {
        finishGame();
      }
    }
  };

  const finishGame = async () => {
    setSubmitting(true);
    const timeMs = Date.now() - startTime;
    // Score based on found words length at time of submission
    setFoundWords(currentFound => {
      const score = currentFound.length * 100;
      submitGameResult(game.id, score, timeMs).then(() => {
        router.refresh();
      });
      return currentFound;
    });
  };

  if (!grid.length) return <p className="text-center text-gray-500">Generando sopa de letras...</p>;

  return (
    <div className="flex flex-col h-full relative items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="text-orange-500 font-bold uppercase tracking-wider text-sm">{game.title}</h3>
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 text-xl md:text-2xl font-black px-4 py-1.5 rounded-lg border-2 ${timeLeft <= 10 ? 'text-red-500 border-red-500/50 animate-pulse bg-red-500/10' : 'text-orange-400 border-orange-500/30 bg-orange-500/10'}`}>
            ⏳ {timeLeft}s
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {words.map(w => (
          <span key={w} className={`px-2 py-1 rounded text-sm font-bold ${foundWords.includes(w) ? 'bg-green-500/20 text-green-400 line-through' : 'bg-gray-800 text-gray-300'}`}>
            {w}
          </span>
        ))}
      </div>

      <div className="grid gap-1 p-4 bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm aspect-square" style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)`}}>
        {grid.map((row, rIdx) => 
          row.map((letter, cIdx) => {
            const isSelected = selectedCells.some(cell => cell.r === rIdx && cell.c === cIdx);
            
            // If it's preview mode, highlight ALL cells that belong to an answer
            let isPreviewAnswer = false;
            if (!game.id) {
              for (const cells of Object.values(answerMap)) {
                if (cells.some(cell => cell.r === rIdx && cell.c === cIdx)) {
                  isPreviewAnswer = true;
                  break;
                }
              }
            }

            return (
              <button
                key={`${rIdx}-${cIdx}`}
                onClick={() => toggleCell(rIdx, cIdx)}
                className={`w-full h-full flex items-center justify-center rounded font-bold text-lg md:text-xl transition-all select-none
                  ${isSelected ? 'bg-orange-500 text-white scale-95 shadow-inner' : 
                    (isPreviewAnswer ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}
                `}
              >
                {letter}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        Toca las letras para formar las palabras.
        <br />
        <button onClick={() => setSelectedCells([])} className="text-orange-500 mt-2 hover:underline">Limpiar selección actual</button>
      </div>

      {submitting && (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">¡Completado! Guardando...</p>
        </div>
      )}
    </div>
  );
}
