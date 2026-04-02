import { ScoreboardSetScores } from "./ScoreboardSetScores";
import { ScoreboardTeamRow } from "./ScoreboardTeamRow";

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
  team1Name: string;
  team2Name: string;
  setTeamName: (team: "team1" | "team2", value: string) => void;
  serving: "team1" | "team2";
  games: SetScore;
  setHistory: SetScore[];
  setsToWinMatch: number;
  matchFinished: boolean;
  playersPerTeam: 1 | 2;
  users: GameUser[];
}

const Divider = () => (
  <div className="w-[2px] min-h-12 shrink-0 self-stretch bg-gray-300 rounded-full" />
);

export function ScoreboardInfoGroup({
  team1Name,
  team2Name,
  setTeamName,
  serving,
  games,
  setHistory,
  setsToWinMatch,
  matchFinished,
  playersPerTeam,
}: Props) {
  return (
    <div className="flex gap-4 flex-1">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <ScoreboardTeamRow
          team="team1"
          teamName={team1Name}
          otherSideName={team2Name}
          playersPerTeam={playersPerTeam}
          isServing={serving === "team1"}
          onTeamNameChange={(value) => setTeamName("team1", value)}
        />
        <ScoreboardTeamRow
          team="team2"
          teamName={team2Name}
          otherSideName={team1Name}
          playersPerTeam={playersPerTeam}
          isServing={serving === "team2"}
          onTeamNameChange={(value) => setTeamName("team2", value)}
        />
      </div>

      <Divider />

      <ScoreboardSetScores
        games={games}
        setHistory={setHistory}
        setsToWinMatch={setsToWinMatch}
        matchFinished={matchFinished}
      />
    </div>
  );
}
