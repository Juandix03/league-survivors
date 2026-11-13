import {
  effectiveLuxAbilityLevel,
  isLuxAbilityUnlocked,
  MAX_LUX_E_LEVEL,
  MAX_LUX_Q_LEVEL,
  MAX_LUX_R_LEVEL,
  MAX_LUX_W_LEVEL,
  resolveLuxEStats,
  resolveLuxQStats,
  resolveLuxRStats,
  resolveLuxWStats,
  type LuxAbilityLevels,
} from './luxAbilityState'
import type { AbilityHudSlot, AbilitySlotState } from './jinxAbilityHud'

function slotState(
  level: number,
  combatClockMs: number,
  cdEnd: number,
  statsCooldownMs: number,
): { state: AbilitySlotState; total: number; remaining: number } {
  if (!isLuxAbilityUnlocked(level)) {
    return { state: 'locked', total: 0, remaining: 0 }
  }
  const remaining = Math.max(0, cdEnd - combatClockMs)
  if (remaining > 0) {
    return { state: 'cooldown', total: statsCooldownMs, remaining }
  }
  return { state: 'ready', total: statsCooldownMs, remaining: 0 }
}

export function buildLuxAbilityHud(
  abilities: LuxAbilityLevels,
  combatClockMs: number,
  cooldownEnds: { q: number; w: number; e: number; r: number },
  eDetonateReady = false,
): AbilityHudSlot[] {
  const qStats = resolveLuxQStats(effectiveLuxAbilityLevel(abilities.q))
  const wStats = resolveLuxWStats(effectiveLuxAbilityLevel(abilities.w))
  const eStats = resolveLuxEStats(effectiveLuxAbilityLevel(abilities.e))
  const rStats = resolveLuxRStats(effectiveLuxAbilityLevel(abilities.r))

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
  })

  return [
    mk(
      'q',
      '1',
      'Luz encadenada',
      abilities.q,
      MAX_LUX_Q_LEVEL,
      slotState(abilities.q, combatClockMs, cooldownEnds.q, qStats?.cooldownMs ?? 0),
    ),
    mk(
      'w',
      '2',
      'Barrera prismática',
      abilities.w,
      MAX_LUX_W_LEVEL,
      slotState(abilities.w, combatClockMs, cooldownEnds.w, wStats?.cooldownMs ?? 0),
    ),
    mk(
      'e',
      '3',
      'Singularidad',
      abilities.e,
      MAX_LUX_E_LEVEL,
      (() => {
        const base = slotState(
          abilities.e,
          combatClockMs,
          cooldownEnds.e,
          eStats?.cooldownMs ?? 0,
        )
        if (eDetonateReady && base.state !== 'locked') {
          return { ...base, state: 'ready' as const, remaining: 0 }
        }
        return base
      })(),
    ),
    mk(
      'r',
      '4',
      'Chispa final',
      abilities.r,
      MAX_LUX_R_LEVEL,
      slotState(abilities.r, combatClockMs, cooldownEnds.r, rStats?.cooldownMs ?? 0),
    ),
  ]
}
