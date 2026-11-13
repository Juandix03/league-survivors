import type { ChampionId } from './champions/types'
import type { PlayerCombatStats } from './playerStats'
import {
  ABILITY_UPGRADE_OWNER,
  buildChampionAbilityUpgradeCatalog,
  championQUnlockId,
  championUltimateUnlockId,
  championUnlockUpgradeIds,
  countUnlockedNonUltimateSpells,
} from './championAbilityUpgradeCatalog'
import type { UpgradeId } from './upgradeIds'
import type { UpgradeOfferContext } from './upgradeOfferContext'
import {
  createInitialUpgradeRunState,
  type UpgradeRunState,
} from './upgradeRunState'
import { resolveChampionAbilityHudIcon } from './ui/championAbilityHudIcons'

export type { UpgradeId } from './upgradeIds'
export type { UpgradeOfferContext } from './upgradeOfferContext'
export type { UpgradeRunState } from './upgradeRunState'
export { createInitialUpgradeRunState } from './upgradeRunState'

/** Peso relativo al sortear unlocks de habilidad (Q un poco más común). */
function pickWeightedSpellUnlock(unlocks: UpgradeId[], qUnlock: UpgradeId | null): UpgradeId {
  if (unlocks.length === 1) return unlocks[0]
  const weightFor = (id: UpgradeId): number => {
    if (qUnlock && id === qUnlock) return 2.4
    if (id.endsWith('UnlockR') || id === 'unlockR') return 0.9
    if (id.endsWith('UnlockE') || id === 'unlockE') return 1.05
    return 1.18
  }
  const weights = unlocks.map(weightFor)
  let roll = Math.random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < unlocks.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) return unlocks[i]
  }
  return unlocks[unlocks.length - 1]
}

export type UpgradeOptionView = {
  id: UpgradeId
  title: string
  description: string
  /** Emoji u otro fallback si no hay icono de habilidad. */
  icon: string
  /** Icono spell (misma URL que AbilityBar). */
  iconSrc?: string
}

type CatalogEntry = {
  title: string | ((ctx: UpgradeOfferContext) => string)
  description: string | ((ctx: UpgradeOfferContext) => string)
  icon: string
  isEligible: (ctx: UpgradeOfferContext) => boolean
  apply: (state: UpgradeRunState) => UpgradeRunState
}

const STAT_CATALOG: Partial<Record<UpgradeId, CatalogEntry>> = {
  magicPower: {
    title: 'Poder mágico',
    description: '+20% de daño de proyectiles y habilidades.',
    icon: '✦',
    isEligible: () => true,
    apply: (state) => ({
      ...state,
      stats: {
        ...state.stats,
        projectileDamage: state.stats.projectileDamage * 1.2,
      },
    }),
  },
  attackSpeed: {
    title: 'Velocidad de ataque',
    description: 'Ataques básicos un 15% más rápidos.',
    icon: '⚡',
    isEligible: () => true,
    apply: (state) => ({
      ...state,
      stats: {
        ...state.stats,
        attackIntervalMs: state.stats.attackIntervalMs * 0.85,
      },
    }),
  },
  lightBoots: {
    title: 'Botas ligeras',
    description: '+15% de velocidad de movimiento.',
    icon: '👢',
    isEligible: () => true,
    apply: (state) => ({
      ...state,
      stats: {
        ...state.stats,
        moveSpeed: state.stats.moveSpeed * 1.15,
      },
    }),
  },
  vitality: {
    title: 'Vitalidad',
    description: '+20 vida máxima y curás 20.',
    icon: '❤',
    isEligible: () => true,
    apply: (state) => {
      const maxHealth = state.stats.maxHealth + 20
      return {
        ...state,
        stats: { ...state.stats, maxHealth },
        health: Math.min(state.health + 20, maxHealth),
      }
    },
  },
  fastProjectiles: {
    title: 'Proyectiles veloces',
    description: '+15% de velocidad de proyectiles básicos.',
    icon: '➤',
    isEligible: () => true,
    apply: (state) => ({
      ...state,
      stats: {
        ...state.stats,
        projectileSpeed: state.stats.projectileSpeed * 1.15,
      },
    }),
  },
  doubleShot: {
    title: 'Doble lanzamiento',
    description: 'Un proyectil extra por ataque básico.',
    icon: '◎',
    isEligible: () => true,
    apply: (state) => ({
      ...state,
      stats: {
        ...state.stats,
        projectileCount: state.stats.projectileCount + 1,
      },
    }),
  },
}

const CATALOG: Record<UpgradeId, CatalogEntry> = {
  ...(STAT_CATALOG as Record<UpgradeId, CatalogEntry>),
  ...(buildChampionAbilityUpgradeCatalog() as Record<UpgradeId, CatalogEntry>),
}

const ALL_IDS = Object.keys(CATALOG) as UpgradeId[]

function resolveText(
  value: string | ((ctx: UpgradeOfferContext) => string),
  ctx: UpgradeOfferContext,
) {
  return typeof value === 'function' ? value(ctx) : value
}

export function toUpgradeOptionView(
  id: UpgradeId,
  ctx: UpgradeOfferContext,
): UpgradeOptionView {
  const entry = CATALOG[id]
  const owner = championIdForUpgrade(id)
  const slot = abilitySlotFromUpgradeId(id)
  let iconSrc: string | undefined
  if (slot && isAbilityUpgradeId(id)) {
    const champion = owner ?? ctx.championId
    if (champion === ctx.championId) {
      iconSrc = resolveChampionAbilityHudIcon(champion, slot)
    }
  }
  return {
    id,
    title: resolveText(entry.title, ctx),
    description: resolveText(entry.description, ctx),
    icon: entry.icon,
    iconSrc,
  }
}

export function listEligibleUpgrades(ctx: UpgradeOfferContext): UpgradeId[] {
  return ALL_IDS.filter((id) => {
    const owner = ABILITY_UPGRADE_OWNER[id]
    if (owner && owner !== ctx.championId) {
      return false
    }
    return CATALOG[id].isEligible(ctx)
  })
}

/**
 * Ofertas de level-up: desbloqueos tempranos, un spell por carta, R tardía y con peso cuando toca.
 */
export function pickRandomUpgrades(
  count: number,
  ctx: UpgradeOfferContext,
): UpgradeId[] {
  let pool = listEligibleUpgrades(ctx)
  if (pool.length === 0) {
    const fallback: UpgradeId[] = ['magicPower', 'attackSpeed', 'vitality']
    return fallback.slice(0, count)
  }

  const unlockIds = championUnlockUpgradeIds(ctx.championId)
  const unlocksInPool = pool.filter((id) => unlockIds.includes(id))
  const rUnlock = championUltimateUnlockId(ctx.championId)
  const qUnlock = championQUnlockId(ctx.championId)
  const nonUltUnlocked = countUnlockedNonUltimateSpells(ctx)

  if (unlocksInPool.length > 1) {
    const keep = pickWeightedSpellUnlock(unlocksInPool, qUnlock)
    pool = pool.filter((id) => !unlockIds.includes(id) || id === keep)
  }

  // Primeras picks: stats a menudo, pero no bloquear tantos unlocks (antes ~65% los sacaba).
  if (ctx.upgradePickCount < 6 && unlocksInPool.length > 0) {
    if (Math.random() > 0.72) {
      pool = pool.filter((id) => !unlockIds.includes(id))
    }
  }

  // R solo si ya hay core (2+ básicos sin contar ult) y el catálogo la marca elegible.
  if (rUnlock) {
    const rEligible = unlocksInPool.includes(rUnlock)
    if (!rEligible || nonUltUnlocked < 2) {
      pool = pool.filter((id) => id !== rUnlock)
    } else if (pool.includes(rUnlock)) {
      if (Math.random() > 0.48) {
        pool = pool.filter((id) => id !== rUnlock)
      }
    }
  }

  const picks: UpgradeId[] = []
  const working = [...pool]

  while (picks.length < count && working.length > 0) {
    const index = Math.floor(Math.random() * working.length)
    const [picked] = working.splice(index, 1)
    picks.push(picked)
  }

  while (picks.length < count) {
    const fallback = listEligibleUpgrades(ctx).find((id) => !picks.includes(id))
    if (!fallback) break
    picks.push(fallback)
  }

  // Primeras ~6 elecciones: si hay unlock disponible, al menos uno en la mesa (más divertido que solo +dmg).
  if (ctx.upgradePickCount < 6 && unlocksInPool.length > 0) {
    const hasUnlock = picks.some((id) => unlockIds.includes(id))
    if (!hasUnlock) {
      const nonUltUnlocks = unlocksInPool.filter((id) => id !== rUnlock)
      const prefer = nonUltUnlocks.length > 0 ? nonUltUnlocks : unlocksInPool
      const inject = pickWeightedSpellUnlock(prefer, qUnlock)
      if (picks.length >= count) picks[count - 1] = inject
      else picks.push(inject)
    }
  }

  // Cuando la R entra en juego, ~45% de forzarla en una carta (momento “ult”).
  if (
    rUnlock &&
    unlocksInPool.includes(rUnlock) &&
    !picks.includes(rUnlock) &&
    nonUltUnlocked >= 2 &&
    Math.random() < 0.45
  ) {
    if (picks.length >= count) picks[count - 1] = rUnlock
    else picks.push(rUnlock)
  }

  return picks.slice(0, count)
}

export function applyUpgradeChoice(id: UpgradeId, state: UpgradeRunState): UpgradeRunState {
  return CATALOG[id].apply(state)
}

/** Compatibilidad con llamadas que pasaban habilidades sueltas. */
export function applyUpgradeChoiceLegacy(
  id: UpgradeId,
  stats: PlayerCombatStats,
  health: number,
  partial?: Partial<
    Pick<
      UpgradeRunState,
      | 'abilities'
      | 'ahriAbilities'
      | 'luxAbilities'
      | 'missFortuneAbilities'
      | 'leeSinAbilities'
      | 'yasuoAbilities'
    >
  >,
): UpgradeRunState {
  const state = createInitialUpgradeRunState(stats, health)
  return applyUpgradeChoice(id, {
    ...state,
    ...partial,
    stats,
    health,
  })
}

export function isAbilityUpgradeId(id: UpgradeId): boolean {
  return id in ABILITY_UPGRADE_OWNER || id.startsWith('unlock') || id.startsWith('upgrade')
}

export function abilitySlotFromUpgradeId(id: UpgradeId): 'q' | 'w' | 'e' | 'r' | null {
  if (id.endsWith('Q') || id === 'unlockQ' || id === 'upgradeQ') return 'q'
  if (id.endsWith('W') || id === 'unlockW' || id === 'upgradeW') return 'w'
  if (id.endsWith('E') || id === 'unlockE' || id === 'upgradeE') return 'e'
  if (id.endsWith('R') || id === 'unlockR' || id === 'upgradeR') return 'r'
  return null
}

export function championIdForUpgrade(id: UpgradeId): ChampionId | null {
  return ABILITY_UPGRADE_OWNER[id] ?? null
}
