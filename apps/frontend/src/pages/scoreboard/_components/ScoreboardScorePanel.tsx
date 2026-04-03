import { UserPlus } from "lucide-react";
import { cn } from "../../../utils/className";
import { ScoreboardSetScores } from "./ScoreboardSetScores";

interface GameUser {
  id: string;
  name: string;
  email: string;
  gender: "male" | "female" | "unknown";
  whatsapp: string | null;
  photoUrl: string;
}

interface SetScore {
  team1: number;
  team2: number;
}

interface Props {
  team: "team1" | "team2";
  score: string;
  courtSwitched: boolean;
  scoredTeam: "team1" | "team2" | null;
  onScore: () => void;
  games: SetScore;
  setHistory: SetScore[];
  setsToWinMatch: number;
  matchFinished: boolean;
  playersPerTeam: 1 | 2;
  users: GameUser[];
}

const teamSurface: Record<Props["team"], { flash: string; idle: string }> = {
  team1: {
    flash: "score-flash-green",
    idle: "text-lime-700 hover:bg-lime-600 hover:text-white transition-colors",
  },
  team2: {
    flash: "score-flash-blue",
    idle: "text-stone-700 hover:bg-stone-600 hover:text-white transition-colors",
  },
};

export function ScoreboardScorePanel({
  team,
  score,
  courtSwitched,
  scoredTeam,
  onScore,
  games,
  setHistory,
  setsToWinMatch,
  matchFinished,
}: Props) {
  const isFirstColumn = team === "team1" ? !courtSwitched : courtSwitched;
  const layoutClass = isFirstColumn
    ? "order-1 md:border-r-4 md:border-b-0 border-b-[2px] border-stone-900"
    : "order-2 md:border-l-4 md:border-t-0 border-t-[3px] border-stone-900";
  const { flash, idle } = teamSurface[team];
  const surfaceClass = scoredTeam === team ? flash : idle;

  const handleUserAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("user add");
  };

  return (
    <div
      className={`grid grid-rows-12 grid-cols-1 h-full cursor-pointer border-stone-900 ${layoutClass} ${surfaceClass}`}
      onClick={onScore}
    >
      {/* Players avatar */}
      <div
        className={cn(
          "grid grid-cols-2 row-span-3 md:row-span-2 p-4",
          isFirstColumn ? "order-1" : "order-3",
        )}
      >
        <div
          className={cn(
            "flex flex-1 h-full items-center gap-4 col-span-1",
            isFirstColumn ? "justify-start order-1" : "justify-end order-2",
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-3 z-10",
              team === "team1"
                ? "bg-lime-100 text-lime-600 border-lime-600"
                : "bg-stone-200 text-stone-600 border-stone-600",
            )}
            onClick={handleUserAdd}
          >
            {/* <img src={`https://avatars.githubusercontent.com/u/84452479?v=4&size=256`} alt={team} className="w-full h-full object-cover" /> */}
            <UserPlus className="w-7 h-7 object-cover" />
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-3 z-10",
              team === "team2"
                ? "bg-stone-200 text-stone-600 border-stone-600"
                : "bg-lime-100 text-lime-600 border-lime-600",
            )}
            onClick={handleUserAdd}
          >
            {/* <img src={`https://avatars.githubusercontent.com/u/84452479?v=4&size=256`} alt={team} className="w-full h-full object-cover" /> */}
            <UserPlus className="w-7 h-7 object-cover" />
          </div>
        </div>

        <div className={cn("flex items-center gap-4", isFirstColumn ? "order-2 justify-end" : "order-1 justify-start")}>
          <ScoreboardSetScores
            games={games}
            setHistory={setHistory}
            setsToWinMatch={setsToWinMatch}
            matchFinished={matchFinished}
            team={team}
          />
        </div>
      </div>
      {/* Score */}
      <div className="flex items-center flex-1 h-full row-span-6 md:row-span-8 order-2">
        <h1
          className={`font-bold w-full text-center md:text-[25vw] text-[50vw] leading-none score-font ${score === "40" ? "animate-transform" : ""}`}
        >
          {score}
        </h1>
      </div>
      <div
        className={cn(
          "flex items-center w-full h-full row-span-3 md:row-span-2",
          isFirstColumn ? "order-3" : "order-1",
        )}
      ></div>
    </div>
  );
}
