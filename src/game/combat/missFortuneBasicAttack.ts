import type { PlayerCombatStats } from '../playerStats'

export const MF_BASIC_ATTACK_LABEL = 'Love Tap'

export const MF_BASIC_ATTACK = {
  attackIntervalMultiplier: 0.92,
  speedMultiplier: 1.05,
  directDamageMultiplier: 1.0,
  lifetimeMs: 900,
  basicAttackRange: 440,
  hitRadius: 12,
} as const

export function resolveMissFortuneBasicAttackRange(stats: PlayerCombatStats) {
  return MF_BASIC_ATTACK.basicAttackRange * stats.attackRangeMultiplier
}

export function resolveMissFortuneAttackIntervalMs(stats: PlayerCombatStats) {
  return stats.attackIntervalMs * MF_BASIC_ATTACK.attackIntervalMultiplier
}

export function resolveMissFortuneProjectileSpeed(stats: PlayerCombatStats) {
  return stats.projectileSpeed * MF_BASIC_ATTACK.speedMultiplier
}

export function resolveMissFortuneDirectDamage(stats: PlayerCombatStats) {
  return stats.projectileDamage * MF_BASIC_ATTACK.directDamageMultiplier
}
