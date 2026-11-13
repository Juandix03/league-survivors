import type { PlayerCombatStats } from '../playerStats'

export const LUX_BASIC_ATTACK_LABEL = 'Luz interior'

export const LUX_BASIC_ATTACK = {
  attackIntervalMultiplier: 1.08,
  speedMultiplier: 0.88,
  directDamageMultiplier: 0.92,
  lifetimeMs: 1200,
  basicAttackRange: 380,
  hitRadius: 16,
} as const

export function resolveLuxBasicAttackRange(stats: PlayerCombatStats): number {
  return LUX_BASIC_ATTACK.basicAttackRange * stats.attackRangeMultiplier
}

export function resolveLuxAttackIntervalMs(stats: PlayerCombatStats): number {
  return stats.attackIntervalMs * LUX_BASIC_ATTACK.attackIntervalMultiplier
}

export function resolveLuxProjectileSpeed(stats: PlayerCombatStats): number {
  return stats.projectileSpeed * LUX_BASIC_ATTACK.speedMultiplier
}

export function resolveLuxDirectDamage(stats: PlayerCombatStats): number {
  return stats.projectileDamage * LUX_BASIC_ATTACK.directDamageMultiplier
}
