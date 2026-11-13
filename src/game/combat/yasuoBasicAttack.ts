import type { PlayerCombatStats } from '../playerStats'

export const YASUO_BASIC_ATTACK_LABEL = 'Estocada de viento'

/** Autoataque melee — sin proyectil. */
export const YASUO_BASIC_ATTACK = {
  attackIntervalMultiplier: 1,
  directDamageMultiplier: 1,
  /** Enemigo debe estar dentro de este radio para iniciar el swing. */
  acquireRange: 72,
  /** Hitbox del corte (px). */
  slashRange: 48,
  slashWidth: 40,
  slashOrigin: 14,
  windupMs: 48,
  lungeMs: 0,
  recoverMs: 40,
  lungePx: 0,
} as const

export function resolveYasuoBasicAttackRange(stats: PlayerCombatStats): number {
  return YASUO_BASIC_ATTACK.acquireRange * stats.attackRangeMultiplier
}

export function resolveYasuoAttackIntervalMs(stats: PlayerCombatStats): number {
  return stats.attackIntervalMs * YASUO_BASIC_ATTACK.attackIntervalMultiplier
}

export function resolveYasuoDirectDamage(stats: PlayerCombatStats): number {
  return stats.projectileDamage * YASUO_BASIC_ATTACK.directDamageMultiplier
}
