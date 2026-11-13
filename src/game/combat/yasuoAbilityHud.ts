import {
  effectiveYasuoAbilityLevel,
  isYasuoAbilityUnlocked,
  MAX_YASUO_E_LEVEL,
  MAX_YASUO_Q_LEVEL,
  MAX_YASUO_R_LEVEL,
  MAX_YASUO_W_LEVEL,
  resolveYasuoEStats,
  resolveYasuoQStats,
  resolveYasuoRStats,
  resolveYasuoWStats,
  type YasuoAbilityLevels,
} from './yasuoAbilityState'
import type { AbilityHudSlot, AbilitySlotState } from './jinxAbilityHud'

function slotState(
  level: number,
  combatClockMs: number,
  cdEnd: number,
  statsCooldownMs: number,
): { state: AbilitySlotState; total: number; remaining: number } {
  if (!isYasuoAbilityUnlocked(level)) {
    return { state: 'locked', total: 0, remaining: 0 }
  }
  const remaining = Math.max(0, cdEnd - combatClockMs)
  if (remaining > 0) {
    return { state: 'cooldown', total: statsCooldownMs, remaining }
  }
  return { state: 'ready', total: statsCooldownMs, remaining: 0 }
}

export function buildYasuoAbilityHud(
  abilities: YasuoAbilityLevels,
  combatClockMs: number,
  cooldownEnds: { q: number; w: number; e: number; r: number },
): AbilityHudSlot[] {
  const qStats = resolveYasuoQStats(effectiveYasuoAbilityLevel(abilities.q))
  const wStats = resolveYasuoWStats(effectiveYasuoAbilityLevel(abilities.w))
  const eStats = resolveYasuoEStats(effectiveYasuoAbilityLevel(abilities.e))
  const rStats = resolveYasuoRStats(effectiveYasuoAbilityLevel(abilities.r))

  const mk = (
    id: 'q' | 'w' | 'e' | 'r',
    hotkey: AbilityHudSlot['hotkey'],
    label: string,
    level: number,
    maxLevel: number,
    slot: ReturnType<typeof slotState>,
  ): AbilityHudSlot => ({
    id,
    hotkey,
    label,
    level,
    maxLevel,
    state: slot.state,
    cooldownRemainingMs: slot.remaining,
    cooldownTotalMs: slot.total,
    unlockHint:
      level <= 0 ? 'Desbloqueo: subir de nivel (fase meta).' : undefined,
  })

  return [
    mk(
      'q',
      '1',
      'Espadazo (Q)',
      abilities.q,
      MAX_YASUO_Q_LEVEL,
      slotState(abilities.q, combatClockMs, cooldownEnds.q, qStats?.cooldownMs ?? 0),
    ),
    mk(
      'w',
      '2',
      'Muro de viento',
      abilities.w,
      MAX_YASUO_W_LEVEL,
      slotState(abilities.w, combatClockMs, cooldownEnds.w, wStats?.cooldownMs ?? 0),
    ),
    mk(
      'e',
      '3',
      'Hoja de la tempestad',
      abilities.e,
      MAX_YASUO_E_LEVEL,
      slotState(abilities.e, combatClockMs, cooldownEnds.e, eStats?.cooldownMs ?? 0),
    ),
    mk(
      'r',
      '4',
      'Último aliento',
      abilities.r,
      MAX_YASUO_R_LEVEL,
      slotState(abilities.r, combatClockMs, cooldownEnds.r, rStats?.cooldownMs ?? 0),
    ),
  ]
}
