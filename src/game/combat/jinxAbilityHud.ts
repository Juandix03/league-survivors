import {
  MAX_E_LEVEL,
  MAX_Q_LEVEL,
  MAX_R_LEVEL,
  MAX_W_LEVEL,
  resolveEStats,
  resolveJinxQSwapCooldownMs,
  resolveRStats,
  resolveWStats,
  type JinxAbilityLevels,
} from './jinxAbilityState'
import { effectiveJinxAbilityLevel, isJinxAbilityUnlocked } from './jinxAbilityCast'
import { JINX_WEAPON_PROFILES, otherJinxWeapon, type JinxWeaponId } from './jinxWeapons'

export type AbilitySlotState = 'locked' | 'ready' | 'cooldown'

const UNLOCK_HINTS: Record<'q' | 'w' | 'e' | 'r', string> = {
  q: 'Desbloqueo: elige ¡Cambia el fusil! al subir de nivel (niv. 2+).',
  w: 'Desbloqueo: elige la mejora ¡Chispas! al subir de nivel (niv. 2+).',
  e: 'Desbloqueo: elige ¡Mascafuegos! al subir de nivel (niv. 3+).',
  r: 'Desbloqueo: Supermegacohete (niv. 7+, con Q/W/E core).',
}

export type AbilityHudSlot = {
  id: 'q' | 'w' | 'e' | 'r'
  hotkey: 'Q' | '1' | '2' | '3' | '4'
  label: string
  level: number
  maxLevel: number
  state: AbilitySlotState
  cooldownTotalMs: number
  cooldownRemainingMs: number
  /** Solo cuando state === locked — cómo obtener la habilidad. */
  unlockHint?: string
  /** Jinx Q: arma que llevás ahora (borde / estado). */
  jinxWeaponEquipped?: JinxWeaponId
  /** Jinx Q: icono = arma a la que cambiás (como en el cliente). */
  jinxQSwapIconWeapon?: JinxWeaponId
}

export function buildAbilityHud(
  abilities: JinxAbilityLevels,
  combatClockMs: number,
  cooldownEnds: { q: number; w: number; e: number; r: number },
  activeJinxWeapon: JinxWeaponId = 'powPow',
): AbilityHudSlot[] {
  const slots: AbilityHudSlot[] = [
    {
      id: 'q',
      hotkey: '1',
      label: '¡Cambia el fusil!',
      level: abilities.q,
      maxLevel: MAX_Q_LEVEL,
      state: 'locked',
      cooldownTotalMs: 0,
      cooldownRemainingMs: 0,
    },
    {
      id: 'w',
      hotkey: '2',
      label: '¡Chispas!',
      level: abilities.w,
      maxLevel: MAX_W_LEVEL,
      state: 'locked',
      cooldownTotalMs: 0,
      cooldownRemainingMs: 0,
    },
    {
      id: 'e',
      hotkey: '3',
      label: '¡Mascafuegos!',
      level: abilities.e,
      maxLevel: MAX_E_LEVEL,
      state: 'locked',
      cooldownTotalMs: 0,
      cooldownRemainingMs: 0,
    },
    {
      id: 'r',
      hotkey: '4',
      label: 'Supermegacohete',
      level: abilities.r,
      maxLevel: MAX_R_LEVEL,
      state: 'locked',
      cooldownTotalMs: 0,
      cooldownRemainingMs: 0,
    },
  ]

  for (const slot of slots) {
    const rawLevel =
      slot.id === 'q'
        ? abilities.q
        : slot.id === 'w'
          ? abilities.w
          : slot.id === 'e'
            ? abilities.e
            : abilities.r

    const castLevel = effectiveJinxAbilityLevel(rawLevel)
    if (slot.id === 'q') {
      const swapTo = otherJinxWeapon(activeJinxWeapon)
      slot.jinxWeaponEquipped = activeJinxWeapon
      slot.jinxQSwapIconWeapon = swapTo
      if (!isJinxAbilityUnlocked(rawLevel)) {
        slot.label = JINX_WEAPON_PROFILES[swapTo].label
      }
    }
    if (!isJinxAbilityUnlocked(rawLevel)) {
      slot.state = 'locked'
      slot.unlockHint = UNLOCK_HINTS[slot.id]
      continue
    }
    slot.unlockHint = undefined

    if (slot.id === 'q') {
      const swapTo = otherJinxWeapon(activeJinxWeapon)
      slot.jinxWeaponEquipped = activeJinxWeapon
      slot.jinxQSwapIconWeapon = swapTo
      slot.label = JINX_WEAPON_PROFILES[swapTo].label
      const swapCd = resolveJinxQSwapCooldownMs(castLevel)
      slot.cooldownTotalMs = swapCd
      const remaining = Math.max(0, cooldownEnds.q - combatClockMs)
      slot.cooldownRemainingMs = remaining
      slot.state = remaining > 0 ? 'cooldown' : 'ready'
      continue
    }

    const cd =
      slot.id === 'w'
        ? resolveWStats(castLevel)!.cooldownMs
        : slot.id === 'e'
          ? resolveEStats(castLevel)!.cooldownMs
          : resolveRStats(castLevel)!.cooldownMs
    slot.cooldownTotalMs = cd
    const end = cooldownEnds[slot.id]
    const remaining = Math.max(0, end - combatClockMs)
    slot.cooldownRemainingMs = remaining
    slot.state = remaining > 0 ? 'cooldown' : 'ready'
  }

  return slots
}
