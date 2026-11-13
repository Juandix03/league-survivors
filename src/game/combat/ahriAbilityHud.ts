import {
  MAX_AHRI_E_LEVEL,
  MAX_AHRI_R_LEVEL,
  MAX_AHRI_W_LEVEL,
  MAX_Q_LEVEL,
  resolveEStats,
  resolveQStats,
  resolveRStats,
  resolveWStats,
  type AhriAbilityLevels,
} from './ahriAbilityState'
import { effectiveAhriAbilityLevel } from './ahriAbilityCast'
import type { AbilityHudSlot, AbilitySlotState } from './jinxAbilityHud'

const UNLOCK_HINTS: Record<'q' | 'w' | 'e' | 'r', string> = {
  q: 'Desbloqueo: Orbe del engaño al subir de nivel (niv. 2+).',
  w: 'Desbloqueo: Fuego zorruno al subir de nivel.',
  e: 'Desbloqueo: Hechizar al subir de nivel.',
  r: 'Desbloqueo: Impulso espiritual al subir de nivel.',
}

function slotState(
  level: number,
  combatClockMs: number,
  cdEnd: number,
  statsCooldownMs: number,
): { state: AbilitySlotState; total: number; remaining: number } {
  const effective = effectiveAhriAbilityLevel(level)
  if (effective <= 0) {
    return { state: 'locked', total: 0, remaining: 0 }
  }
  const remaining = Math.max(0, cdEnd - combatClockMs)
  if (remaining > 0) {
    return { state: 'cooldown', total: statsCooldownMs, remaining }
  }
  return { state: 'ready', total: statsCooldownMs, remaining: 0 }
}

export function buildAhriAbilityHud(
  abilities: AhriAbilityLevels,
  combatClockMs: number,
  cooldownEnds: { q: number; w: number; e: number; r: number },
): AbilityHudSlot[] {
  const qLevel = abilities.q
  const qStats = resolveQStats(effectiveAhriAbilityLevel(qLevel))
  const qCd = qStats?.cooldownMs ?? 0
  const qSlot = slotState(qLevel, combatClockMs, cooldownEnds.q, qCd)

  const wStats = resolveWStats(effectiveAhriAbilityLevel(abilities.w))
  const eStats = resolveEStats(effectiveAhriAbilityLevel(abilities.e))
  const rStats = resolveRStats(effectiveAhriAbilityLevel(abilities.r))
  const wSlot = slotState(
    abilities.w,
    combatClockMs,
    cooldownEnds.w,
    wStats?.cooldownMs ?? 0,
  )
  const eSlot = slotState(
    abilities.e,
    combatClockMs,
    cooldownEnds.e,
    eStats?.cooldownMs ?? 0,
  )
  const rSlot = slotState(
    abilities.r,
    combatClockMs,
    cooldownEnds.r,
    rStats?.cooldownMs ?? 0,
  )

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
    cooldownTotalMs: slot.total,
    cooldownRemainingMs: slot.remaining,
    unlockHint: slot.state === 'locked' ? UNLOCK_HINTS[id] : undefined,
  })

  return [
    mk('q', '1', 'Orbe del engaño', qLevel, MAX_Q_LEVEL, qSlot),
    mk('w', '2', 'Fuego zorruno', abilities.w, MAX_AHRI_W_LEVEL, wSlot),
    mk('e', '3', 'Hechizar', abilities.e, MAX_AHRI_E_LEVEL, eSlot),
    mk('r', '4', 'Impulso espiritual', abilities.r, MAX_AHRI_R_LEVEL, rSlot),
  ]
}
