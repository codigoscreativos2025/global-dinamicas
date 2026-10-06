import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Dinámicas",
  description: "Plataforma interactiva para Iglesia Global",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen flex flex-col antialiased selection:bg-orange-500/30`}>
        <main className="flex-1 flex flex-col relative overflow-auto pb-12">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
          {children}
        </main>
        <footer className="fixed bottom-0 w-full text-center py-3 px-6 text-xs text-gray-500/80 z-50 bg-gray-950/80 backdrop-blur-sm border-t border-gray-800/50">
          Desarrollado por PivotSoluciones - Barquisimeto - codigoscretivos2025@gmail.com
        </footer>
      </body>
    </html>
  );
}
