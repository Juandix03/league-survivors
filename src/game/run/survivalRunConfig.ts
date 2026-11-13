/**
 * Partida survivor continua — valores de desarrollo (sin victoria por tiempo aún).
 *
 * Futuro (no implementado):
 * - `RUN_VICTORY_AT_MS`: fin de run / pantalla de victoria.
 * - Boss / élite: spawn dedicado o pesos por `combatElapsedMs` (ver enemyArchetypes).
 * - Modo infinito: dejar `RUN_VICTORY_AT_MS = null` y subir rampas con techo.
 */

/** Referencia para pruebas de balance (5 / 8 / 10 / 15 min — ajustar aquí). */
export const DEV_TARGET_RUN_MINUTES = 10

export const DEV_TARGET_RUN_MS = DEV_TARGET_RUN_MINUTES * 60 * 1000

/**
 * Tiempo de combate para declarar victoria. `null` = solo game over por muerte (estado actual).
 */
export const RUN_VICTORY_AT_MS: number | null = null

export const SURVIVAL_SPAWN = {
  /** Retraso antes del primer spawn tras iniciar la escena (ms reloj Phaser). */
  firstDelayMs: 900,
  /** Intervalo entre spawns al inicio de la partida (ms tiempo de combate). */
  intervalStartMs: 1200,
  /** Intervalo mínimo tras la rampa (ms). */
  intervalMinMs: 920,
  /** Duración de la rampa intervalo → mínimo (ms combate). */
  intervalRampCombatMs: 10 * 60 * 1000,
  /** Tope de enemigos vivos al inicio. */
  maxAliveStart: 26,
  /** Tope máximo (legibilidad / rendimiento). */
  maxAliveCap: 30,
  /** Rampa de tope de vivos (ms combate). */
  maxAliveRampCombatMs: 10 * 60 * 1000,
} as const

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t))
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t)
}

/** Progresión suave 0→1 según tiempo de combate y duración de rampa. */
export function survivalDifficultyT(combatElapsedMs: number, rampMs: number): number {
  if (rampMs <= 0) {
    return 1
  }
  return combatElapsedMs / rampMs
}

/** Ms entre spawns según tiempo de combate (sin oleadas). */
export function resolveSpawnIntervalMs(combatElapsedMs: number): number {
  const t = survivalDifficultyT(
    combatElapsedMs,
    SURVIVAL_SPAWN.intervalRampCombatMs,
  )
  return Math.round(
    lerp(SURVIVAL_SPAWN.intervalStartMs, SURVIVAL_SPAWN.intervalMinMs, t),
  )
}

/** Máximo de enemigos simultáneos (presión gradual, techo fijo). */
export function resolveMaxAliveEnemies(combatElapsedMs: number): number {
  const t = survivalDifficultyT(
    combatElapsedMs,
    SURVIVAL_SPAWN.maxAliveRampCombatMs,
  )
  return Math.round(
    lerp(SURVIVAL_SPAWN.maxAliveStart, SURVIVAL_SPAWN.maxAliveCap, t),
  )
}
