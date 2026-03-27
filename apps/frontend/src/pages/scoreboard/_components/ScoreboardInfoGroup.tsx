import type { TeamDraft } from "../../game/types";
import { ScoreboardSetScores } from "./ScoreboardSetScores";
import { ScoreboardTeamHeaderRow } from "./ScoreboardTeamHeaderRow";

interface SetScore {
  team1: number;
  team2: number;
}

interface Props {
  team1Name: string;
  team2Name: string;
  setTeamName: (team: "team1" | "team2", value: string) => void;
  serving: "team1" | "team2";
  games: SetScore;
  setHistory: SetScore[];
  setsToWinMatch: number;
  setupTeams: TeamDraft[];
}

const Divider = () => (
  <div className="w-[2px] h-[45px] bg-gray-300 rounded-full" />
);

export function ScoreboardInfoGroup({
  team1Name,
  team2Name,
  setTeamName,
  serving,
  games,
  setHistory,
  setsToWinMatch,
  setupTeams,
}: Props) {
  return (
    <div className="flex gap-4 flex-1">
      <div className="flex flex-col gap-1 flex-1">
        <ScoreboardTeamHeaderRow
          team="team1"
          name={team1Name}
          onNameChange={(value) => setTeamName("team1", value)}
          isServing={serving === "team1"}
          setupTeams={setupTeams}
          otherSideName={team2Name}
        />
        <ScoreboardTeamHeaderRow
          team="team2"
          name={team2Name}
          onNameChange={(value) => setTeamName("team2", value)}
          isServing={serving === "team2"}
          setupTeams={setupTeams}
          otherSideName={team1Name}
        />
      </div>

      <Divider />

      <ScoreboardSetScores
        games={games}
        setHistory={setHistory}
        setsToWinMatch={setsToWinMatch}
      />
    </div>
  );
}
