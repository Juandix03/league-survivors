import { PLAYER_RADIUS } from '../constants'

/** Avance extra desde el centro del campeón (plano suelo — hitbox). */
export const EZREAL_MUZZLE_EXTRA = {
  ba: 22,
  q: 22,
  w: 22,
  e: 22,
  r: 26,
} as const

/** @deprecated Usar EZREAL_MUZZLE_EXTRA — misma distancia que el básico para Q. */
export const EZREAL_MUZZLE_OFFSET = {
  ba: PLAYER_RADIUS + EZREAL_MUZZLE_EXTRA.ba,
  q: PLAYER_RADIUS + EZREAL_MUZZLE_EXTRA.q,
  w: PLAYER_RADIUS + EZREAL_MUZZLE_EXTRA.w,
  e: PLAYER_RADIUS + EZREAL_MUZZLE_EXTRA.e,
  r: PLAYER_RADIUS + EZREAL_MUZZLE_EXTRA.r,
} as const

/** Mystic Shot: acercar el spawn al guante (como se percibe el AA). */
export const EZREAL_Q_SPAWN_TUCK = 12
export const EZREAL_W_SPAWN_TUCK = 10

export type EzrealMuzzleKind = keyof typeof EZREAL_MUZZLE_EXTRA

/** Muzzle en suelo + flash en guante + offset de dibujo (misma lógica para Q/W/E/R/AA). */
export function ezrealAbilityEmitPoints(
  px: number,
  py: number,
  nx: number,
  ny: number,
  kind: EzrealMuzzleKind,
  tuck = 0,
) {
  const ground = ezrealBoltSpawnPoint(px, py, nx, ny, kind, tuck)
  const vfx = ezrealMuzzleVfxPoint(px, py, nx, ny, kind)
  const off = ezrealMuzzleVisualOffset(nx, ny)
  const spawnLead = Math.hypot(ground.x - px, ground.y - py)
  return { ground, vfx, off, spawnLead }
}

/**
 * Sprite con `originY ≈ 0.94` — el guante queda arriba del centro del body.
 * Solo desplaza el **dibujo**; el hitbox sigue en el muzzle de suelo.
 */
export const EZREAL_GAUNTLET_SOCKET_UP = 30

/** Ajuste pantalla → guante según octante de apuntado (evita que el Q “salga abajo”). */
export function ezrealMuzzleVisualOffset(nx: number, ny: number): { dx: number; dy: number } {
  const len = Math.hypot(nx, ny) || 1
  const ux = nx / len
  const uy = ny / len
  const up = EZREAL_GAUNTLET_SOCKET_UP
  return {
    dx: -uy * up * 0.22,
    dy: -up + ux * up * 0.08,
  }
}

/** Origen del proyectil para colisión y trayectoria — **sin** levantar el eje Y. */
export function ezrealMuzzlePoint(
  px: number,
  py: number,
  nx: number,
  ny: number,
  kind: keyof typeof EZREAL_MUZZLE_OFFSET,
): { x: number; y: number } {
  const reach = EZREAL_MUZZLE_OFFSET[kind]
  const len = Math.hypot(nx, ny) || 1
  const ux = nx / len
  const uy = ny / len
  return {
    x: px + ux * reach,
    y: py + uy * reach,
  }
}

/** Flash de cañón / guante (solo dibujo, no gameplay). */
export function ezrealMuzzleVfxPoint(
  px: number,
  py: number,
  nx: number,
  ny: number,
  kind: keyof typeof EZREAL_MUZZLE_OFFSET,
): { x: number; y: number } {
  const ground = ezrealMuzzlePoint(px, py, nx, ny, kind)
  const off = ezrealMuzzleVisualOffset(nx, ny)
  return { x: ground.x + off.dx, y: ground.y + off.dy - 3 }
}

/** Origen del proyectil (gameplay + dibujo en suelo). Opcional tuck hacia el cuerpo. */
export function ezrealBoltSpawnPoint(
  px: number,
  py: number,
  nx: number,
  ny: number,
  kind: keyof typeof EZREAL_MUZZLE_OFFSET,
  tuck = 0,
): { x: number; y: number } {
  const m = ezrealMuzzlePoint(px, py, nx, ny, kind)
  if (tuck <= 0) return m
  const len = Math.hypot(nx, ny) || 1
  const ux = nx / len
  const uy = ny / len
  return { x: m.x - ux * tuck, y: m.y - uy * tuck }
}

export function ezrealMuzzleLeadDistance(
  px: number,
  py: number,
  nx: number,
  ny: number,
  kind: keyof typeof EZREAL_MUZZLE_OFFSET,
) {
  const m = ezrealMuzzlePoint(px, py, nx, ny, kind)
  return Math.hypot(m.x - px, m.y - py)
}
