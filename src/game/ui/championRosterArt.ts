import type { ChampionId } from '../champions/types'
import { ROSTER_CHAMPION_IDS } from '../meta/championRoster'

const SPLASH_VERSION = '1'

function localSplash(path: string): string {
  return `${path}?v=${SPLASH_VERSION}`
}

const ROSTER_SPLASH: Record<ChampionId, string> = {
  jinx: localSplash('/assets/champions/jinx/splash.jpg'),
  ezreal: localSplash('/assets/champions/ezreal/splash.jpg'),
  ahri: localSplash('/assets/champions/ahri/splash.jpg'),
  lux: localSplash('/assets/champions/lux/splash.jpg'),
  missfortune: localSplash('/assets/champions/missfortune/splash.jpg'),
  yasuo: localSplash('/assets/champions/yasuo/splash.jpg'),
  leesin: localSplash('/assets/champions/leesin/splash.jpg'),
}

/** Arte de splash para tarjetas del roster (assets locales). */
export function resolveChampionRosterSplash(championId: ChampionId): string {
  return ROSTER_SPLASH[championId] ?? ROSTER_SPLASH.jinx
}

export const ROSTER_SPLASH_CHAMPION_IDS = ROSTER_CHAMPION_IDS
