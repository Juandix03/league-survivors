import * as Phaser from 'phaser'
import { YASUO_ATTACK_SHEET, YASUO_Q_STEEL_SHEET } from './yasuo'
import { facingFromVelocity, type PlayerFacing } from './playerFacing'

export const YASUO_ATTACK_ANIM = 'yasuo-attack'
export const YASUO_Q_STEEL_ANIM_PREFIX = 'yasuo-q-steel'

export const YASUO_Q_STEEL_ANIM = {
  down: `${YASUO_Q_STEEL_ANIM_PREFIX}-down`,
  up: `${YASUO_Q_STEEL_ANIM_PREFIX}-up`,
  side: `${YASUO_Q_STEEL_ANIM_PREFIX}-side`,
} as const

function loadSheet(
  scene: Phaser.Scene,
  sheet: { key: string; url: string; frameWidth: number; frameHeight: number },
) {
  if (!sheet.url || scene.textures.exists(sheet.key)) return
  scene.load.spritesheet(sheet.key, sheet.url, {
    frameWidth: sheet.frameWidth,
    frameHeight: sheet.frameHeight,
  })
}

function createOneShotRange(
  scene: Phaser.Scene,
  animKey: string,
  sheetKey: string,
  startFrame: number,
  endFrame: number,
  frameRate: number,
) {
  if (!scene.textures.exists(sheetKey)) return
  if (scene.anims.exists(animKey)) scene.anims.remove(animKey)
  const animFrames = scene.anims.generateFrameNumbers(sheetKey, { start: startFrame, end: endFrame })
  if (animFrames.length === 0) return
  scene.anims.create({ key: animKey, frames: animFrames, frameRate, repeat: 0 })
}

export function loadYasuoAttackSheet(scene: Phaser.Scene) {
  loadSheet(scene, YASUO_ATTACK_SHEET)
  loadSheet(scene, YASUO_Q_STEEL_SHEET)
}

export function createYasuoAttackAnimation(scene: Phaser.Scene) {
  const q = YASUO_Q_STEEL_SHEET
  const fpr = q.framesPerRow
  createOneShotRange(
    scene,
    YASUO_ATTACK_ANIM,
    YASUO_ATTACK_SHEET.key,
    0,
    YASUO_ATTACK_SHEET.frames - 1,
    YASUO_ATTACK_SHEET.frameRate,
  )
  createOneShotRange(scene, YASUO_Q_STEEL_ANIM.down, q.key, 0, fpr - 1, q.frameRate)
  createOneShotRange(scene, YASUO_Q_STEEL_ANIM.up, q.key, fpr, fpr * 2 - 1, q.frameRate)
  createOneShotRange(scene, YASUO_Q_STEEL_ANIM.side, q.key, fpr * 2, fpr * 3 - 1, q.frameRate)
}

/** Misma regla que caminar: arriba/abajo vs lateral. */
export function aimFacingFromDirection(nx: number, ny: number): PlayerFacing {
  const len = Math.hypot(nx, ny)
  if (len < 0.01) return 'down'
  return facingFromVelocity(nx / len, ny / len)
}

function pickQSteelAnim(facing: PlayerFacing): string {
  if (facing === 'up') return YASUO_Q_STEEL_ANIM.up
  if (facing === 'down') return YASUO_Q_STEEL_ANIM.down
  return YASUO_Q_STEEL_ANIM.side
}

function applyCombatFlip(sprite: Phaser.Physics.Arcade.Sprite, facing: PlayerFacing, nx: number) {
  if (facing === 'left' || facing === 'right' || facing === 'idle') {
    sprite.setFlipX(nx < 0)
  } else {
    sprite.setFlipX(false)
  }
  sprite.setRotation(0)
}

function playAnim(sprite: Phaser.Physics.Arcade.Sprite, animKey: string): boolean {
  if (!sprite.scene.anims.exists(animKey)) return false
  sprite.anims.play(animKey, true)
  return true
}

/** Autoataque — Attack1 (bake lateral; flip izq/der). */
export function playYasuoAttackAnimation(
  sprite: Phaser.Physics.Arcade.Sprite,
  nx: number,
  ny: number,
) {
  const facing = aimFacingFromDirection(nx, ny)
  applyCombatFlip(sprite, facing === 'up' || facing === 'down' ? 'right' : facing, nx)
  return playAnim(sprite, YASUO_ATTACK_ANIM)
}

/** Q — Spell1A según dirección de apuntado. */
export function playYasuoSteelTempestAnimation(
  sprite: Phaser.Physics.Arcade.Sprite,
  nx: number,
  ny: number,
) {
  const facing = aimFacingFromDirection(nx, ny)
  applyCombatFlip(sprite, facing, nx)
  return playAnim(sprite, pickQSteelAnim(facing))
}

export function isYasuoCombatAnimationPlaying(sprite: Phaser.Physics.Arcade.Sprite): boolean {
  const key = sprite.anims.currentAnim?.key ?? ''
  return (
    sprite.anims.isPlaying &&
    (key === YASUO_ATTACK_ANIM || key.startsWith(`${YASUO_Q_STEEL_ANIM_PREFIX}-`))
  )
}

export function isYasuoAttackAnimationPlaying(sprite: Phaser.Physics.Arcade.Sprite): boolean {
  return isYasuoCombatAnimationPlaying(sprite)
}
