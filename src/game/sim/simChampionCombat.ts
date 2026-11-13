import type { ChampionId } from '../champions/types'
import {
  resolveAhriAttackIntervalMs,
  resolveAhriBasicAttackRange,
  resolveAhriDirectDamage,
} from '../combat/ahriBasicAttack'
import {
  resolveLeeSinAttackIntervalMs,
  resolveLeeSinBasicAttackRange,
  resolveLeeSinDirectDamage,
} from '../combat/leeSinBasicAttack'
import {
  resolveLuxAttackIntervalMs,
  resolveLuxBasicAttackRange,
  resolveLuxDirectDamage,
} from '../combat/luxBasicAttack'
import {
  resolveMissFortuneAttackIntervalMs,
  resolveMissFortuneBasicAttackRange,
  resolveMissFortuneDirectDamage,
} from '../combat/missFortuneBasicAttack'
import {
  resolveEzrealAttackIntervalMs,
  resolveEzrealBasicAttackRange,
  resolveEzrealDirectDamage,
} from '../combat/ezrealBasicAttack'
import {
  resolveYasuoAttackIntervalMs,
  resolveYasuoBasicAttackRange,
  resolveYasuoDirectDamage,
} from '../combat/yasuoBasicAttack'
import {
  JINX_WEAPON_PROFILES,
  resolveAttackIntervalMs,
  resolveBasicAttackRange,
  resolveDirectDamage,
  resolveSplashDamage,
  type JinxWeaponId,
} from '../combat/jinxWeapons'
import type { PlayerCombatStats } from '../playerStats'

export type ChampionBasicSnapshot = {
  range: number
  intervalMs: number
  damage: number
  projectileCount: number
  /** Fishbones splash radius (0 = single target). */
  splashRadius: number
  splashDamage: number
}

export function resolveChampionBasicSnapshot(
  championId: ChampionId,
  stats: PlayerCombatStats,
  options: {
    jinxWeapon?: JinxWeaponId
    attackIntervalMult?: number
  } = {},
): ChampionBasicSnapshot {
  const jinxWeapon = options.jinxWeapon ?? 'powPow'
  const extraIntervalMult = options.attackIntervalMult ?? 1

  switch (championId) {
    case 'jinx':
      return {
        range: resolveBasicAttackRange(stats, jinxWeapon),
        intervalMs:
          resolveAttackIntervalMs(stats, jinxWeapon) * extraIntervalMult,
        damage: resolveDirectDamage(stats, jinxWeapon),
        projectileCount: stats.projectileCount,
        splashRadius:
          jinxWeapon === 'fishbones'
            ? JINX_WEAPON_PROFILES.fishbones.splashRadius
            : 0,
        splashDamage:
          jinxWeapon === 'fishbones' ? resolveSplashDamage(stats, 'fishbones') : 0,
      }
    case 'ahri':
      return {
        range: resolveAhriBasicAttackRange(stats),
        intervalMs: resolveAhriAttackIntervalMs(stats) * extraIntervalMult,
        damage: resolveAhriDirectDamage(stats),
        projectileCount: stats.projectileCount,
        splashRadius: 0,
        splashDamage: 0,
      }
    case 'lux':
      return {
        range: resolveLuxBasicAttackRange(stats),
        intervalMs: resolveLuxAttackIntervalMs(stats) * extraIntervalMult,
        damage: resolveLuxDirectDamage(stats),
        projectileCount: stats.projectileCount,
        splashRadius: 0,
        splashDamage: 0,
      }
    case 'leesin':
      return {
        range: resolveLeeSinBasicAttackRange(stats),
        intervalMs: resolveLeeSinAttackIntervalMs(stats) * extraIntervalMult,
        damage: resolveLeeSinDirectDamage(stats),
        projectileCount: stats.projectileCount,
        splashRadius: 0,
        splashDamage: 0,
      }
    case 'yasuo':
      return {
        range: resolveYasuoBasicAttackRange(stats),
        intervalMs: resolveYasuoAttackIntervalMs(stats) * extraIntervalMult,
        damage: resolveYasuoDirectDamage(stats),
        projectileCount: stats.projectileCount,
        splashRadius: 0,
        splashDamage: 0,
      }
    case 'missfortune':
      return {
        range: resolveMissFortuneBasicAttackRange(stats),
        intervalMs:
          resolveMissFortuneAttackIntervalMs(stats) * extraIntervalMult,
        damage: resolveMissFortuneDirectDamage(stats),
        projectileCount: stats.projectileCount,
        splashRadius: 0,
        splashDamage: 0,
      }
    case 'ezreal':
      return {
        range: resolveEzrealBasicAttackRange(stats),
        intervalMs: resolveEzrealAttackIntervalMs(stats) * extraIntervalMult,
        damage: resolveEzrealDirectDamage(stats),
        projectileCount: stats.projectileCount,
        splashRadius: 0,
        splashDamage: 0,
      }
    default:
      return {
        range: 400,
        intervalMs: stats.attackIntervalMs * extraIntervalMult,
        damage: stats.projectileDamage,
        projectileCount: stats.projectileCount,
        splashRadius: 0,
        splashDamage: 0,
      }
  }
}
