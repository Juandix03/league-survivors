export type PlayerFacing = 'idle' | 'down' | 'up' | 'left' | 'right'

/** Índice 0–7: E, SE, S, SW, W, NW, N, NE (atan2 con Y+ abajo). */
export const WALK8_OCTANT_SUFFIX = [
  'right',
  'down-right',
  'down',
  'down-left',
  'left',
  'up-left',
  'up',
  'up-right',
] as const

export type Walk8OctantSuffix = (typeof WALK8_OCTANT_SUFFIX)[number]

export function octantFromVelocity(vx: number, vy: number): number {
  const speedSq = vx * vx + vy * vy
  if (speedSq < 1e-6) {
    return -1
  }
  const angle = Math.atan2(vy, vx)
  return ((Math.round(angle / (Math.PI / 4)) % 8) + 8) % 8
}

/**
 * 4 poses en el bake clásico (↓ ↑ perfil). Diagonales → fila más cercana.
 */
export function facingFromVelocity(vx: number, vy: number): PlayerFacing {
  const oct = octantFromVelocity(vx, vy)
  if (oct < 0) {
    return 'idle'
  }
  if (oct === 0) {
    return 'right'
  }
  if (oct === 4) {
    return 'left'
  }
  if (oct === 1 || oct === 2 || oct === 3) {
    return 'down'
  }
  return 'up'
}

export function walk8AnimSuffixFromVelocity(vx: number, vy: number): Walk8OctantSuffix | null {
  const oct = octantFromVelocity(vx, vy)
  if (oct < 0) {
    return null
  }
  return WALK8_OCTANT_SUFFIX[oct]
}
