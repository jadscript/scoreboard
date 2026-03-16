import { RotateCcw, Undo2 } from "lucide-react";
import { useScoreboard } from "../hooks/useScoreboard";

const Divider = () => (
  <div className="w-[2px] h-[45px] bg-gray-300 rounded-full" />
);

export function ScoreboardPage() {
  const {
    handleScore,
    handleUndo,
    handleReset,
    team1Score,
    team2Score,
    games,
    setHistory,
    serving,
  } = useScoreboard();

  return (
    <div className="flex flex-col items-center justify-between">
      <div className="w-full grid grid-cols-2 items-center justify-center h-screen">
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <div className="flex px-6 py-2 m-3 bg-white text-black rounded-full items-center gap-4 shadow-md">
            {/* Team labels */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full" />
                <span className="font-bold text-sm mr-2">Team 1</span>
                <div
                  className={`w-2.5 h-2.5 rounded-full bg-black transition-opacity duration-200 ${serving === "team1" ? "opacity-100" : "opacity-0"}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <span className="font-bold text-sm mr-2">Team 2</span>
                <div
                  className={`w-2.5 h-2.5 rounded-full bg-black transition-opacity duration-200 ${serving === "team2" ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            </div>

            <Divider />

            {/* 3 set columns — filled as the match progresses */}
            {Array.from({ length: 3 }, (_, i) => {
              const completed = setHistory[i];
              const isCurrent = i === setHistory.length;
              const t1 = completed
                ? completed.team1
                : isCurrent
                  ? games.team1
                  : 0;
              const t2 = completed
                ? completed.team2
                : isCurrent
                  ? games.team2
                  : 0;
              const team1Won = completed
                ? completed.team1 > completed.team2
                : null;
              return (
                <div key={i} className="flex flex-col gap-1 items-center">
                  <span
                    className={`font-bold text-sm w-3 text-center ${team1Won === false ? "opacity-40" : ""}`}
                  >
                    {t1}
                  </span>
                  <span
                    className={`font-bold text-sm w-3 text-center ${team1Won === true ? "opacity-40" : ""}`}
                  >
                    {t2}
                  </span>
                </div>
              );
            })}

            <Divider />

            {/* Current game points */}
            {/* <div className="flex flex-col gap-1">
            <span className="font-bold text-sm text-center opacity-40">
              {team1Score}{isTiebreak ? ' TB' : ''}
            </span>
            <span className="font-bold text-sm text-center opacity-40">
              {team2Score}{isTiebreak ? ' TB' : ''}
            </span>
          </div> */}

            {/* <Divider /> */}

            <button
              onClick={handleUndo}
              className="transition-colors cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3"
              title="Desfazer última ação"
            >
              <Undo2 size={16} />
            </button>

            <button
              onClick={handleReset}
              className="transition-colors cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded-full p-3"
              title="Resetar partida text-white"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <div
          className="flex items-center justify-center border-r h-full bg-green-700 hover:bg-green-600 transition-colors cursor-pointer"
          onClick={() => handleScore("team1")}
        >
          <h1
            className={`font-bold w-full text-center text-[15vw] leading-none score-font ${team1Score === "40" ? "animate-transform" : ""}`}
          >
            {team1Score}
          </h1>
        </div>
        <div
          className="flex items-center justify-center border-l h-full bg-blue-700 hover:bg-blue-600 transition-colors cursor-pointer"
          onClick={() => handleScore("team2")}
        >
          <h1
            className={`font-bold w-full text-center text-[15vw] leading-none score-font ${team2Score === "40" ? "animate-transform" : ""}`}
          >
            {team2Score}
          </h1>
        </div>
      </div>
    </div>
  );
}
