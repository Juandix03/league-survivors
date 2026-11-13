import { devFullAbilityKit } from './abilityLoadoutDev'

export type LeeSinAbilityLevels = { q: number; w: number; e: number; r: number }

export const MAX_LEESIN_Q_LEVEL = 5
export const MAX_LEESIN_W_LEVEL = 5
export const MAX_LEESIN_E_LEVEL = 5
export const MAX_LEESIN_R_LEVEL = 3

export function createInitialLeeSinAbilityLevels(): LeeSinAbilityLevels {
  if (devFullAbilityKit()) return { q: 1, w: 1, e: 1, r: 1 }
  return { q: 0, w: 0, e: 0, r: 0 }
}

export function isLeeSinAbilityUnlocked(level: number): boolean {
  return level > 0
}

export function effectiveLeeSinAbilityLevel(level: number): number {
  return level <= 0 ? 0 : level
}

export type LeeSinQStats = {
  cooldownMs: number
  damage: number
  range: number
  speed: number
  hitRadius: number
  markMs: number
  dashMs: number
}

export function resolveLeeSinQStats(level: number): LeeSinQStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(800, 1100 - (level - 1) * 50),
    damage: 2.4 + level * 0.75,
    range: 420 + level * 12,
    speed: 720 + level * 20,
    hitRadius: 18,
    markMs: 3000,
    dashMs: 280,
  }
}

export type LeeSinWStats = {
  cooldownMs: number
  shieldMs: number
  shieldAmount: number
  lifestealMs: number
}

export function resolveLeeSinWStats(level: number): LeeSinWStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(900, 1400 - (level - 1) * 80),
    shieldMs: 2200 + level * 200,
    shieldAmount: 0,
    lifestealMs: 4000,
  }
}

export type LeeSinEStats = {
  cooldownMs: number
  damage: number
  radius: number
  crippleWindowMs: number
  crippleDamage: number
  crippleSlowMult: number
  crippleSlowMs: number
}

export function resolveLeeSinEStats(level: number): LeeSinEStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: Math.max(700, 1000 - (level - 1) * 50),
    damage: 2.0 + level * 0.65,
    radius: 72 + level * 8,
    crippleWindowMs: 3500,
    crippleDamage: 1.35 + level * 0.45,
    crippleSlowMult: 0.62,
    crippleSlowMs: 2000,
  }
}

export type LeeSinRStats = {
  cooldownMs: number
  damage: number
  range: number
  knockback: number
}

export function resolveLeeSinRStats(level: number): LeeSinRStats | null {
  if (level <= 0) return null
  return {
    cooldownMs: 14000 - (level - 1) * 2000,
    damage: 4.5 + level * 1.2,
    range: 375,
    knockback: 280 + level * 20,
  }
}
