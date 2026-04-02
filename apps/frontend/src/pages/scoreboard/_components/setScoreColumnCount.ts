/**
 * Colunas de placar por set.
 * `setsToWinMatch` = vitórias em sets necessárias (ex.: 2 = primeiro a 2).
 * No início mostramos `setsToWinMatch` colunas (alinhado à config); só expandimos
 * até o máximo teórico (2n−1) quando o histórico exige (ex.: 1–1 em sets → set decisivo).
 */
export function setScoreColumnCount(
  setsToWinMatch: number,
  setHistoryLength: number,
  matchFinished: boolean,
): number {
  const wins = Math.floor(setsToWinMatch)
  if (wins < 1) return 1
  if (wins === 1) return 1

  const maxSetsPossible = 2 * wins - 1
  const tail = matchFinished ? 0 : 1
  const needed = setHistoryLength + tail

  return Math.min(maxSetsPossible, Math.max(wins, needed))
}
