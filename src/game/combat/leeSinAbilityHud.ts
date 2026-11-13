import {
  effectiveLeeSinAbilityLevel,
  isLeeSinAbilityUnlocked,
  MAX_LEESIN_E_LEVEL,
  MAX_LEESIN_Q_LEVEL,
  MAX_LEESIN_R_LEVEL,
  MAX_LEESIN_W_LEVEL,
  resolveLeeSinEStats,
  resolveLeeSinQStats,
  resolveLeeSinRStats,
  resolveLeeSinWStats,
  type LeeSinAbilityLevels,
} from './leeSinAbilityState'
import type { AbilityHudSlot, AbilitySlotState } from './jinxAbilityHud'

function slotState(
  level: number,
  combatClockMs: number,
  cdEnd: number,
  statsCooldownMs: number,
  forceReady = false,
): { state: AbilitySlotState; total: number; remaining: number } {
  if (!isLeeSinAbilityUnlocked(level)) {
    return { state: 'locked', total: 0, remaining: 0 }
  }
  if (forceReady) {
    return { state: 'ready', total: statsCooldownMs, remaining: 0 }
  }
  const remaining = Math.max(0, cdEnd - combatClockMs)
  if (remaining > 0) {
    return { state: 'cooldown', total: statsCooldownMs, remaining }
  }
  return { state: 'ready', total: statsCooldownMs, remaining: 0 }
}

export function buildLeeSinAbilityHud(
  abilities: LeeSinAbilityLevels,
  combatClockMs: number,
  cooldownEnds: { q: number; w: number; e: number; r: number },
  qRecastReady: boolean,
  eCrippleReady = false,
): AbilityHudSlot[] {
  const qStats = resolveLeeSinQStats(effectiveLeeSinAbilityLevel(abilities.q))
  const wStats = resolveLeeSinWStats(effectiveLeeSinAbilityLevel(abilities.w))
  const eStats = resolveLeeSinEStats(effectiveLeeSinAbilityLevel(abilities.e))
  const rStats = resolveLeeSinRStats(effectiveLeeSinAbilityLevel(abilities.r))

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
      qRecastReady ? 'Resonating Strike' : 'Sonic Wave',
      abilities.q,
      MAX_LEESIN_Q_LEVEL,
      slotState(abilities.q, combatClockMs, cooldownEnds.q, qStats?.cooldownMs ?? 0, qRecastReady),
    ),
    mk(
      'w',
      '2',
      'Safeguard',
      abilities.w,
      MAX_LEESIN_W_LEVEL,
      slotState(abilities.w, combatClockMs, cooldownEnds.w, wStats?.cooldownMs ?? 0),
    ),
    mk(
      'e',
      '3',
      eCrippleReady ? 'Cripple' : 'Tempest',
      abilities.e,
      MAX_LEESIN_E_LEVEL,
      (() => {
        const base = slotState(abilities.e, combatClockMs, cooldownEnds.e, eStats?.cooldownMs ?? 0)
        if (eCrippleReady && base.state !== 'locked') {
          return { ...base, state: 'ready' as const, remaining: 0 }
        }
        return base
      })(),
    ),
    mk(
      'r',
      '4',
      "Dragon's Rage",
      abilities.r,
      MAX_LEESIN_R_LEVEL,
      slotState(abilities.r, combatClockMs, cooldownEnds.r, rStats?.cooldownMs ?? 0),
    ),
  ]
}
