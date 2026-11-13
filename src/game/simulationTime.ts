/** Límite por frame para evitar saltos tras cambio de pestaña (ms). */
export const MAX_FRAME_DELTA_MS = 250

export function simulationDeltaMs(deltaMs: number): number {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
    return 0
  }
  return Math.min(deltaMs, MAX_FRAME_DELTA_MS)
}
