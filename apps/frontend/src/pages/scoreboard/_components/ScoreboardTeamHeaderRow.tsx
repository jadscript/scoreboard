import { useMemo } from "react";
import tennisBallIcon from "../../../assets/icons/tennis-ball.svg?url";
import type { TeamDraft } from "../../game/types";
import {
  formatTeamDisplayName,
  resolveTeamIndexByName,
} from "../../game/playerSelection";

interface Props {
  team: "team1" | "team2";
  name: string;
  onNameChange: (value: string) => void;
  isServing: boolean;
  /** Times da configuração; com ≥2 entradas usa-se select em vez de texto livre. */
  setupTeams: TeamDraft[];
  /** Nome do outro lado (para desativar o mesmo time neste select). */
  otherSideName: string;
}

const accentClass: Record<Props["team"], string> = {
  team1: "bg-green-600",
  team2: "bg-blue-600",
};

export function ScoreboardTeamHeaderRow({
  team,
  name,
  onNameChange,
  isServing,
  setupTeams,
  otherSideName,
}: Props) {
  const n = team === "team1" ? "1" : "2";

  const otherIdx = useMemo(
    () => resolveTeamIndexByName(setupTeams, otherSideName),
    [setupTeams, otherSideName],
  );

  const myIdx = useMemo(
    () => resolveTeamIndexByName(setupTeams, name),
    [setupTeams, name],
  );

  const useSelect = setupTeams.length >= 2;

  if (useSelect) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <div className={`h-3 w-3 shrink-0 rounded-full ${accentClass[team]}`} />
        <select
          value={myIdx >= 0 ? String(myIdx) : ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return;
            const i = Number.parseInt(v, 10);
            if (Number.isNaN(i) || i < 0 || i >= setupTeams.length) return;
            onNameChange(formatTeamDisplayName(setupTeams[i].playerNames));
          }}
          className="min-w-0 max-w-[min(100%,14rem)] truncate rounded border border-transparent bg-transparent font-bold text-sm outline-none hover:border-gray-300 focus:border-black"
          aria-label={`Time ${n} em jogo`}
        >
          <option value="">Escolher time…</option>
          {setupTeams.map((t, i) => {
            const label = formatTeamDisplayName(t.playerNames);
            const disabled = otherIdx >= 0 && i === otherIdx;
            return (
              <option key={t.id} value={i} disabled={disabled}>
                {label}
              </option>
            );
          })}
        </select>
        <img
          src={tennisBallIcon}
          alt=""
          width={10}
          height={10}
          className={`h-4 w-4 shrink-0 object-contain transition-opacity duration-200 ${isServing ? "opacity-100" : "opacity-0"}`}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className={`h-3 w-3 shrink-0 rounded-full ${accentClass[team]}`} />
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="flex border-b border-transparent font-bold text-sm outline-none hover:border-gray-300 focus:border-black"
        style={{ width: `${Math.max(name.length, 4)}ch` }}
        aria-label={`Nome do time ${n}`}
        maxLength={40}
      />
      <img
        src={tennisBallIcon}
        alt=""
        width={10}
        height={10}
        className={`h-4 w-4 shrink-0 object-contain transition-opacity duration-200 ${isServing ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />
    </div>
  );
}
