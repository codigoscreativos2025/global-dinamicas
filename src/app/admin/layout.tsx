export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <aside className="w-64 border-r border-gray-800 bg-gray-900/50 flex flex-col p-6">
        <h2 className="text-xl font-bold text-orange-500 mb-8">Global Admin</h2>
        <nav className="flex-1 space-y-2">
          <a href="/admin" className="block px-4 py-2 rounded-md bg-orange-500/10 text-orange-400 font-medium border border-orange-500/20">
            Juego del Día
          </a>
          <a href="/admin/users" className="block px-4 py-2 rounded-md hover:bg-gray-800 text-gray-400 transition">
            Jugadores
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
