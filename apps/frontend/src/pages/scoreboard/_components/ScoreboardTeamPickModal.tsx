import { X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  formatTeamDisplayName,
  getExcludedNameKeys,
  normalizePlayerKey,
  parseDisplayToSlots,
} from "../../game/playerSelection";
import type { TeamDraft } from "../../game/types";
import type { GameUser } from "../../game/useGameUsers";

type TeamSide = "team1" | "team2";

interface Props {
  team: TeamSide;
  teamName: string;
  otherSideName: string;
  playersPerTeam: 1 | 2;
  users: GameUser[];
  onClose: () => void;
  onConfirm: (displayName: string) => void;
}

export function ScoreboardTeamPickModal({
  team,
  teamName,
  otherSideName,
  playersPerTeam,
  users,
  onClose,
  onConfirm,
}: Props) {
  const teamIndex = team === "team1" ? 0 : 1;
  const title = team === "team1" ? "Time 1" : "Time 2";

  const [slots, setSlots] = useState<string[]>(() =>
    parseDisplayToSlots(teamName, playersPerTeam),
  );

  const otherSlots = useMemo(
    () => parseDisplayToSlots(otherSideName, playersPerTeam),
    [otherSideName, playersPerTeam],
  );

  const virtualTeams: TeamDraft[] = useMemo(() => {
    const a = team === "team1" ? slots : otherSlots;
    const b = team === "team2" ? slots : otherSlots;
    return [
      { id: "modal-t1", playerNames: a },
      { id: "modal-t2", playerNames: b },
    ];
  }, [team, slots, otherSlots]);

  const labels =
    playersPerTeam === 1 ? ["Jogador"] : ["Jogador 1", "Jogador 2"];

  const handleSlotChange = (playerIndex: number, raw: string) => {
    const next = [...slots];
    next[playerIndex] = raw;
    setSlots(next);
  };

  const handleConfirm = () => {
    onConfirm(formatTeamDisplayName(slots));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 px-4 cursor-default"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-sm bg-white border border-gray-300 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scoreboard-team-pick-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className="px-6 pt-6 pb-5 flex flex-col gap-4 pr-12">
          <h2
            id="scoreboard-team-pick-title"
            className="text-lg font-semibold text-black"
          >
            {title}
          </h2>
          {/* <p className="text-sm text-gray-500">
            Escolha os jogadores da lista (cadastrados na configuração). Não é possível
            repetir o mesmo nome nos dois times.
          </p> */}

          {users.length === 0 ? (
            <p className="text-sm text-amber-800">
              Nenhum jogador na lista. Adicione jogadores na tela de configuração para
              preencher os selects.
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            {Array.from({ length: playersPerTeam }, (_, pi) => (
              <label key={pi} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-600">
                  {labels[pi] ?? `Jogador ${pi + 1}`}
                </span>
                <SlotSelect
                  users={users}
                  virtualTeams={virtualTeams}
                  teamIndex={teamIndex}
                  playerIndex={pi}
                  value={slots[pi] ?? ""}
                  onChange={(v) => handleSlotChange(pi, v)}
                />
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlotSelect({
  users,
  virtualTeams,
  teamIndex,
  playerIndex,
  value,
  onChange,
}: {
  users: GameUser[];
  virtualTeams: TeamDraft[];
  teamIndex: number;
  playerIndex: number;
  value: string;
  onChange: (name: string) => void;
}) {
  const excluded = useMemo(
    () => getExcludedNameKeys(virtualTeams, teamIndex, playerIndex),
    [virtualTeams, teamIndex, playerIndex],
  );

  const currentKey = normalizePlayerKey(value);

  const options = useMemo(() => {
    return users.filter((u) => {
      const k = normalizePlayerKey(u.name);
      return !excluded.has(k) || k === currentKey;
    });
  }, [users, excluded, currentKey]);

  const inSavedUsers = users.some(
    (u) => normalizePlayerKey(u.name) === currentKey,
  );
  const showLegacy = value.trim().length > 0 && !inSavedUsers;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white py-2 px-2 text-sm text-black outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
      aria-label={`Jogador ${playerIndex + 1}`}
    >
      <option value="">— Escolher —</option>
      {showLegacy ? (
        <option value={value}>{value} (nome atual)</option>
      ) : null}
      {options.map((u) => (
        <option key={u.id} value={u.name}>
          {u.name}
        </option>
      ))}
    </select>
  );
}
