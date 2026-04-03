import tennisBallIcon from "../../../assets/icons/tennis-ball.svg?url";
import { cn } from "../../../utils/className";

type TeamSide = "team1" | "team2";

const accentDot: Record<TeamSide, string> = {
  team1: "bg-lime-600",
  team2: "bg-stone-600",
};

interface Props {
  team: TeamSide;
  teamName: string;
  otherSideName: string;
  playersPerTeam: 1 | 2;
  isServing: boolean;
  onTeamNameChange: (value: string) => void;
  className?: string;
}

export function ScoreboardTeamRow({
  team,
  isServing,
  className,
}: Props) {
  const n = team === "team1" ? "1" : "2";
  const label = `Time ${n}`;

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className ?? "")}>
      <div className="flex min-w-0 items-center gap-2">
        <div className={`h-3 w-3 shrink-0 rounded-none ${accentDot[team]}`} />
        <button
          type="button"
          title={label}
          className="min-w-0 max-w-[min(100%,14rem)] truncate border-b border-transparent text-left font-bold text-sm text-black outline-none transition-colors hover:border-stone-300 focus-visible:border-black cursor-pointer"
          aria-label={`Time ${n}: ${label}. Abrir para escolher jogadores`}
        >
          {label}
        </button>
        <img
          src={tennisBallIcon}
          alt=""
          width={10}
          height={10}
          className={`h-4 w-4 shrink-0 object-contain transition-opacity duration-200 ${isServing ? "opacity-100" : "opacity-0"}`}
          aria-hidden
        />
      </div>
    </div>
  );
}
