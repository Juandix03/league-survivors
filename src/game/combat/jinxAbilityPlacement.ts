import * as Phaser from 'phaser'

type EnemyPoint = { x: number; y: number }

function distanceSquared(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

export function findNearestEnemyIndex(
  px: number,
  py: number,
  enemies: EnemyPoint[],
): number {
  if (enemies.length === 0) return -1
  let best = 0
  let bestD = Number.POSITIVE_INFINITY
  for (let i = 0; i < enemies.length; i += 1) {
    const e = enemies[i]
    const d = distanceSquared(px, py, e.x, e.y)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/** Centroid of nearby enemies, else a point ahead of the player. */
export function pickChomperPosition(
  px: number,
  py: number,
  enemies: EnemyPoint[],
  worldW: number,
  worldH: number,
): { x: number; y: number } | null {
  if (enemies.length === 0) return null

  const clusterRadiusSq = 220 ** 2
  let sumX = 0
  let sumY = 0
  let count = 0

  const anchor = enemies[findNearestEnemyIndex(px, py, enemies)]
  for (const e of enemies) {
    if (distanceSquared(anchor.x, anchor.y, e.x, e.y) <= clusterRadiusSq) {
      sumX += e.x
      sumY += e.y
      count += 1
    }
  }

  if (count >= 2) {
    return {
      x: Phaser.Math.Clamp(sumX / count, 40, worldW - 40),
      y: Phaser.Math.Clamp(sumY / count, 40, worldH - 40),
    }
  }

  const dx = anchor.x - px
  const dy = anchor.y - py
  const len = Math.hypot(dx, dy) || 1
  const ahead = 110
  return {
    x: Phaser.Math.Clamp(px + (dx / len) * ahead, 40, worldW - 40),
    y: Phaser.Math.Clamp(py + (dy / len) * ahead, 40, worldH - 40),
  }
}

/** Target point for global rocket — dense cluster or nearest foe. */
export function pickMegaRocketTarget(
  px: number,
  py: number,
  enemies: EnemyPoint[],
  worldW: number,
  worldH: number,
): { x: number; y: number } | null {
  if (enemies.length === 0) return null

  const clusterRadiusSq = 260 ** 2
  let bestCount = 0
  let bestX = enemies[0].x
  let bestY = enemies[0].y

  for (const seed of enemies) {
    let count = 0
    let sx = 0
    let sy = 0
    for (const e of enemies) {
      if (distanceSquared(seed.x, seed.y, e.x, e.y) <= clusterRadiusSq) {
        count += 1
        sx += e.x
        sy += e.y
      }
    }
    if (count > bestCount) {
      bestCount = count
      bestX = sx / count
      bestY = sy / count
    }
  }

  if (bestCount >= 2) {
    return {
      x: Phaser.Math.Clamp(bestX, 40, worldW - 40),
      y: Phaser.Math.Clamp(bestY, 40, worldH - 40),
    }
  }

  const idx = findNearestEnemyIndex(px, py, enemies)
  const e = enemies[idx]
  return { x: e.x, y: e.y }
}

const CHOMPERS_PER_CAST = 3
const CHOMPER_LATERAL_SPACING = 40
const CHOMPER_ARC_SPACING = 28

/** Three traps in a small arc toward the anchor (LoL E volley). */
export function pickChomperVolleyPositions(
  px: number,
  py: number,
  enemies: EnemyPoint[],
  worldW: number,
  worldH: number,
): { x: number; y: number }[] {
  const center = pickChomperPosition(px, py, enemies, worldW, worldH)
  if (!center) {
    return []
  }

  const toCenterX = center.x - px
  const toCenterY = center.y - py
  const len = Math.hypot(toCenterX, toCenterY) || 1
  const fx = toCenterX / len
  const fy = toCenterY / len
  const pxn = -fy
  const pyn = fx

  const clamp = (x: number, y: number) => ({
    x: Phaser.Math.Clamp(x, 40, worldW - 40),
    y: Phaser.Math.Clamp(y, 40, worldH - 40),
  })

  const along = (sign: number) =>
    clamp(
      center.x + fx * CHOMPER_ARC_SPACING * sign,
      center.y + fy * CHOMPER_ARC_SPACING * sign,
    )

  return [
    clamp(
      along(-1).x + pxn * CHOMPER_LATERAL_SPACING,
      along(-1).y + pyn * CHOMPER_LATERAL_SPACING,
    ),
    center,
    clamp(
      along(1).x - pxn * CHOMPER_LATERAL_SPACING,
      along(1).y - pyn * CHOMPER_LATERAL_SPACING,
    ),
  ]
}

export const CHOMPERS_PLACED_PER_CAST = CHOMPERS_PER_CAST
