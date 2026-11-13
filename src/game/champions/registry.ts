import {
  resolveActiveChampion,
  resolveChampionVisualById,
  resolvePlayableChampionId,
} from './resolveActiveChampion'
import type { ChampionId, ChampionVisualConfig } from './types'

let sessionChampionId: ChampionId | null = null

/** Fija el campeón de la partida en curso (antes de arrancar Phaser). */
export function setSessionChampionId(id: ChampionId | null) {
  sessionChampionId = id
}

export function getSessionChampionId(): ChampionId | null {
  return sessionChampionId
}

export function getActiveChampion(): ChampionVisualConfig {
  if (sessionChampionId) {
    return resolveChampionVisualById(sessionChampionId)
  }
  return resolveActiveChampion()
}

export function getActiveChampionId(): ChampionId {
  return sessionChampionId ?? resolvePlayableChampionId()
}

/** @deprecated Prefer getActiveChampion() — value depends on URL (`?jinxSheet=authentic`). */
export const ACTIVE_CHAMPION: ChampionVisualConfig = resolveActiveChampion()
