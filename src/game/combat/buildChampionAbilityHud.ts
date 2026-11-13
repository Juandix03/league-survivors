import type { ChampionId } from '../champions/types'
import { buildAhriAbilityHud } from './ahriAbilityHud'
import { buildAbilityHud } from './jinxAbilityHud'
import { buildLeeSinAbilityHud } from './leeSinAbilityHud'
import { buildMissFortuneAbilityHud } from './missFortuneAbilityHud'
import { buildLuxAbilityHud } from './luxAbilityHud'
import { buildYasuoAbilityHud } from './yasuoAbilityHud'
import type { AhriAbilityLevels } from './ahriAbilityState'
import type { JinxAbilityLevels } from './jinxAbilityState'
import type { LeeSinAbilityLevels } from './leeSinAbilityState'
import type { MissFortuneAbilityLevels } from './missFortuneAbilityState'
import type { LuxAbilityLevels } from './luxAbilityState'
import type { YasuoAbilityLevels } from './yasuoAbilityState'
import type { EzrealAbilityLevels } from './ezrealAbilityState'
import { buildEzrealAbilityHud } from './ezrealAbilityHud'
import type { JinxWeaponId } from './jinxWeapons'

export function buildChampionAbilityHud(
  championId: ChampionId,
  jinxAbilities: JinxAbilityLevels,
  ahriAbilities: AhriAbilityLevels,
  yasuoAbilities: YasuoAbilityLevels,
  luxAbilities: LuxAbilityLevels,
  leesinAbilities: LeeSinAbilityLevels,
  missFortuneAbilities: MissFortuneAbilityLevels,
  ezrealAbilities: EzrealAbilityLevels,
  combatClockMs: number,
  cooldownEnds: { q: number; w: number; e: number; r: number },
  luxEDetonateReady = false,
  leesinQRecastReady = false,
  leesinECrippleReady = false,
  activeJinxWeapon: JinxWeaponId = 'powPow',
) {
  if (championId === 'ahri') {
    return buildAhriAbilityHud(ahriAbilities, combatClockMs, cooldownEnds)
  }
  if (championId === 'yasuo') {
    return buildYasuoAbilityHud(yasuoAbilities, combatClockMs, cooldownEnds)
  }
  if (championId === 'lux') {
    return buildLuxAbilityHud(luxAbilities, combatClockMs, cooldownEnds, luxEDetonateReady)
  }
  if (championId === 'leesin') {
    return buildLeeSinAbilityHud(
      leesinAbilities,
      combatClockMs,
      cooldownEnds,
      leesinQRecastReady,
      leesinECrippleReady,
    )
  }
  if (championId === 'missfortune') {
    return buildMissFortuneAbilityHud(missFortuneAbilities, combatClockMs, cooldownEnds)
  }
  if (championId === 'ezreal') {
    return buildEzrealAbilityHud(ezrealAbilities, combatClockMs, cooldownEnds)
  }
  return buildAbilityHud(jinxAbilities, combatClockMs, cooldownEnds, activeJinxWeapon)
}
