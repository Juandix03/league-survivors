import {
  effectiveMissFortuneAbilityLevel,
  isMissFortuneAbilityUnlocked,
  MAX_MF_E,
  MAX_MF_Q,
  MAX_MF_R,
  MAX_MF_W,
  resolveMissFortuneEStats,
  resolveMissFortuneQStats,
  resolveMissFortuneRStats,
  resolveMissFortuneWStats,
  type MissFortuneAbilityLevels,
} from './missFortuneAbilityState'
import type { AbilityHudSlot, AbilitySlotState } from './jinxAbilityHud'

function slotState(
  level: number,
  combatClockMs: number,
  cdEnd: number,
  statsCooldownMs: number,
): { state: AbilitySlotState; total: number; remaining: number } {
  if (!isMissFortuneAbilityUnlocked(level)) {
    return { state: 'locked', total: 0, remaining: 0 }
  }
  const remaining = Math.max(0, cdEnd - combatClockMs)
  if (remaining > 0) {
    return { state: 'cooldown', total: statsCooldownMs, remaining }
  }
  return { state: 'ready', total: statsCooldownMs, remaining: 0 }
}

export function buildMissFortuneAbilityHud(
  abilities: MissFortuneAbilityLevels,
  combatClockMs: number,
  cooldownEnds: { q: number; w: number; e: number; r: number },
): AbilityHudSlot[] {
  const q = resolveMissFortuneQStats(effectiveMissFortuneAbilityLevel(abilities.q))
  const w = resolveMissFortuneWStats(effectiveMissFortuneAbilityLevel(abilities.w))
  const e = resolveMissFortuneEStats(effectiveMissFortuneAbilityLevel(abilities.e))
  const r = resolveMissFortuneRStats(effectiveMissFortuneAbilityLevel(abilities.r))

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
    unlockHint: level <= 0 ? 'Desbloqueo: subir de nivel (fase meta).' : undefined,
  })

  return [
    mk('q', '1', 'Double Up', abilities.q, MAX_MF_Q, slotState(abilities.q, combatClockMs, cooldownEnds.q, q?.cooldownMs ?? 0)),
    mk('w', '2', 'Strut', abilities.w, MAX_MF_W, slotState(abilities.w, combatClockMs, cooldownEnds.w, w?.cooldownMs ?? 0)),
    mk('e', '3', 'Make It Rain', abilities.e, MAX_MF_E, slotState(abilities.e, combatClockMs, cooldownEnds.e, e?.cooldownMs ?? 0)),
    mk('r', '4', 'Bullet Time', abilities.r, MAX_MF_R, slotState(abilities.r, combatClockMs, cooldownEnds.r, r?.cooldownMs ?? 0)),
  ]
}
