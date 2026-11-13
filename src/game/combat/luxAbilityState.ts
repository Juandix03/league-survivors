import { devFullAbilityKit } from './abilityLoadoutDev'

export type LuxAbilityLevels = { q: number; w: number; e: number; r: number }

export const MAX_LUX_Q_LEVEL = 5
export const MAX_LUX_W_LEVEL = 5
export const MAX_LUX_E_LEVEL = 5
export const MAX_LUX_R_LEVEL = 3

export function createInitialLuxAbilityLevels(): LuxAbilityLevels {
  if (devFullAbilityKit()) return { q: 1, w: 1, e: 1, r: 1 }
  return { q: 0, w: 0, e: 0, r: 0 }
}

export function isLuxAbilityUnlocked(level: number): boolean {
  return level > 0
}

export function effectiveLuxAbilityLevel(level: number): number {
  return Math.max(0, level)
}

export type LuxQStats = {
  cooldownMs: number
  damage: number
  speed: number
  range: number
  hitRadius: number
  lifetimeMs: number
}

export function resolveLuxQStats(level: number): LuxQStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(700, 1100 - (level - 1) * 60),
    damage: 28 + level * 12,
    speed: 380,
    range: 420,
    hitRadius: 22,
    lifetimeMs: 900,
  }
}

export type LuxWStats = {
  cooldownMs: number
  durationMs: number
  length: number
  waveDamage: number
  waveSpeed: number
  waveRange: number
  waveHitRadius: number
}

export function resolveLuxWStats(level: number): LuxWStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(900, 1400 - (level - 1) * 80),
    durationMs: 1800 + level * 120,
    length: 200 + level * 12,
    waveDamage: 18 + level * 8,
    waveSpeed: 340,
    waveRange: 300,
    waveHitRadius: 28,
  }
}

export type LuxEStats = {
  cooldownMs: number
  damage: number
  radius: number
  slowMs: number
  /** Tras posarse en el suelo: recast o auto-detonación. */
  lingerMs: number
  range: number
  missileSpeed: number
}

export function resolveLuxEStats(level: number): LuxEStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(800, 1300 - (level - 1) * 70),
    damage: 22 + level * 14,
    radius: 52 + level * 4,
    slowMs: 900,
    /** LoL: la singularidad permanece 5 s antes de detonar sola. */
    lingerMs: 5000,
    range: 300,
    missileSpeed: 520,
  }
}

export type LuxRStats = {
  cooldownMs: number
  damage: number
  width: number
  range: number
  chargeMs: number
}

export function resolveLuxRStats(level: number): LuxRStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(4000, 8000 - (level - 1) * 800),
    damage: 120 + level * 80,
    width: 58,
    range: 520,
    chargeMs: 600,
  }
}

/** Tiempo de propagación del haz (visual + daño al completar). */
export const LUX_R_BEAM_TRAVEL_MS = 240
