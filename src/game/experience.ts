export const STARTING_LEVEL = 1
export const XP_CRYSTAL_VALUE = 10
export const XP_PICKUP_RADIUS = 52

/** Experiencia necesaria para pasar del nivel `level` al siguiente. */
export function xpRequiredForNextLevel(level: number): number {
  const safeLevel = Math.max(1, level)
  return Math.floor(12 + (safeLevel - 1) * 8 + (safeLevel - 1) ** 2 * 2)
}

export type XpState = {
  level: number
  xp: number
}

export type ApplyXpResult = XpState & {
  levelsGained: number
}

export function applyExperience(
  state: XpState,
  amount: number,
): ApplyXpResult {
  let { level, xp } = state
  xp += amount
  let levelsGained = 0

  while (xp >= xpRequiredForNextLevel(level)) {
    xp -= xpRequiredForNextLevel(level)
    level += 1
    levelsGained += 1
  }

  return { level, xp, levelsGained }
}

export function xpProgressRatio(level: number, xp: number): number {
  const threshold = xpRequiredForNextLevel(level)
  if (threshold <= 0) {
    return 0
  }
  return Math.max(0, Math.min(1, xp / threshold))
}
