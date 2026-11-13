import type { ChampionId } from '../champions/types'
import { AHRI_BASIC_ATTACK_LABEL } from './ahriBasicAttack'
import { JINX_WEAPON_PROFILES, type JinxWeaponId } from './jinxWeapons'
import { LEESIN_BASIC_ATTACK_LABEL } from './leeSinBasicAttack'
import { MF_BASIC_ATTACK_LABEL } from './missFortuneBasicAttack'
import { EZREAL_BASIC_ATTACK_LABEL } from './ezrealBasicAttack'
import { LUX_BASIC_ATTACK_LABEL } from './luxBasicAttack'
import { YASUO_BASIC_ATTACK_LABEL } from './yasuoBasicAttack'

export function resolveChampionDisplayName(id: ChampionId): string {
  if (id === 'ahri') return 'Ahri'
  if (id === 'yasuo') return 'Yasuo'
  if (id === 'lux') return 'Lux'
  if (id === 'leesin') return 'Lee Sin'
  if (id === 'missfortune') return 'Miss Fortune'
  if (id === 'ezreal') return 'Ezreal'
  return 'Jinx'
}

export function resolveActiveWeaponHudLabel(
  championId: ChampionId,
  jinxWeapon: JinxWeaponId,
): string {
  if (championId === 'ahri') {
    return AHRI_BASIC_ATTACK_LABEL
  }
  if (championId === 'yasuo') {
    return YASUO_BASIC_ATTACK_LABEL
  }
  if (championId === 'lux') {
    return LUX_BASIC_ATTACK_LABEL
  }
  if (championId === 'leesin') {
    return LEESIN_BASIC_ATTACK_LABEL
  }
  if (championId === 'missfortune') {
    return MF_BASIC_ATTACK_LABEL
  }
  if (championId === 'ezreal') {
    return EZREAL_BASIC_ATTACK_LABEL
  }
  return JINX_WEAPON_PROFILES[jinxWeapon].label
}
