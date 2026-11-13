import type { PlayerCombatStats } from '../playerStats'
import { TEXTURE } from '../constants'
import { JINX_VFX } from '../vfx/jinxVfxConfig'

export type JinxWeaponId = 'powPow' | 'fishbones'

export type JinxWeaponProfile = {
  id: JinxWeaponId
  label: string
  textureKey: string
  muzzleFlashScale: number
  /** Multiplier on shared attackIntervalMs from upgrades. */
  attackIntervalMultiplier: number
  /** Multiplier on shared projectileSpeed from upgrades. */
  speedMultiplier: number
  /** Multiplier on shared projectileDamage for direct hit. */
  directDamageMultiplier: number
  splashDamageMultiplier: number
  lifetimeMs: number
  visualScale: number
  spreadRadians: number
  /** 0 = single-target impact only. */
  splashRadius: number
  /** Alcance máximo de auto-ataque (unidades mundo, antes de multiplicadores). */
  basicAttackRange: number
  /** Legacy field unused — impacts use dedicated VFX spawners in ArenaScene. */
  hitSparkKey: string
}

export const JINX_WEAPON_PROFILES: Record<JinxWeaponId, JinxWeaponProfile> = {
  powPow: {
    id: 'powPow',
    label: 'Pow-Pow',
    textureKey: TEXTURE.powPowBolt,
    muzzleFlashScale: 0.2,
    attackIntervalMultiplier: 1,
    speedMultiplier: 1,
    directDamageMultiplier: 1,
    splashDamageMultiplier: 0,
    lifetimeMs: 1350,
    visualScale: 1.05,
    spreadRadians: 0.12,
    splashRadius: 0,
    basicAttackRange: 300,
    hitSparkKey: JINX_VFX.qGunHit,
  },
  fishbones: {
    id: 'fishbones',
    label: 'Fishbones',
    textureKey: TEXTURE.fishbonesRocket,
    muzzleFlashScale: 0.24,
    attackIntervalMultiplier: 2.35,
    speedMultiplier: 0.52,
    directDamageMultiplier: 2.4,
    splashDamageMultiplier: 0.55,
    lifetimeMs: 3200,
    visualScale: 1.35,
    spreadRadians: 0.1,
    splashRadius: 78,
    basicAttackRange: 460,
    hitSparkKey: JINX_VFX.explosionFlat,
  },
}

/** Radio efectivo de selección/disparo básico (Q elige perfil, no duplica el bonus). */
export function resolveBasicAttackRange(
  stats: PlayerCombatStats,
  weapon: JinxWeaponId,
): number {
  return (
    JINX_WEAPON_PROFILES[weapon].basicAttackRange * stats.attackRangeMultiplier
  )
}

export function otherJinxWeapon(weapon: JinxWeaponId): JinxWeaponId {
  return weapon === 'powPow' ? 'fishbones' : 'powPow'
}

export function resolveAttackIntervalMs(
  stats: PlayerCombatStats,
  weapon: JinxWeaponId,
): number {
  return (
    stats.attackIntervalMs *
    JINX_WEAPON_PROFILES[weapon].attackIntervalMultiplier
  )
}

export function resolveProjectileSpeed(
  stats: PlayerCombatStats,
  weapon: JinxWeaponId,
): number {
  return stats.projectileSpeed * JINX_WEAPON_PROFILES[weapon].speedMultiplier
}

export function resolveDirectDamage(
  stats: PlayerCombatStats,
  weapon: JinxWeaponId,
): number {
  return stats.projectileDamage * JINX_WEAPON_PROFILES[weapon].directDamageMultiplier
}

export function resolveSplashDamage(
  stats: PlayerCombatStats,
  weapon: JinxWeaponId,
): number {
  return (
    stats.projectileDamage * JINX_WEAPON_PROFILES[weapon].splashDamageMultiplier
  )
}
