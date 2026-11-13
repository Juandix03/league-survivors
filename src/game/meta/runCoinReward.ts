/** Recompensa de monedas al terminar una partida (solo meta, no XP in-run). */
export function computeRunCoinReward(kills: number, elapsedMs: number): number {
  const minutes = Math.max(0, elapsedMs) / 60_000
  const timePart = Math.floor(minutes * 6)
  const killPart = kills * 3
  return Math.max(12, timePart + killPart)
}
