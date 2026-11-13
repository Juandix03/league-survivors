import { AHRI_CHAMPION } from './ahri'
import { LEESIN_CHAMPION } from './leesin'
import { MISSFORTUNE_CHAMPION } from './missfortune'
import { EZREAL_CHAMPION } from './ezreal'
import { LUX_CHAMPION } from './lux'
import { YASUO_CHAMPION } from './yasuo'
import {
  JINX_CHAMPION,
  JINX_CHAMPION_AUTHENTIC_PREVIEW,
  JINX_CHAMPION_PROTOTYPE,
} from './jinx'
import { getSelectedChampion, isChampionUnlocked } from '../meta/championUnlock'
import type { ChampionId, ChampionVisualConfig } from './types'

const AUTHENTIC_QUERY = 'jinxSheet'
export const CHAMPION_QUERY_KEY = 'champion'

export function resolveRequestedChampionFromUrl(): ChampionId | null {
  if (typeof window === 'undefined') {
    return null
  }
  const value = new URLSearchParams(window.location.search).get(CHAMPION_QUERY_KEY)
  if (
    value === 'jinx' ||
    value === 'ahri' ||
    value === 'yasuo' ||
    value === 'lux' ||
    value === 'leesin' ||
    value === 'missfortune' ||
    value === 'ezreal'
  ) {
    return value
  }
  return null
}

/** Campeón de la run: meta `selectedChampion`; en DEV, `?champion=` override. */
export function resolvePlayableChampionId(): ChampionId {
  const requested = resolveRequestedChampionFromUrl()
  if (import.meta.env.DEV && requested) {
    return requested
  }
  const selected = getSelectedChampion()
  if (isChampionUnlocked(selected)) {
    return selected
  }
  return 'jinx'
}

function resolveJinxVisualVariant(): ChampionVisualConfig {
  if (typeof window === 'undefined') {
    return JINX_CHAMPION
  }

  const mode = new URLSearchParams(window.location.search).get(AUTHENTIC_QUERY)
  if (mode === 'prototype' || mode === 'legacy') {
    return JINX_CHAMPION_PROTOTYPE
  }
  if (mode === 'authentic-hd' || mode === 'hd') {
    return JINX_CHAMPION
  }
  if (mode === 'authentic') {
    return JINX_CHAMPION_AUTHENTIC_PREVIEW
  }

  return JINX_CHAMPION
}

export function resolveChampionVisualById(id: ChampionId): ChampionVisualConfig {
  if (id === 'ahri') return AHRI_CHAMPION
  if (id === 'yasuo') return YASUO_CHAMPION
  if (id === 'lux') return LUX_CHAMPION
  if (id === 'leesin') return LEESIN_CHAMPION
  if (id === 'missfortune') return MISSFORTUNE_CHAMPION
  if (id === 'ezreal') return EZREAL_CHAMPION
  return resolveJinxVisualVariant()
}

/**
 * Visual + id del campeón activo (meta / sesión).
 * Jinx: `?jinxSheet=prototype` (JPG viejo) | `authentic` (64px bake).
 */
export function resolveActiveChampion(): ChampionVisualConfig {
  return resolveChampionVisualById(resolvePlayableChampionId())
}

export const AUTHENTIC_CHAMPION_QUERY_KEY = AUTHENTIC_QUERY
