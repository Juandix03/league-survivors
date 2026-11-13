import * as Phaser from 'phaser'
import { facingFromVelocity, walk8AnimSuffixFromVelocity } from '../champions/playerFacing'
import {
  BAKED_FRAME,
  bakedAnimKey,
  bakedAnimKey8,
  bakedMinionSheetDirectionMode,
  bakedMinionSheetHasAttackRow,
  type BakedAnimRow,
} from '../../minionPreview/bakedMinionAssets'
import type { MinionPreviewKind } from '../../minionPreview/minionPreviewConstants'
import { MINION_VISUAL_BY_KIND } from './minionVisualConfig'

/** Por debajo de esto casi no hay vector hacia el jugador. */
const TOWARD_EPS = 0.5

export type MinionFacingState = {
  row: BakedAnimRow
  flipX: boolean
}

export function createDefaultMinionFacing(): MinionFacingState {
  return { row: 'idle', flipX: false }
}

function facingToMinionRow(nx: number, ny: number): MinionFacingState {
  const facing = facingFromVelocity(nx, ny)
  switch (facing) {
    case 'down':
      return { row: 'walkDown', flipX: false }
    case 'up':
      return { row: 'walkUp', flipX: false }
    case 'left':
      return { row: 'walkSide', flipX: true }
    case 'right':
      return { row: 'walkSide', flipX: false }
    default:
      return { row: 'idle', flipX: false }
  }
}

function resolveFacing(
  nx: number,
  ny: number,
  prev: MinionFacingState,
): MinionFacingState {
  if (Math.abs(nx) < 1e-6 && Math.abs(ny) < 1e-6) {
    return prev
  }
  return facingToMinionRow(nx, ny)
}

/**
 * Orientación hacia el jugador usando filas del bake (↓ / ↑ / perfil).
 * Perfil: aproximación con `walkSide` + flip horizontal hacia el jugador.
 */
export function syncMinionEnemyAnimation(
  sprite: Phaser.GameObjects.Sprite,
  kind: MinionPreviewKind,
  towardX: number,
  towardY: number,
  distance: number,
  facing: MinionFacingState,
  moving: boolean,
): MinionFacingState {
  const policy = MINION_VISUAL_BY_KIND[kind]
  const dirMode = bakedMinionSheetDirectionMode(sprite.scene, kind)
  let nextFacing = facing

  if (distance > TOWARD_EPS) {
    const nx = towardX / distance
    const ny = towardY / distance
    nextFacing = resolveFacing(nx, ny, facing)
    if (
      policy.avoidSideProfile &&
      dirMode === '4' &&
      nextFacing.row === 'walkSide'
    ) {
      nextFacing = { row: ny < 0 ? 'walkUp' : 'walkDown', flipX: false }
    }
  }

  let animRow: BakedAnimRow = 'idle'
  let flipX = false

  if (policy.moveStyle === 'directionalWalk') {
    if (moving) {
      animRow = nextFacing.row === 'idle' ? 'walkDown' : nextFacing.row
      if (dirMode === '4') {
        flipX =
          !policy.avoidSideProfile && nextFacing.row === 'walkSide'
            ? nextFacing.flipX
            : false
      } else if (distance > TOWARD_EPS) {
        const nx = towardX / distance
        const ny = towardY / distance
        const sideOct =
          Math.abs(nx) >= Math.abs(ny) && Math.abs(nx) > 0.35
        if (sideOct) {
          flipX = nx < 0
        }
      }
    } else {
      animRow = 'idle'
      flipX = false
    }
  } else {
    animRow = 'idle'
    flipX = nextFacing.row === 'walkSide' ? nextFacing.flipX : false
  }

  let key = bakedAnimKey(kind, animRow)
  if (
    dirMode === '8' &&
    policy.moveStyle === 'directionalWalk' &&
    moving &&
    distance > TOWARD_EPS
  ) {
    const nx = towardX / distance
    const ny = towardY / distance
    const suffix = walk8AnimSuffixFromVelocity(nx, ny)
    if (suffix) {
      const key8 = bakedAnimKey8(kind, suffix)
      if (sprite.scene.anims.exists(key8)) {
        key = key8
        flipX = false
      }
    }
  }

  if (sprite.scene.anims.exists(key)) {
    if (sprite.anims.currentAnim?.key !== key) {
      sprite.play(key, true)
    }
  }

  const baseScaleX = Math.abs(sprite.scaleX)
  const baseScaleY = Math.abs(sprite.scaleY)
  sprite.setScale(flipX ? -baseScaleX : baseScaleX, baseScaleY)

  return nextFacing
}

/** Windup de disparo: animación Attack horneada (fila ↓) + orientación hacia Jinx. */
export function syncMinionEnemyAttackAnim(
  sprite: Phaser.GameObjects.Sprite,
  kind: MinionPreviewKind,
  towardX: number,
  towardY: number,
  distance: number,
  facing: MinionFacingState,
  windupMs: number,
): MinionFacingState {
  if (!bakedMinionSheetHasAttackRow(sprite.scene, kind)) {
    return facing
  }

  const key = bakedAnimKey(kind, 'attackDown')
  if (!sprite.scene.anims.exists(key)) {
    return facing
  }

  const policy = MINION_VISUAL_BY_KIND[kind]
  let nextFacing = facing

  const dirMode = bakedMinionSheetDirectionMode(sprite.scene, kind)

  if (distance > TOWARD_EPS) {
    const nx = towardX / distance
    const ny = towardY / distance
    nextFacing = resolveFacing(nx, ny, facing)
    if (
      policy.avoidSideProfile &&
      dirMode === '4' &&
      nextFacing.row === 'walkSide'
    ) {
      nextFacing = { row: ny < 0 ? 'walkUp' : 'walkDown', flipX: false }
    }
  }

  const baseScaleX = Math.abs(sprite.scaleX)
  const baseScaleY = Math.abs(sprite.scaleY)
  let flipX = false

  if (policy.moveStyle === 'directionalWalk') {
    if (dirMode === '4') {
      flipX =
        !policy.avoidSideProfile && nextFacing.row === 'walkSide'
          ? nextFacing.flipX
          : false
    } else if (distance > TOWARD_EPS) {
      const nx = towardX / distance
      const ny = towardY / distance
      const sideOct =
        Math.abs(nx) >= Math.abs(ny) && Math.abs(nx) > 0.35
      if (sideOct) {
        flipX = nx < 0
      }
    }
  } else {
    flipX = nextFacing.row === 'walkSide' ? nextFacing.flipX : false
  }

  // Sin flipY: volteo vertical desalinea frames del bake y deja “cajas” negras.
  sprite.setScale(flipX ? -baseScaleX : baseScaleX, baseScaleY)

  if (sprite.anims.currentAnim?.key !== key) {
    const frameRate = Math.max(
      4,
      (BAKED_FRAME.framesPerCycle / windupMs) * 1000,
    )
    sprite.play({ key, frameRate, repeat: 0 })
  }

  return nextFacing
}
