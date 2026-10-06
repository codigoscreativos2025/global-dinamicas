import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 overflow-hidden relative z-20">
      <aside className="w-64 border-r border-gray-800 bg-gray-900/80 flex flex-col p-6 shrink-0 relative z-10 backdrop-blur-md">
        <div className="mb-10 flex flex-col items-center">
          <Image src="/logotipo.png" alt="Logo" width={150} height={50} className="drop-shadow-md" />
        </div>
        
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Admin Panel</h2>
        <nav className="flex-1 space-y-2">
          <a href="/admin" className="block px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-transparent text-orange-400 font-medium border-l-4 border-orange-500">
            Juego del Día
          </a>
          <a href="/admin/history" className="block px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition font-medium">
            Historial
          </a>
        </nav>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
