import type { PlayerCombatStats } from '../playerStats'
import { TEXTURE } from '../constants'

export const AHRI_BASIC_ATTACK_LABEL = 'Bola espiritual'

export const AHRI_BASIC_ATTACK = {
  textureKey: TEXTURE.ahriSpiritBolt,
  muzzleFlashScale: 0.06,
  attackIntervalMultiplier: 1.05,
  speedMultiplier: 0.92,
  directDamageMultiplier: 1.05,
  lifetimeMs: 1400,
  visualScale: 1,
  spreadRadians: 0.1,
  basicAttackRange: 400,
} as const

export function resolveAhriBasicAttackRange(stats: PlayerCombatStats): number {
  return AHRI_BASIC_ATTACK.basicAttackRange * stats.attackRangeMultiplier
}

export function resolveAhriAttackIntervalMs(stats: PlayerCombatStats): number {
  return stats.attackIntervalMs * AHRI_BASIC_ATTACK.attackIntervalMultiplier
}

export function resolveAhriProjectileSpeed(stats: PlayerCombatStats): number {
  return stats.projectileSpeed * AHRI_BASIC_ATTACK.speedMultiplier
}

export function resolveAhriDirectDamage(stats: PlayerCombatStats): number {
  return stats.projectileDamage * AHRI_BASIC_ATTACK.directDamageMultiplier
}
