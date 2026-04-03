import { setScoreColumnCount } from './setScoreColumnCount'

interface SetScore {
  team1: number
  team2: number
}

interface Props {
  games: SetScore
  setHistory: SetScore[]
  /** Vitórias em sets para fechar a partida (vem do estado / config). */
  setsToWinMatch: number
  matchFinished: boolean
  team: "team1" | "team2";
}

export function ScoreboardSetScores({
  games,
  setHistory,
  setsToWinMatch,
  matchFinished,
  team,
}: Props) {
  const slots = setScoreColumnCount(
    setsToWinMatch,
    setHistory.length,
    matchFinished,
  )
  return (
    <div className="flex gap-4">
      {Array.from({ length: slots }, (_, i) => {
        const completed = setHistory[i]
        const isCurrent = i === setHistory.length
        const t1 = completed ? completed.team1 : isCurrent ? games.team1 : 0
        const t2 = completed ? completed.team2 : isCurrent ? games.team2 : 0
        const team1Won = completed ? completed.team1 > completed.team2 : null
        return (
          <div key={i} className="flex flex-col gap-1 items-center score-font">
            {team === "team1" && <span
              className={`font-bold text-[10vw] md:text-[5vw] text-center ${team1Won === false ? "opacity-40" : ""}`}
            >
              {t1}
            </span>}
            {team === "team2" && <span
              className={`font-bold text-[10vw] md:text-[6vw] text-center ${team1Won === true ? "opacity-40" : ""}`}
            >
              {t2}
            </span>}
          </div>
        )
      })}
    </div>
  )
}
