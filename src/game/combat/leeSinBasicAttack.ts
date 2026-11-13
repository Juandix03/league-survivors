import type { PlayerCombatStats } from '../playerStats'

export const LEESIN_BASIC_ATTACK_LABEL = 'Puño de furia'

export const LEESIN_BASIC_ATTACK = {
  attackIntervalMultiplier: 0.92,
  directDamageMultiplier: 1.05,
  lifetimeMs: 180,
  basicAttackRange: 95,
  hitRadius: 22,
  lungePx: 28,
} as const

export function resolveLeeSinBasicAttackRange(stats: PlayerCombatStats): number {
  return LEESIN_BASIC_ATTACK.basicAttackRange * stats.attackRangeMultiplier
}

export function resolveLeeSinAttackIntervalMs(stats: PlayerCombatStats): number {
  return stats.attackIntervalMs * LEESIN_BASIC_ATTACK.attackIntervalMultiplier
}

export function resolveLeeSinDirectDamage(stats: PlayerCombatStats): number {
  return stats.projectileDamage * LEESIN_BASIC_ATTACK.directDamageMultiplier
}
