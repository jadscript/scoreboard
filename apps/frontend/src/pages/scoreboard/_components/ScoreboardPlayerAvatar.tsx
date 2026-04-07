import type { MouseEvent } from "react";
import { UserPlus } from "lucide-react";
import { cn } from "../../../utils/className";

export type ScoreboardPlayerAvatarPlayer = { id: string; name: string };

function initialsFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    const w = parts[0];
    if (!w) return "?";
    return w.length >= 2
      ? (w[0] + w[1]).toUpperCase()
      : w[0].toUpperCase();
  }
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

interface Props {
  team: "team1" | "team2";
  player?: ScoreboardPlayerAvatarPlayer | null;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

export function ScoreboardPlayerAvatar({
  team,
  player,
  onClick,
  className,
}: Props) {
  const surface =
    team === "team1"
      ? "bg-lime-100 text-lime-600 border-lime-600"
      : "bg-stone-200 text-stone-600 border-stone-600";

  return (
    <div
      className={cn(
        "w-12 h-12 md:w-18 md:h-18 rounded-full overflow-hidden flex items-center justify-center border-3 md:border-5 z-10",
        surface,
        className ?? "",
      )}
      onClick={onClick}
      aria-label={player ? player.name : undefined}
    >
      {player ? (
        <span className="text-sm md:text-lg font-semibold leading-none select-none">
          {initialsFromName(player.name)}
        </span>
      ) : (
        <UserPlus className="w-7 h-7 object-cover shrink-0" aria-hidden />
      )}
    </div>
  );
}
