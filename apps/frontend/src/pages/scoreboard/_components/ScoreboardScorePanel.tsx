interface Props {
  team: "team1" | "team2";
  score: string;
  courtSwitched: boolean;
  scoredTeam: "team1" | "team2" | null;
  onScore: () => void;
}

const teamSurface: Record<
  Props["team"],
  { flash: string; idle: string }
> = {
  team1: {
    flash: "score-flash-green",
    idle: "text-green-700 hover:bg-green-600 hover:text-white transition-colors",
  },
  team2: {
    flash: "score-flash-blue",
    idle: "text-blue-700 hover:bg-blue-600 hover:text-white transition-colors",
  },
};

export function ScoreboardScorePanel({
  team,
  score,
  courtSwitched,
  scoredTeam,
  onScore,
}: Props) {
  const isFirstColumn =
    team === "team1" ? !courtSwitched : courtSwitched;
  const layoutClass = isFirstColumn
    ? "order-1 border-r-4"
    : "order-2 border-l-4";
  const { flash, idle } = teamSurface[team];
  const surfaceClass = scoredTeam === team ? flash : idle;

  return (
    <div
      className={`flex items-center justify-center h-full cursor-pointer border-black ${layoutClass} ${surfaceClass}`}
      onClick={onScore}
    >
      <h1
        className={`font-bold w-full text-center text-[25vw] leading-none score-font ${score === "40" ? "animate-transform" : ""}`}
      >
        {score}
      </h1>
    </div>
  );
}
