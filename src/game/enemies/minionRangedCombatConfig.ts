import type { MinionPreviewKind } from '../../minionPreview/minionPreviewConstants'

export type MinionAttackerProfile = {
  id: 'ranged' | 'siege'
  range: number
  damage: number
  fireIntervalMs: number
  projectileSpeed: number
  windupMs: number
  projectileRadius: number
  maxProjectileLifeMs: number
  /** Color relleno / borde (order vs chaos). */
  fillColor: number
  strokeColor: number
}

export const MINION_RANGED_CASTER_CONFIG = {
  range: 430,
  damage: 8,
  fireIntervalMs: 1600,
  projectileSpeed: 300,
  windupMs: 320,
  projectileRadius: 5,
  maxProjectileLifeMs: 4500,
} as const

export const MINION_SIEGE_CANNON_CONFIG = {
  range: 340,
  damage: 18,
  fireIntervalMs: 2800,
  projectileSpeed: 220,
  windupMs: 780,
  projectileRadius: 8,
  maxProjectileLifeMs: 5500,
} as const

const ORDER_RANGED: MinionAttackerProfile = {
  id: 'ranged',
  ...MINION_RANGED_CASTER_CONFIG,
  fillColor: 0x60a5fa,
  strokeColor: 0x1e3a8a,
}

const CHAOS_RANGED: MinionAttackerProfile = {
  id: 'ranged',
  ...MINION_RANGED_CASTER_CONFIG,
  fillColor: 0xf87171,
  strokeColor: 0x7f1d1d,
}

const ORDER_SIEGE: MinionAttackerProfile = {
  id: 'siege',
  ...MINION_SIEGE_CANNON_CONFIG,
  fillColor: 0x38bdf8,
  strokeColor: 0x0c4a6e,
}

const CHAOS_SIEGE: MinionAttackerProfile = {
  id: 'siege',
  ...MINION_SIEGE_CANNON_CONFIG,
  fillColor: 0xfb923c,
  strokeColor: 0x9a3412,
}

export function getMinionAttackerProfile(
  kind: MinionPreviewKind,
): MinionAttackerProfile | null {
  switch (kind) {
    case 'orderRanged':
      return ORDER_RANGED
    case 'chaosRanged':
      return CHAOS_RANGED
    case 'orderSiege':
      return ORDER_SIEGE
    case 'chaosSiege':
      return CHAOS_SIEGE
    default:
      return null
  }
}

export function isMinionRangedAttacker(kind: MinionPreviewKind): boolean {
  return getMinionAttackerProfile(kind) !== null
}
