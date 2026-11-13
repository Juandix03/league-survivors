import * as Phaser from 'phaser'
import { aimFacingFromDirection } from './yasuoAttackAnim'
import type { PlayerFacing } from './playerFacing'

export type MissFortuneSpellSlot = 'q' | 'w' | 'e' | 'r'

const SPELL_SHEETS: Record<
  MissFortuneSpellSlot,
  { key: string; url: string; frameWidth: number; frameHeight: number; framesPerRow: number; frameRate: number }
> = {
  q: {
    key: 'missfortune-spell1-sheet-hd',
    url: '/assets/champions/missfortune/spell1_sheet_hd.png?v=2',
    frameWidth: 256,
    frameHeight: 256,
    framesPerRow: 6,
    frameRate: 26,
  },
  w: {
    key: 'missfortune-spell2-sheet-hd',
    url: '/assets/champions/missfortune/spell2_sheet_hd.png?v=2',
    frameWidth: 256,
    frameHeight: 256,
    framesPerRow: 6,
    frameRate: 24,
  },
  e: {
    key: 'missfortune-spell3-sheet-hd',
    url: '/assets/champions/missfortune/spell3_sheet_hd.png?v=2',
    frameWidth: 256,
    frameHeight: 256,
    framesPerRow: 6,
    frameRate: 22,
  },
  r: {
    key: 'missfortune-spell4-sheet-hd',
    url: '/assets/champions/missfortune/spell4_sheet_hd.png?v=2',
    frameWidth: 256,
    frameHeight: 256,
    framesPerRow: 6,
    frameRate: 18,
  },
}

const ANIM_PREFIX = 'missfortune-spell-cast'

type CastRow = 'down' | 'up' | 'side'

function animKey(slot: MissFortuneSpellSlot, row: CastRow): string {
  return `${ANIM_PREFIX}-${slot}-${row}`
}

function castRowFromAim(facing: PlayerFacing): CastRow {
  if (facing === 'up') return 'up'
  if (facing === 'down') return 'down'
  return 'side'
}

export function loadMissFortuneSpellCastSheets(scene: Phaser.Scene) {
  for (const slot of Object.keys(SPELL_SHEETS) as MissFortuneSpellSlot[]) {
    const sheet = SPELL_SHEETS[slot]
    if (!sheet.url || scene.textures.exists(sheet.key)) continue
    scene.load.spritesheet(sheet.key, sheet.url, {
      frameWidth: sheet.frameWidth,
      frameHeight: sheet.frameHeight,
    })
  }
}

function createOneShot(
  scene: Phaser.Scene,
  key: string,
  sheetKey: string,
  start: number,
  end: number,
  frameRate: number,
) {
  if (!scene.textures.exists(sheetKey)) return
  if (scene.anims.exists(key)) scene.anims.remove(key)
  const frames = scene.anims.generateFrameNumbers(sheetKey, { start, end })
  if (frames.length === 0) return
  scene.anims.create({ key, frames, frameRate, repeat: 0 })
}

export function createMissFortuneSpellCastAnimations(scene: Phaser.Scene) {
  for (const slot of Object.keys(SPELL_SHEETS) as MissFortuneSpellSlot[]) {
    const sheet = SPELL_SHEETS[slot]
    if (!scene.textures.exists(sheet.key)) continue
    const fpr = sheet.framesPerRow
    createOneShot(scene, animKey(slot, 'down'), sheet.key, 0, fpr - 1, sheet.frameRate)
    createOneShot(scene, animKey(slot, 'up'), sheet.key, fpr, fpr * 2 - 1, sheet.frameRate)
    createOneShot(
      scene,
      animKey(slot, 'side'),
      sheet.key,
      fpr * 2,
      fpr * 3 - 1,
      sheet.frameRate,
    )
  }
}

function applyCastFlip(sprite: Phaser.Physics.Arcade.Sprite, facing: PlayerFacing, nx: number) {
  if (facing === 'left' || facing === 'right' || facing === 'idle') {
    sprite.setFlipX(nx < 0)
  } else {
    sprite.setFlipX(false)
  }
  sprite.setRotation(0)
}

export function playMissFortuneSpellCastAnimation(
  sprite: Phaser.Physics.Arcade.Sprite,
  nx: number,
  ny: number,
  slot: MissFortuneSpellSlot,
): boolean {
  const facing = aimFacingFromDirection(nx, ny)
  applyCastFlip(sprite, facing, nx)
  const key = animKey(slot, castRowFromAim(facing))
  if (!sprite.scene.anims.exists(key)) return false
  sprite.anims.play(key, true)
  return true
}

export function isMissFortuneSpellCastAnimationPlaying(sprite: Phaser.Physics.Arcade.Sprite): boolean {
  const key = sprite.anims.currentAnim?.key ?? ''
  return sprite.anims.isPlaying && key.startsWith(`${ANIM_PREFIX}-`)
}
