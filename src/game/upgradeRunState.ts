import {
  createInitialAhriAbilityLevels,
  type AhriAbilityLevels,
} from './combat/ahriAbilityState'
import {
  createInitialJinxAbilityLevels,
  type JinxAbilityLevels,
} from './combat/jinxAbilityState'
import {
  createInitialLuxAbilityLevels,
  type LuxAbilityLevels,
} from './combat/luxAbilityState'
import {
  createInitialMissFortuneAbilityLevels,
  type MissFortuneAbilityLevels,
} from './combat/missFortuneAbilityState'
import {
  createInitialLeeSinAbilityLevels,
  type LeeSinAbilityLevels,
} from './combat/leeSinAbilityState'
import {
  createInitialYasuoAbilityLevels,
  type YasuoAbilityLevels,
} from './combat/yasuoAbilityState'
import {
  createInitialEzrealAbilityLevels,
  type EzrealAbilityLevels,
} from './combat/ezrealAbilityState'
import type { PlayerCombatStats } from './playerStats'

export type UpgradeRunState = {
  stats: PlayerCombatStats
  health: number
  /** Jinx */
  abilities: JinxAbilityLevels
  ahriAbilities: AhriAbilityLevels
  luxAbilities: LuxAbilityLevels
  missFortuneAbilities: MissFortuneAbilityLevels
  leeSinAbilities: LeeSinAbilityLevels
  yasuoAbilities: YasuoAbilityLevels
  ezrealAbilities: EzrealAbilityLevels
}

export function createInitialUpgradeRunState(
  stats: PlayerCombatStats,
  health: number,
): UpgradeRunState {
  return {
    stats,
    health,
    abilities: createInitialJinxAbilityLevels(),
    ahriAbilities: createInitialAhriAbilityLevels(),
    luxAbilities: createInitialLuxAbilityLevels(),
    missFortuneAbilities: createInitialMissFortuneAbilityLevels(),
    leeSinAbilities: createInitialLeeSinAbilityLevels(),
    yasuoAbilities: createInitialYasuoAbilityLevels(),
    ezrealAbilities: createInitialEzrealAbilityLevels(),
  }
}
