import type { ChampionId } from '../champions/types'
import type { PlayerCombatStats } from '../playerStats'
import type { UpgradeOfferContext } from '../upgradeOfferContext'
import {
  applyUpgradeChoice,
  listEligibleUpgrades,
  pickRandomUpgrades,
  type UpgradeId,
} from '../upgrades'
import type { UpgradeRunState } from '../upgradeRunState'
import type { SimAbilityLoadout } from './simChampionInit'
import { withSeededRandom } from './simRandom'

export type SimUpgradePolicy = 'random' | 'greedy'

const GREEDY_SCORE: Partial<Record<UpgradeId, number>> = {
  magicPower: 100,
  attackSpeed: 92,
  doubleShot: 88,
  fastProjectiles: 70,
  lightBoots: 65,
  vitality: 60,
  unlockQ: 95,
  upgradeQ: 85,
  unlockW: 94,
  upgradeW: 84,
  unlockE: 90,
  upgradeE: 82,
  unlockR: 75,
  upgradeR: 78,
  jinxUnlockQ: 96,
  jinxUpgradeQ: 86,
}

function greedyScore(id: UpgradeId): number {
  if (GREEDY_SCORE[id] !== undefined) return GREEDY_SCORE[id]!
  if (id.includes('Unlock')) return 93
  if (id.includes('Upgrade') || id.startsWith('upgrade')) return 83
  return 50
}

export function buildOfferContext(
  championId: ChampionId,
  runState: UpgradeRunState,
  upgradePickCount: number,
  playerLevel: number,
): UpgradeOfferContext {
  return {
    championId,
    stats: runState.stats,
    abilities: runState.abilities,
    ahriAbilities: runState.ahriAbilities,
    luxAbilities: runState.luxAbilities,
    missFortuneAbilities: runState.missFortuneAbilities,
    leeSinAbilities: runState.leeSinAbilities,
    yasuoAbilities: runState.yasuoAbilities,
    ezrealAbilities: runState.ezrealAbilities,
    upgradePickCount,
    playerLevel,
  }
}

export function loadoutFromUpgradeState(state: UpgradeRunState): SimAbilityLoadout {
  return {
    jinx: state.abilities,
    ahri: state.ahriAbilities,
    lux: state.luxAbilities,
    missFortune: state.missFortuneAbilities,
    leeSin: state.leeSinAbilities,
    yasuo: state.yasuoAbilities,
    ezreal: state.ezrealAbilities,
  }
}

function pickGreedy(pool: UpgradeId[]): UpgradeId {
  let best = pool[0]
  let bestScore = greedyScore(best)
  for (const id of pool) {
    const score = greedyScore(id)
    if (score > bestScore) {
      best = id
      bestScore = score
    }
  }
  return best
}

export function pickSimUpgrade(
  policy: SimUpgradePolicy,
  rand: () => number,
  ctx: UpgradeOfferContext,
): UpgradeId {
  const pool = listEligibleUpgrades(ctx)
  if (pool.length === 0) {
    return 'magicPower'
  }

  if (policy === 'greedy') {
    return pickGreedy(pool)
  }

  const offers = withSeededRandom(rand, () => pickRandomUpgrades(3, ctx))
  if (offers.length === 0) {
    return pickGreedy(pool)
  }
  const index = Math.floor(rand() * offers.length)
  return offers[index] ?? offers[0]
}

export function applySimUpgradePick(
  id: UpgradeId,
  runState: UpgradeRunState,
): UpgradeRunState {
  return applyUpgradeChoice(id, runState)
}
