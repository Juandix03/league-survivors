import { devFullAbilityKit } from './abilityLoadoutDev'

export type EzrealAbilityLevels = { q: number; w: number; e: number; r: number }

export const MAX_EZREAL_Q_LEVEL = 5
export const MAX_EZREAL_W_LEVEL = 5
export const MAX_EZREAL_E_LEVEL = 5
export const MAX_EZREAL_R_LEVEL = 3

export function createInitialEzrealAbilityLevels(): EzrealAbilityLevels {
  if (devFullAbilityKit()) return { q: 1, w: 1, e: 1, r: 1 }
  return { q: 0, w: 0, e: 0, r: 0 }
}

export function isEzrealAbilityUnlocked(level: number) {
  return level > 0
}

export function effectiveEzrealAbilityLevel(level: number) {
  return level <= 0 ? 0 : level
}

export function resolveEzrealQStats(level: number) {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(550, 850 - (level - 1) * 45),
    damage: 2.4 + level * 0.78,
    range: 520,
    speed: 920,
    hitRadius: 14,
    pierce: 1 + Math.floor(level / 3),
  }
}

export function resolveEzrealWStats(level: number) {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(900, 1300 - (level - 1) * 70),
    range: 480,
    speed: 640,
    hitRadius: 18,
    markBonusDamage: 0.35 + level * 0.08,
    markMs: 3500,
  }
}

export function resolveEzrealEStats(level: number) {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(1200, 1900 - (level - 1) * 100),
    damage: 1.8 + level * 0.55,
    blinkDistance: 160 + level * 18,
    /** Un solo misil guiado al enemigo más cercano al destino (cliente). */
    missileCount: 1,
    missileRange: 500,
    missileSpeed: 780,
    missileHitRadius: 12,
  }
}

export function resolveEzrealRStats(level: number) {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(8000, 12000 - (level - 1) * 1200),
    damage: 4.8 + level * 1.6,
    range: 880,
    width: 42 + level * 6,
    /** ~1.0s atravesando el rango máximo (antes 1400 ≈ 0.6s — demasiado abrupto). */
    speed: 780 + level * 40,
  }
}
