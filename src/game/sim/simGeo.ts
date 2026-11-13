import type { SimEnemy } from './simTypes'

export function nearestEnemyIndex(
  enemies: SimEnemy[],
  px: number,
  py: number,
  maxRange?: number,
  skipIndex = -1,
): number {
  let best = -1
  let bestD = Number.POSITIVE_INFINITY
  const maxSq = maxRange !== undefined ? maxRange * maxRange : undefined
  for (let i = 0; i < enemies.length; i += 1) {
    if (i === skipIndex) continue
    const e = enemies[i]
    const dx = e.x - px
    const dy = e.y - py
    const dSq = dx * dx + dy * dy
    if (maxSq !== undefined && dSq > maxSq) continue
    if (dSq < bestD) {
      bestD = dSq
      best = i
    }
  }
  return best
}

export function densestClusterCenter(
  enemies: SimEnemy[],
  px: number,
  py: number,
  maxRange: number,
): { x: number; y: number } | null {
  let best: SimEnemy | null = null
  let bestCount = 0
  const rangeSq = maxRange * maxRange
  for (const anchor of enemies) {
    const dx = anchor.x - px
    const dy = anchor.y - py
    if (dx * dx + dy * dy > rangeSq) continue
    let count = 0
    for (const other of enemies) {
      const ddx = other.x - anchor.x
      const ddy = other.y - anchor.y
      if (ddx * ddx + ddy * ddy <= 80 * 80) count += 1
    }
    if (count > bestCount) {
      bestCount = count
      best = anchor
    }
  }
  return best ? { x: best.x, y: best.y } : null
}

export function enemiesInRadius(
  enemies: SimEnemy[],
  cx: number,
  cy: number,
  radius: number,
): number[] {
  const rSq = radius * radius
  const hits: number[] = []
  for (let i = 0; i < enemies.length; i += 1) {
    const e = enemies[i]
    const dx = e.x - cx
    const dy = e.y - cy
    if (dx * dx + dy * dy <= rSq) hits.push(i)
  }
  return hits
}

export function enemiesInCone(
  enemies: SimEnemy[],
  px: number,
  py: number,
  dirX: number,
  dirY: number,
  range: number,
  halfAngle: number,
): number[] {
  const len = Math.hypot(dirX, dirY)
  if (len <= 0) return []
  const nx = dirX / len
  const ny = dirY / len
  const hits: number[] = []
  const rangeSq = range * range
  for (let i = 0; i < enemies.length; i += 1) {
    const e = enemies[i]
    const dx = e.x - px
    const dy = e.y - py
    const dSq = dx * dx + dy * dy
    if (dSq > rangeSq || dSq <= 0) continue
    const d = Math.sqrt(dSq)
    const dot = (dx / d) * nx + (dy / d) * ny
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)))
    if (angle <= halfAngle) hits.push(i)
  }
  return hits
}

/** Daña enemigo; si muere lo elimina. Devuelve 1 si hubo kill. */
export function damageEnemyAt(
  enemies: SimEnemy[],
  index: number,
  damage: number,
): number {
  if (index < 0 || index >= enemies.length) return 0
  const e = enemies[index]
  e.hp -= damage
  if (e.hp <= 0) {
    enemies.splice(index, 1)
    return 1
  }
  return 0
}

export function damageEnemyIndices(
  enemies: SimEnemy[],
  indices: number[],
  damage: number,
): number {
  const sorted = [...indices].sort((a, b) => b - a)
  let kills = 0
  for (const idx of sorted) {
    kills += damageEnemyAt(enemies, idx, damage)
  }
  return kills
}
