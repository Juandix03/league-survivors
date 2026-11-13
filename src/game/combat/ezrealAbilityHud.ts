import {
  effectiveEzrealAbilityLevel,
  isEzrealAbilityUnlocked,
  MAX_EZREAL_E_LEVEL,
  MAX_EZREAL_Q_LEVEL,
  MAX_EZREAL_R_LEVEL,
  MAX_EZREAL_W_LEVEL,
  resolveEzrealEStats,
  resolveEzrealQStats,
  resolveEzrealRStats,
  resolveEzrealWStats,
  type EzrealAbilityLevels,
} from './ezrealAbilityState'
import type { AbilityHudSlot, AbilitySlotState } from './jinxAbilityHud'

function slotState(
  level: number,
  combatClockMs: number,
  cdEnd: number,
  statsCooldownMs: number,
): { state: AbilitySlotState; total: number; remaining: number } {
  if (!isEzrealAbilityUnlocked(level)) {
    return { state: 'locked', total: 0, remaining: 0 }
  }
  const remaining = Math.max(0, cdEnd - combatClockMs)
  if (remaining > 0) {
    return { state: 'cooldown', total: statsCooldownMs, remaining }
  }
  return { state: 'ready', total: statsCooldownMs, remaining: 0 }
}

export function buildEzrealAbilityHud(
  abilities: EzrealAbilityLevels,
  combatClockMs: number,
  cooldownEnds: { q: number; w: number; e: number; r: number },
): AbilityHudSlot[] {
  const q = resolveEzrealQStats(effectiveEzrealAbilityLevel(abilities.q))
  const w = resolveEzrealWStats(effectiveEzrealAbilityLevel(abilities.w))
  const e = resolveEzrealEStats(effectiveEzrealAbilityLevel(abilities.e))
  const r = resolveEzrealRStats(effectiveEzrealAbilityLevel(abilities.r))

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
    unlockHint: level <= 0 ? 'Subí de nivel para desbloquear.' : undefined,
  })

  return [
    mk('q', '1', 'Mystic Shot', abilities.q, MAX_EZREAL_Q_LEVEL, slotState(abilities.q, combatClockMs, cooldownEnds.q, q?.cooldownMs ?? 0)),
    mk('w', '2', 'Essence Flux', abilities.w, MAX_EZREAL_W_LEVEL, slotState(abilities.w, combatClockMs, cooldownEnds.w, w?.cooldownMs ?? 0)),
    mk('e', '3', 'Arcane Shift', abilities.e, MAX_EZREAL_E_LEVEL, slotState(abilities.e, combatClockMs, cooldownEnds.e, e?.cooldownMs ?? 0)),
    mk('r', '4', 'Trueshot Barrage', abilities.r, MAX_EZREAL_R_LEVEL, slotState(abilities.r, combatClockMs, cooldownEnds.r, r?.cooldownMs ?? 0)),
  ]
}
