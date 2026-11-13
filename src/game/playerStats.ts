import { PLAYER_MAX_HEALTH, PLAYER_SPEED } from './constants'

export type PlayerCombatStats = {
  moveSpeed: number
  projectileDamage: number
  attackIntervalMs: number
  projectileSpeed: number
  projectileCount: number
  maxHealth: number
  /** Multiplicador de alcance de ataques básicos (Pow-Pow / Fishbones). */
  attackRangeMultiplier: number
}

export const BASE_PROJECTILE_DAMAGE = 1
export const BASE_ATTACK_INTERVAL_MS = 450
export const BASE_PROJECTILE_SPEED = 520
export const BASE_PROJECTILE_COUNT = 1
export const BASE_ATTACK_RANGE_MULTIPLIER = 1

export function createInitialCombatStats(): PlayerCombatStats {
  return {
    moveSpeed: PLAYER_SPEED,
    projectileDamage: BASE_PROJECTILE_DAMAGE,
    attackIntervalMs: BASE_ATTACK_INTERVAL_MS,
    projectileSpeed: BASE_PROJECTILE_SPEED,
    projectileCount: BASE_PROJECTILE_COUNT,
    maxHealth: PLAYER_MAX_HEALTH,
    attackRangeMultiplier: BASE_ATTACK_RANGE_MULTIPLIER,
  }
}
