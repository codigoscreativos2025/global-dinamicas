import { getGames } from "@/app/actions/admin";
import { AdminGames } from "@/components/AdminGames";

export default async function AdminPage() {
  const games = await getGames();
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Juego del Día</h1>
      <p className="text-gray-400 mb-8">Configura la dinámica que jugará la iglesia hoy.</p>
      
      <AdminGames games={games} />
    </div>
  );
}
