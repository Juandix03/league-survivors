import { PLAYER_RADIUS } from '../constants'

/** Distancia desde el socket del báculo hasta la punta (top-down). */
export const LUX_MUZZLE_OFFSET = {
  ba: PLAYER_RADIUS + 18,
  q: PLAYER_RADIUS + 32,
  w: PLAYER_RADIUS + 28,
  e: PLAYER_RADIUS + 30,
  r: PLAYER_RADIUS + 34,
} as const

/**
 * El sprite de Lux ancla en los pies (`originY ≈ 0.94`); el socket del staff queda arriba en pantalla.
 */
const STAFF_SOCKET_UP = 36

export function luxMuzzlePoint(
  px: number,
  py: number,
  nx: number,
  ny: number,
  kind: keyof typeof LUX_MUZZLE_OFFSET,
): { x: number; y: number } {
  const d = LUX_MUZZLE_OFFSET[kind]
  const len = Math.hypot(nx, ny) || 1
  const ux = nx / len
  const uy = ny / len
  // Pequeño sesgo lateral para que disparos horizontales salgan del torso, no de los pies.
  const socketX = px - uy * STAFF_SOCKET_UP * 0.28
  const socketY = py - STAFF_SOCKET_UP + ux * STAFF_SOCKET_UP * 0.1
  return {
    x: socketX + ux * d,
    y: socketY + uy * d,
  }
}

/** Punto donde la onda W debe volver (torso / escudo). */
export function luxWaveReturnTarget(px: number, py: number): { x: number; y: number } {
  return { x: px, y: py - 14 }
}
