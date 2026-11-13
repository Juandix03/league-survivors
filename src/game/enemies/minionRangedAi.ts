import { bakedMinionSheetHasAttackRow } from '../../minionPreview/bakedMinionAssets'
import type { MinionAttackerProfile } from './minionRangedCombatConfig'
import type { ArenaEnemy } from './enemyFactory'
import { syncArenaEnemyMotionAnim } from './enemyFactory'
import { syncMinionEnemyAttackAnim } from './syncMinionEnemyAnim'

export type MinionShotSpawnRequest = {
  fromX: number
  fromY: number
  targetX: number
  targetY: number
  profile: MinionAttackerProfile
  depth: number
}

/**
 * IA ranged/siege: persecución fuera de alcance; en alcance windup → disparo a posición fijada.
 */
export function tickMinionRangedAttacker(
  enemy: ArenaEnemy,
  profile: MinionAttackerProfile,
  combatMs: number,
  step: number,
  moveSpeed: number,
  playerX: number,
  playerY: number,
  onShotReady: (req: MinionShotSpawnRequest) => void,
): void {
  const ex = enemy.visual.x
  const ey = enemy.visual.y
  const dx = playerX - ex
  const dy = playerY - ey
  const distSq = dx * dx + dy * dy
  const rangeSq = profile.range * profile.range
  const distance = distSq > 0 ? Math.sqrt(distSq) : 0

  const completeWindup =
    enemy.windupEndCombatMs > 0 && combatMs >= enemy.windupEndCombatMs

  if (completeWindup) {
    onShotReady({
      fromX: ex,
      fromY: ey,
      targetX: enemy.pendingShotX,
      targetY: enemy.pendingShotY,
      profile,
      depth: ey + 1,
    })
    enemy.windupEndCombatMs = 0
    enemy.nextShotCombatMs = combatMs + profile.fireIntervalMs
    clearWindupVisual(enemy)
    syncArenaEnemyMotionAnim(enemy, dx, dy, distance, false)
    return
  }

  if (enemy.windupEndCombatMs > 0) {
    syncRangedWindupFacing(enemy, profile, dx, dy, distance)
    return
  }

  if (distSq > rangeSq) {
    if (distance > 0) {
      enemy.visual.x += (dx / distance) * moveSpeed * step
      enemy.visual.y += (dy / distance) * moveSpeed * step
    }
    clearWindupVisual(enemy)
    syncArenaEnemyMotionAnim(enemy, dx, dy, distance, true)
    return
  }

  // En alcance: orientar; disparar si CD listo
  if (combatMs >= enemy.nextShotCombatMs) {
    enemy.pendingShotX = playerX
    enemy.pendingShotY = playerY
    enemy.windupEndCombatMs = combatMs + profile.windupMs
    syncRangedWindupFacing(enemy, profile, dx, dy, distance)
    return
  }

  // En alcance, en CD: casi quieto (leve acercamiento si queda lejos del borde interior)
  const creep =
    distance > profile.range * 0.55 && distance > 0
      ? moveSpeed * 0.22 * step
      : 0
  if (creep > 0) {
    enemy.visual.x += (dx / distance) * creep
    enemy.visual.y += (dy / distance) * creep
  }
  clearWindupVisual(enemy)
  syncArenaEnemyMotionAnim(enemy, dx, dy, distance, creep > 0)
}

function syncRangedWindupFacing(
  enemy: ArenaEnemy,
  profile: MinionAttackerProfile,
  dx: number,
  dy: number,
  distance: number,
) {
  if (!enemy.sprite) {
    return
  }
  if (bakedMinionSheetHasAttackRow(enemy.sprite.scene, enemy.minionKind)) {
    enemy.sprite.clearTint()
    enemy.facing = syncMinionEnemyAttackAnim(
      enemy.sprite,
      enemy.minionKind,
      dx,
      dy,
      distance,
      enemy.facing,
      profile.windupMs,
    )
    return
  }
  applyWindupTint(enemy, profile)
  syncArenaEnemyMotionAnim(enemy, dx, dy, distance, false)
}

function applyWindupTint(enemy: ArenaEnemy, profile: MinionAttackerProfile) {
  if (!enemy.sprite) {
    return
  }
  enemy.sprite.setTint(profile.id === 'siege' ? 0xffe4b5 : 0xfef08a)
}

function clearWindupVisual(enemy: ArenaEnemy) {
  const sprite = enemy.sprite
  if (!sprite) {
    return
  }
  sprite.clearTint()
  const baseScaleX = Math.abs(sprite.scaleX)
  const baseScaleY = Math.abs(sprite.scaleY)
  const flipX = sprite.scaleX < 0
  sprite.setScale(flipX ? -baseScaleX : baseScaleX, baseScaleY)
}
