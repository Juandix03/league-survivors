import { DEV_ABILITY_TESTING } from '../devConfig'

export function effectiveAhriAbilityLevel(unlockedLevel: number): number {
  if (unlockedLevel > 0) {
    return unlockedLevel
  }
  if (DEV_ABILITY_TESTING) {
    return 1
  }
  return 0
}

export function isAhriAbilityUnlocked(unlockedLevel: number): boolean {
  return effectiveAhriAbilityLevel(unlockedLevel) > 0
}
