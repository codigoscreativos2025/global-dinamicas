import { getActiveGameForPlayer } from "@/app/actions/game";
import { QuizGame } from "@/components/games/QuizGame";
import { WordSearchGame } from "@/components/games/WordSearchGame";
import { WaitingRoom } from "@/components/WaitingRoom";
import Image from "next/image";

export default async function PlayPage() {
  const { user, game, hasPlayed } = await getActiveGameForPlayer();

  if (!game) {
    return <WaitingRoom />;
  }

  if (hasPlayed) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full px-6 py-12">
        <Image src="/logotipo.png" alt="Logo" width={180} height={60} className="mb-8 opacity-50" />
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/50">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">¡Completado!</h2>
        <p className="text-gray-400 text-center">Tus respuestas han sido enviadas. Presta atención a las pantallas para ver los resultados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full p-4 md:p-8 relative z-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Image src="/logotipo.png" alt="Logo" width={120} height={40} />
        <div className="text-right">
          <p className="text-xs text-gray-500">Jugador</p>
          <p className="text-sm font-semibold text-white">{user.name}</p>
        </div>
      </div>

      <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
        {game.type === "QUIZ" && <QuizGame game={game} />}
        {game.type === "WORD_SEARCH" && <WordSearchGame game={game} />}
        {/* {game.type === "SURVEY" && <SurveyGame game={game} />} */}
      </div>
    </div>
  );
}
