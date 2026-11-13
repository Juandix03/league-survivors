import type { ChampionId } from '../champions/types'

/** Monedas para desbloqueo permanente (null = siempre desbloqueado). */
export const CHAMPION_UNLOCK_COST: Record<ChampionId, number | null> = {
  jinx: null,
  ahri: 300,
  yasuo: 350,
  lux: 320,
  leesin: 340,
  missfortune: 330,
  ezreal: 325,
}

const META_STORAGE_KEY = 'league-survivors/meta/v1'

const ALL_CHAMPION_IDS: ChampionId[] = [
  'jinx',
  'ahri',
  'yasuo',
  'lux',
  'leesin',
  'missfortune',
  'ezreal',
]

function isChampionId(value: string): value is ChampionId {
  return (ALL_CHAMPION_IDS as string[]).includes(value)
}

export type MetaProgressV1 = {
  unlockedChampions: ChampionId[]
  coins: number
  /** Campeón elegido para la próxima partida. */
  selectedChampion: ChampionId
}

function defaultMeta(): MetaProgressV1 {
  return {
    unlockedChampions: ['jinx'],
    coins: 0,
    selectedChampion: 'jinx',
  }
}

function writeMeta(meta: MetaProgressV1) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta))
}

function readMeta(): MetaProgressV1 {
  if (typeof window === 'undefined') {
    return defaultMeta()
  }
  try {
    const raw = window.localStorage.getItem(META_STORAGE_KEY)
    if (!raw) {
      return defaultMeta()
    }
    const parsed = JSON.parse(raw) as Partial<MetaProgressV1>
    const unlocked = new Set<ChampionId>(['jinx'])
    for (const id of parsed.unlockedChampions ?? []) {
      if (isChampionId(id)) {
        unlocked.add(id)
      }
    }
    let selected: ChampionId = 'jinx'
    if (parsed.selectedChampion && isChampionId(parsed.selectedChampion)) {
      selected = parsed.selectedChampion
    }
    if (!unlocked.has(selected)) {
      selected = 'jinx'
    }
    return {
      unlockedChampions: [...unlocked],
      coins: Math.max(0, Math.floor(parsed.coins ?? 0)),
      selectedChampion: selected,
    }
  } catch {
    return defaultMeta()
  }
}

export function getMetaProgress(): MetaProgressV1 {
  return readMeta()
}

export function isChampionUnlocked(id: ChampionId): boolean {
  if (CHAMPION_UNLOCK_COST[id] === null) {
    return true
  }
  return readMeta().unlockedChampions.includes(id)
}

export function getSelectedChampion(): ChampionId {
  const meta = readMeta()
  if (isChampionUnlocked(meta.selectedChampion)) {
    return meta.selectedChampion
  }
  return 'jinx'
}

export function setSelectedChampion(id: ChampionId): boolean {
  if (!isChampionUnlocked(id)) {
    return false
  }
  const meta = readMeta()
  meta.selectedChampion = id
  writeMeta(meta)
  return true
}

/** Persistir desbloqueo (compra con monedas). */
export function unlockChampionPermanent(id: ChampionId): boolean {
  if (typeof window === 'undefined' || CHAMPION_UNLOCK_COST[id] === null) {
    return true
  }
  const meta = readMeta()
  if (meta.unlockedChampions.includes(id)) {
    return true
  }
  const cost = CHAMPION_UNLOCK_COST[id] ?? 0
  if (meta.coins < cost) {
    return false
  }
  meta.coins -= cost
  meta.unlockedChampions.push(id)
  meta.selectedChampion = id
  writeMeta(meta)
  return true
}

/** Suma monedas al finalizar partida. */
export function addMetaCoins(amount: number): number {
  if (typeof window === 'undefined' || amount <= 0) {
    return readMeta().coins
  }
  const meta = readMeta()
  meta.coins += Math.floor(amount)
  writeMeta(meta)
  return meta.coins
}
