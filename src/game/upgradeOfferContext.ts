import type { ChampionId } from './champions/types'
import type { AhriAbilityLevels } from './combat/ahriAbilityState'
import type { JinxAbilityLevels } from './combat/jinxAbilityState'
import type { LuxAbilityLevels } from './combat/luxAbilityState'
import type { MissFortuneAbilityLevels } from './combat/missFortuneAbilityState'
import type { LeeSinAbilityLevels } from './combat/leeSinAbilityState'
import type { YasuoAbilityLevels } from './combat/yasuoAbilityState'
import type { EzrealAbilityLevels } from './combat/ezrealAbilityState'
import type { PlayerCombatStats } from './playerStats'

export type UpgradeOfferContext = {
  championId: ChampionId
  stats: PlayerCombatStats
  /** Jinx */
  abilities: JinxAbilityLevels
  ahriAbilities: AhriAbilityLevels
  luxAbilities: LuxAbilityLevels
  missFortuneAbilities: MissFortuneAbilityLevels
  leeSinAbilities: LeeSinAbilityLevels
  yasuoAbilities: YasuoAbilityLevels
  ezrealAbilities: EzrealAbilityLevels
  upgradePickCount: number
  playerLevel: number
}
