"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { checkActiveGame } from "@/app/actions/game";

export function WaitingRoom() {
  const router = useRouter();

  useEffect(() => {
    // Polling every 4 seconds to avoid overwhelming the database
    const interval = setInterval(async () => {
      const hasActiveGame = await checkActiveGame();
      if (hasActiveGame) {
        // If a game became active, refresh the page to start playing!
        router.refresh();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full px-6 py-12 relative z-10 text-center">
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/logotipo.png" alt="Logo" width={220} height={80} className="mb-10 opacity-80" />
      </motion.div>
      
      <div className="relative">
        <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-8 shadow-[0_0_15px_rgba(249,112,21,0.5)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-orange-500/20 rounded-full animate-ping"></div>
      </div>

      <h2 className="text-3xl font-black text-white mb-4 tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
        Sala de Espera
      </h2>
      <p className="text-gray-400 text-lg max-w-md">
        Aún no es momento. Mantén esta pantalla abierta, el juego iniciará automáticamente cuando se indique desde la tarima.
      </p>
    </div>
  );
}
