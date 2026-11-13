import { devFullAbilityKit } from './abilityLoadoutDev'

export type AhriAbilityLevels = {
  q: number
  w: number
  e: number
  r: number
}

export const MAX_Q_LEVEL = 5
export const MAX_AHRI_W_LEVEL = 5
export const MAX_AHRI_E_LEVEL = 5
export const MAX_AHRI_R_LEVEL = 4

export function createInitialAhriAbilityLevels(): AhriAbilityLevels {
  if (devFullAbilityKit()) return { q: 1, w: 1, e: 1, r: 1 }
  return { q: 0, w: 0, e: 0, r: 0 }
}

export type QAbilityStats = {
  cooldownMs: number
  damage: number
  speed: number
  outboundMs: number
  returnSpeed: number
  hitRadius: number
}

export function resolveQStats(level: number): QAbilityStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(900, 2200 - (level - 1) * 220),
    damage: 2.4 + level * 0.75,
    speed: 520 + level * 40,
    outboundMs: 420 + level * 35,
    returnSpeed: 580 + level * 45,
    hitRadius: 14 + level,
  }
}

export type WAbilityStats = {
  cooldownMs: number
  spiritCount: number
  damage: number
  speed: number
  lifetimeMs: number
  hitRadius: number
}

export function resolveWStats(level: number): WAbilityStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(700, 1400 - (level - 1) * 90),
    spiritCount: 2 + level,
    damage: 2.8 + level * 0.85,
    speed: 460 + level * 25,
    lifetimeMs: 1400,
    hitRadius: 18,
  }
}

export type EAbilityStats = {
  cooldownMs: number
  damage: number
  speed: number
  lifetimeMs: number
  hitRadius: number
  charmDurationMs: number
  slowMultiplier: number
}

export function resolveEStats(level: number): EAbilityStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(800, 1600 - (level - 1) * 110),
    damage: 1.8 + level * 0.55,
    speed: 540 + level * 30,
    lifetimeMs: 950,
    hitRadius: 16 + level,
    charmDurationMs: 1000 + level * 250,
    slowMultiplier: 0.32,
  }
}

export type RAbilityStats = {
  cooldownMs: number
  dashCount: number
  damage: number
  dashDistance: number
  dashDurationMs: number
  hitRadius: number
}

export function resolveRStats(level: number): RAbilityStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(3200, 5200 - (level - 1) * 350),
    dashCount: 2 + level,
    damage: 3.2 + level * 0.9,
    dashDistance: 165 + level * 22,
    dashDurationMs: 280,
    hitRadius: 36,
  }
}
