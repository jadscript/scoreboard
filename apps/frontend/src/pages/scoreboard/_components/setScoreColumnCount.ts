/** Máximo de sets que podem ser jogados (ex.: melhor de 3 → 3 colunas). */
export function setScoreColumnCount(setsToWinMatch: number): number {
  const n = Math.floor(setsToWinMatch)
  if (n <= 1) return 1
  return 2 * n - 1
}
