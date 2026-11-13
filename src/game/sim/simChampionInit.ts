import type { ChampionId } from '../champions/types'
import {
  createInitialAhriAbilityLevels,
  type AhriAbilityLevels,
} from '../combat/ahriAbilityState'
import {
  createInitialJinxAbilityLevels,
  type JinxAbilityLevels,
} from '../combat/jinxAbilityState'
import type { LuxAbilityLevels } from '../combat/luxAbilityState'
import type { MissFortuneAbilityLevels } from '../combat/missFortuneAbilityState'
import type { LeeSinAbilityLevels } from '../combat/leeSinAbilityState'
import type { YasuoAbilityLevels } from '../combat/yasuoAbilityState'
import type { EzrealAbilityLevels } from '../combat/ezrealAbilityState'

export type SimAbilityLoadout = {
  jinx: JinxAbilityLevels
  ahri: AhriAbilityLevels
  lux: LuxAbilityLevels
  missFortune: MissFortuneAbilityLevels
  leeSin: LeeSinAbilityLevels
  yasuo: YasuoAbilityLevels
  ezreal: EzrealAbilityLevels
}

export type SimAbilityStartMode = 'production' | 'dev'

function productionLux(): LuxAbilityLevels {
  return { q: 1, w: 1, e: 1, r: 0 }
}

function productionMissFortune(): MissFortuneAbilityLevels {
  return { q: 0, w: 0, e: 0, r: 0 }
}

function productionLeeSin(): LeeSinAbilityLevels {
  return { q: 0, w: 0, e: 0, r: 0 }
}

function productionYasuo(): YasuoAbilityLevels {
  return { q: 0, w: 0, e: 0, r: 0 }
}

function productionEzreal(): EzrealAbilityLevels {
  return { q: 0, w: 0, e: 0, r: 0 }
}

function productionAhri(): AhriAbilityLevels {
  return { q: 0, w: 0, e: 0, r: 0 }
}

function productionJinx(): JinxAbilityLevels {
  return { q: 0, w: 0, e: 0, r: 0 }
}

/** Habilidades iniciales alineadas a producción (sin depender de `import.meta.env.DEV`). */
export function createSimAbilityLoadout(mode: SimAbilityStartMode): SimAbilityLoadout {
  if (mode === 'dev') {
    return {
      jinx: createInitialJinxAbilityLevels(),
      ahri: createInitialAhriAbilityLevels(),
      lux: { q: 1, w: 1, e: 1, r: 1 },
      missFortune: { q: 1, w: 1, e: 1, r: 1 },
      leeSin: { q: 1, w: 1, e: 1, r: 1 },
      yasuo: { q: 1, w: 1, e: 1, r: 1 },
      ezreal: { q: 1, w: 1, e: 1, r: 1 },
    }
  }
  return {
    jinx: productionJinx(),
    ahri: productionAhri(),
    lux: productionLux(),
    missFortune: productionMissFortune(),
    leeSin: productionLeeSin(),
    yasuo: productionYasuo(),
    ezreal: productionEzreal(),
  }
}

export function championUsesJinxUpgradeTrack(championId: ChampionId): boolean {
  return championId === 'jinx'
}

export function championUsesAhriUpgradeTrack(championId: ChampionId): boolean {
  return championId === 'ahri'
}
