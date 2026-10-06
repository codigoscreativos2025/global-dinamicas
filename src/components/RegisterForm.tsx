"use client";

import { useState } from "react";
import { loginOrRegister } from "@/app/actions/auth";
import { Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RegisterForm() {
  const [needsName, setNeedsName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("cedula", cedula);
      formData.append("email", email);
      if (needsName) {
        formData.append("name", name);
      }

      const result = await loginOrRegister(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.needsName) {
        setNeedsName(true);
      }
    } catch (err) {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-300">Cédula</label>
          <input
            type="text"
            required
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            placeholder="Ej. 12345678"
            readOnly={needsName}
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-300">Correo Electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            placeholder="correo@ejemplo.com"
            readOnly={needsName}
            disabled={loading}
          />
        </div>

        <AnimatePresence>
          {needsName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 overflow-hidden"
            >
              <div className="pt-2 pb-1 text-sm text-orange-400">
                Parece que eres nuevo, ¡cuéntanos tu nombre!
              </div>
              <label className="text-sm font-medium text-gray-300">Nombre Completo</label>
              <input
                type="text"
                required={needsName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                placeholder="Ej. Juan Pérez"
                disabled={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-orange-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span>{needsName ? "Comenzar a Jugar" : "Ingresar"}</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
