import { devFullAbilityKit } from './abilityLoadoutDev'

export type MissFortuneAbilityLevels = { q: number; w: number; e: number; r: number }

export const MAX_MF_Q = 5
export const MAX_MF_W = 5
export const MAX_MF_E = 5
export const MAX_MF_R = 3

export function createInitialMissFortuneAbilityLevels(): MissFortuneAbilityLevels {
  if (devFullAbilityKit()) return { q: 1, w: 1, e: 1, r: 1 }
  return { q: 0, w: 0, e: 0, r: 0 }
}

export function isMissFortuneAbilityUnlocked(level: number) {
  return level > 0
}

export function effectiveMissFortuneAbilityLevel(level: number) {
  return level <= 0 ? 0 : level
}

/** Shorter CDs in dev so Q/W/E/R can be exercised quickly. */
function devTestCooldownMs(productionMs: number, devMs: number) {
  return import.meta.env?.DEV ? devMs : productionMs
}

export function resolveMissFortuneQStats(level: number) {
  if (level <= 0) return null
  return {
    cooldownMs: devTestCooldownMs(Math.max(700, 900 - (level - 1) * 40), 600),
    damage: 2.2 + level * 0.7,
    range: 520,
    speed: 820,
    hitRadius: 14,
    bounceRange: 420,
  }
}

export function resolveMissFortuneWStats(level: number) {
  if (level <= 0) return null
  return {
    cooldownMs: devTestCooldownMs(12000 - (level - 1) * 800, 1500),
    durationMs: 3000 + level * 200,
    moveMult: 1.12 + level * 0.02,
    attackSpeedMult: 0.82,
  }
}

export function resolveMissFortuneEStats(level: number) {
  if (level <= 0) return null
  return {
    cooldownMs: devTestCooldownMs(Math.max(800, 1200 - (level - 1) * 60), 800),
    damage: 1.8 + level * 0.55,
    radius: 80 + level * 10,
    durationMs: 2000 + level * 150,
    range: 480,
  }
}

export function resolveMissFortuneRStats(level: number) {
  if (level <= 0) return null
  return {
    cooldownMs: devTestCooldownMs(90000 - (level - 1) * 15000, 4000),
    damagePerWave: 1.1 + level * 0.35,
    waves: 12 + level * 2,
    waveIntervalMs: 180,
    coneRange: 520,
    coneHalfAngle: 0.42,
    channelMs: 2400,
  }
}
