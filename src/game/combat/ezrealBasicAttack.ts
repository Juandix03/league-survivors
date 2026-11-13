import type { PlayerCombatStats } from '../playerStats'

export const EZREAL_BASIC_ATTACK_LABEL = 'Essence Flare'

export const EZREAL_BASIC_ATTACK = {
  attackIntervalMultiplier: 0.88,
  speedMultiplier: 1.08,
  directDamageMultiplier: 1.05,
  basicAttackRange: 450,
  hitRadius: 11,
} as const

export function resolveEzrealBasicAttackRange(stats: PlayerCombatStats) {
  return EZREAL_BASIC_ATTACK.basicAttackRange * stats.attackRangeMultiplier
}

export function resolveEzrealAttackIntervalMs(stats: PlayerCombatStats) {
  return stats.attackIntervalMs * EZREAL_BASIC_ATTACK.attackIntervalMultiplier
}

export function resolveEzrealProjectileSpeed(stats: PlayerCombatStats) {
  return stats.projectileSpeed * EZREAL_BASIC_ATTACK.speedMultiplier
}

export function resolveEzrealDirectDamage(stats: PlayerCombatStats) {
  return stats.projectileDamage * EZREAL_BASIC_ATTACK.directDamageMultiplier
}
