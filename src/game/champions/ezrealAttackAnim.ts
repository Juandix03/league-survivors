import type * as Phaser from 'phaser'
import { aimFacingFromDirection } from './yasuoAttackAnim'
import { EZREAL_ATTACK_SHEET } from './ezreal'
import type { PlayerFacing } from './playerFacing'

export const EZREAL_ATTACK_ANIM_PREFIX = 'ezreal-attack'

export const EZREAL_ATTACK_ANIM = {
  down: `${EZREAL_ATTACK_ANIM_PREFIX}-down`,
  up: `${EZREAL_ATTACK_ANIM_PREFIX}-up`,
  side: `${EZREAL_ATTACK_ANIM_PREFIX}-side`,
} as const

type AttackRow = keyof typeof EZREAL_ATTACK_ANIM

function attackRowFromAim(facing: PlayerFacing): AttackRow {
  if (facing === 'up') return 'up'
  if (facing === 'down') return 'down'
  return 'side'
}

function applyAttackFlip(sprite: Phaser.Physics.Arcade.Sprite, facing: PlayerFacing, nx: number) {
  if (facing === 'left' || facing === 'right' || facing === 'idle') {
    sprite.setFlipX(nx < 0)
  } else {
    sprite.setFlipX(false)
  }
  sprite.setRotation(0)
}

export function loadEzrealAttackSheet(scene: Phaser.Scene) {
  if (scene.textures.exists(EZREAL_ATTACK_SHEET.key)) return
  scene.load.spritesheet(EZREAL_ATTACK_SHEET.key, EZREAL_ATTACK_SHEET.url, {
    frameWidth: EZREAL_ATTACK_SHEET.frameWidth,
    frameHeight: EZREAL_ATTACK_SHEET.frameHeight,
  })
}

export function createEzrealAttackAnimation(scene: Phaser.Scene) {
  if (!scene.textures.exists(EZREAL_ATTACK_SHEET.key)) return
  const sheet = EZREAL_ATTACK_SHEET
  const rows: AttackRow[] = ['down', 'up', 'side']
  for (let row = 0; row < rows.length; row += 1) {
    const animKey = EZREAL_ATTACK_ANIM[rows[row]]
    if (scene.anims.exists(animKey)) continue
    const start = row * sheet.framesPerRow
    const end = start + sheet.framesPerRow - 1
    scene.anims.create({
      key: animKey,
      frames: scene.anims.generateFrameNumbers(sheet.key, { start, end }),
      frameRate: sheet.frameRate,
      repeat: 0,
    })
  }
}

export function playEzrealAttackAnimation(
  sprite: Phaser.Physics.Arcade.Sprite,
  nx: number,
  ny: number,
) {
  const facing = aimFacingFromDirection(nx, ny)
  const row = attackRowFromAim(facing)
  applyAttackFlip(sprite, facing, nx)
  const key = EZREAL_ATTACK_ANIM[row]
  if (!sprite.scene.anims.exists(key)) return false
  sprite.anims.play(key, true)
  return true
}

export function isEzrealAttackAnimationPlaying(sprite: Phaser.Physics.Arcade.Sprite) {
  const key = sprite.anims.currentAnim?.key ?? ''
  return sprite.anims.isPlaying && key.startsWith(`${EZREAL_ATTACK_ANIM_PREFIX}-`)
}

export function isEzrealCombatAnimationPlaying(sprite: Phaser.Physics.Arcade.Sprite) {
  return (
    isEzrealAttackAnimationPlaying(sprite) ||
    (sprite.anims.currentAnim?.key ?? '').startsWith('ezreal-spell-cast-')
  )
}
