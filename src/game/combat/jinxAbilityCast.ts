import { DEV_ABILITY_TESTING } from '../devConfig'

/** Level used for casting/CD — does not mutate unlock state or upgrades. */
export function effectiveJinxAbilityLevel(unlockedLevel: number): number {
  if (unlockedLevel > 0) {
    return unlockedLevel
  }
  if (DEV_ABILITY_TESTING) {
    return 1
  }
  return 0
}

export function isJinxAbilityUnlocked(unlockedLevel: number): boolean {
  return effectiveJinxAbilityLevel(unlockedLevel) > 0
}
