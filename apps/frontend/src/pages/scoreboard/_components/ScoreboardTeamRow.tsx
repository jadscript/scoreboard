import { useState } from "react";
import tennisBallIcon from "../../../assets/icons/tennis-ball.svg?url";
import type { GameUser } from "../../game/useGameUsers";
import { ScoreboardTeamPickModal } from "./ScoreboardTeamPickModal";

type TeamSide = "team1" | "team2";

const accentDot: Record<TeamSide, string> = {
  team1: "bg-green-600",
  team2: "bg-blue-600",
};

interface Props {
  team: TeamSide;
  teamName: string;
  otherSideName: string;
  playersPerTeam: 1 | 2;
  users: GameUser[];
  isServing: boolean;
  onTeamNameChange: (value: string) => void;
}

export function ScoreboardTeamRow({
  team,
  teamName,
  otherSideName,
  playersPerTeam,
  users,
  isServing,
  onTeamNameChange,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  /** Incrementado a cada abertura para remontar o modal e inicializar slots sem `useEffect`. */
  const [pickNonce, setPickNonce] = useState(0);
  const n = team === "team1" ? "1" : "2";
  const label = teamName.trim() || `Time ${n}`;

  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <div className={`h-3 w-3 shrink-0 rounded-full ${accentDot[team]}`} />
        <button
          type="button"
          onClick={() => {
            setPickNonce((n) => n + 1);
            setModalOpen(true);
          }}
          title={label}
          className="min-w-0 max-w-[min(100%,14rem)] truncate border-b border-transparent text-left font-bold text-sm text-black outline-none transition-colors hover:border-gray-300 focus-visible:border-black cursor-pointer"
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

      {modalOpen && (
        <ScoreboardTeamPickModal
          key={pickNonce}
          team={team}
          teamName={teamName}
          otherSideName={otherSideName}
          playersPerTeam={playersPerTeam}
          users={users}
          onClose={() => setModalOpen(false)}
          onConfirm={(displayName) => {
            onTeamNameChange(displayName);
          }}
        />
      )}
    </>
  );
}
