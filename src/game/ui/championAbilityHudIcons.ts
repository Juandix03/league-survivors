import type { ChampionId } from '../champions/types'
import { AHRI_HUD_ICONS } from '../vfx/ahriVfxConfig'
import { JINX_HUD_ICONS } from '../vfx/jinxSpellVfxConfig'
import type { JinxWeaponId } from '../combat/jinxWeapons'
import {
  LEESIN_HUD_ICONS,
  LEESIN_HUD_ICONS_Q2,
} from '../vfx/leesin/leeSinAuthenticSpellVfx'
import { LUX_HUD_ICONS } from '../vfx/lux/luxAuthenticSpellVfx'
import { MF_HUD_ICONS } from '../vfx/missfortune/missFortuneAuthenticSpellVfx'
import { EZREAL_HUD_ICONS } from '../vfx/ezreal/ezrealAuthenticSpellVfx'
import { YASUO_HUD_ICONS } from '../vfx/yasuo/yasuoAuthenticSpellVfx'

export type AbilityHudIconSlot = 'q' | 'w' | 'e' | 'r'

const JINX_HUD_FLAT: Record<AbilityHudIconSlot, string> = {
  q: JINX_HUD_ICONS.qFishbones,
  w: JINX_HUD_ICONS.w,
  e: JINX_HUD_ICONS.e,
  r: JINX_HUD_ICONS.r,
}

const HUD_BY_CHAMPION: Record<ChampionId, Record<AbilityHudIconSlot, string>> = {
  jinx: JINX_HUD_FLAT,
  ahri: AHRI_HUD_ICONS,
  yasuo: YASUO_HUD_ICONS,
  lux: LUX_HUD_ICONS,
  missfortune: MF_HUD_ICONS,
  leesin: LEESIN_HUD_ICONS,
  ezreal: EZREAL_HUD_ICONS,
}

/** Mismas URLs que usa la barra de habilidades en partida. */
export function resolveChampionAbilityHudIcon(
  championId: ChampionId,
  slot: AbilityHudIconSlot,
  slotLabel?: string,
  /** Jinx Q: icono de la arma a la que cambiás (no la equipada). */
  jinxQIconWeapon?: JinxWeaponId,
): string {
  if (championId === 'jinx' && slot === 'q' && jinxQIconWeapon) {
    return jinxQIconWeapon === 'fishbones'
      ? JINX_HUD_ICONS.qFishbones
      : JINX_HUD_ICONS.qPowPow
  }
  if (championId === 'leesin' && slotLabel === 'Resonating Strike') {
    return LEESIN_HUD_ICONS_Q2.q
  }
  if (championId === 'leesin' && slotLabel === 'Cripple') {
    return LEESIN_HUD_ICONS_Q2.e
  }
  return HUD_BY_CHAMPION[championId][slot]
}
