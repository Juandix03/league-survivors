import { devFullAbilityKit } from './abilityLoadoutDev'

export type YasuoAbilityLevels = { q: number; w: number; e: number; r: number }

export const MAX_YASUO_Q_LEVEL = 5
export const MAX_YASUO_W_LEVEL = 5
export const MAX_YASUO_E_LEVEL = 5
export const MAX_YASUO_R_LEVEL = 3

export function createInitialYasuoAbilityLevels(): YasuoAbilityLevels {
  if (devFullAbilityKit()) return { q: 1, w: 1, e: 1, r: 1 }
  return { q: 0, w: 0, e: 0, r: 0 }
}

export function isYasuoAbilityUnlocked(level: number): boolean {
  return level > 0
}

export function effectiveYasuoAbilityLevel(level: number): number {
  return level <= 0 ? 0 : level
}

/** Q = espadazo corto al frente (Steel Tempest melee), no proyectil lejano. */
export type YasuoQStats = {
  cooldownMs: number
  damage: number
  /** Distancia del corte desde el centro del campeón. */
  range: number
  /** Ancho perpendicular del arco (px). */
  width: number
  /** Inicio del hitbox hacia adelante (evita pegar en los pies). */
  rangeOrigin: number
}

export function resolveYasuoQStats(level: number): YasuoQStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(700, 1400 - (level - 1) * 120),
    damage: 2.2 + level * 0.7,
    range: 92 + level * 16,
    width: 26 + level * 3,
    rangeOrigin: 18,
  }
}

/** Timing del espadazo animado (windup + estocada + recover). */
export function resolveYasuoQSwingTiming(_level: number) {
  return {
    windupMs: 58,
    lungeMs: 0,
    recoverMs: 52,
    lungePx: 0,
  }
}

export type YasuoWStats = {
  cooldownMs: number
  durationMs: number
  length: number
  thickness: number
}

export function resolveYasuoWStats(level: number): YasuoWStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(900, 1800 - (level - 1) * 100),
    durationMs: 2200 + level * 200,
    length: 118 + level * 10,
    thickness: 20 + level * 2,
  }
}

export type YasuoEStats = {
  cooldownMs: number
  damage: number
  dashDurationMs: number
  range: number
  hitRadius: number
}

export function resolveYasuoEStats(level: number): YasuoEStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(400, 900 - (level - 1) * 70),
    damage: 1.6 + level * 0.5,
    dashDurationMs: 220,
    range: 200 + level * 18,
    hitRadius: 20,
  }
}

export type YasuoRStats = {
  cooldownMs: number
  damage: number
  radius: number
}

export function resolveYasuoRStats(level: number): YasuoRStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(4000, 7000 - (level - 1) * 400),
    damage: 4.5 + level * 1.2,
    radius: 150 + level * 25,
  }
}
