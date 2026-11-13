import { devFullAbilityKit } from './abilityLoadoutDev'

export type JinxAbilityLevels = {
  /** Q — cambio Pow-Pow / Fishbones (tecla 1). */
  q: number
  w: number
  e: number
  r: number
}

export const MAX_Q_LEVEL = 5

/** Switcheroo — CD base LoL (0.9 s); baja levemente por nivel de Q. */
export const JINX_Q_SWAP_COOLDOWN_MS = 900

export function resolveJinxQSwapCooldownMs(qLevel: number): number {
  if (qLevel <= 0) return 0
  return Math.max(650, JINX_Q_SWAP_COOLDOWN_MS - (qLevel - 1) * 40)
}
export const MAX_W_LEVEL = 5
export const MAX_E_LEVEL = 5
export const MAX_R_LEVEL = 4

export function createInitialJinxAbilityLevels(): JinxAbilityLevels {
  if (devFullAbilityKit()) return { q: 1, w: 1, e: 1, r: 1 }
  return { q: 0, w: 0, e: 0, r: 0 }
}

export type WAbilityStats = {
  cooldownMs: number
  damage: number
  speed: number
  lifetimeMs: number
  pierce: number
}

export type EAbilityStats = {
  cooldownMs: number
  trapLifetimeMs: number
  trapDamage: number
  maxTraps: number
  slowMultiplier: number
  slowDurationMs: number
  triggerRadius: number
}

export type RAbilityStats = {
  cooldownMs: number
  directDamage: number
  splashDamage: number
  splashRadius: number
  speed: number
  maxTravelMs: number
}

export function resolveWStats(level: number): WAbilityStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(850, 2300 - (level - 1) * 240),
    damage: 2.1 + level * 0.7,
    speed: 560 + level * 50,
    lifetimeMs: 650 + level * 100,
    pierce: 2 + Math.floor(level / 2),
  }
}

export function resolveEStats(level: number): EAbilityStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(2200, 4800 - (level - 1) * 380),
    trapLifetimeMs: 3200 + level * 450,
    trapDamage: 2.8 + level * 0.85,
    maxTraps: 2 + level,
    slowMultiplier: 0.32,
    slowDurationMs: 850 + level * 110,
    triggerRadius: 24 + level * 2,
  }
}

export function resolveRStats(level: number): RAbilityStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(9000, 17000 - (level - 1) * 1800),
    directDamage: 7 + level * 2.8,
    splashDamage: 4 + level * 1.6,
    splashRadius: 88 + level * 14,
    speed: 400 + level * 25,
    maxTravelMs: 4200 + level * 350,
  }
}

/** Mejoras de Q = radio/daño en área de Fishbones. */
export function resolveFishbonesBlastMods(qLevel: number) {
  const level = Math.max(0, Math.min(qLevel, MAX_Q_LEVEL))
  return {
    radiusMult: 1 + level * 0.12,
    damageMult: 1 + level * 0.1,
  }
}
