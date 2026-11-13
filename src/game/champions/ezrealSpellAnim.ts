import * as Phaser from 'phaser'
import { aimFacingFromDirection } from './yasuoAttackAnim'
import type { PlayerFacing } from './playerFacing'

export type EzrealSpellSlot = 'q' | 'w' | 'e' | 'r'

const SPELL_SHEETS: Record<
  EzrealSpellSlot,
  { key: string; url: string; frameWidth: number; frameHeight: number; framesPerRow: number; frameRate: number }
> = {
  q: {
    key: 'ezreal-spell1-sheet-hd',
    url: '/assets/champions/ezreal/spell1_sheet_hd.png?v=1',
    frameWidth: 256,
    frameHeight: 256,
    framesPerRow: 6,
    frameRate: 26,
  },
  w: {
    key: 'ezreal-spell2-sheet-hd',
    url: '/assets/champions/ezreal/spell2_sheet_hd.png?v=1',
    frameWidth: 256,
    frameHeight: 256,
    framesPerRow: 6,
    frameRate: 24,
  },
  e: {
    key: 'ezreal-spell3-sheet-hd',
    url: '/assets/champions/ezreal/spell3_sheet_hd.png?v=1',
    frameWidth: 256,
    frameHeight: 256,
    framesPerRow: 6,
    frameRate: 22,
  },
  r: {
    key: 'ezreal-spell4-sheet-hd',
    url: '/assets/champions/ezreal/spell4_sheet_hd.png?v=1',
    frameWidth: 256,
    frameHeight: 256,
    framesPerRow: 6,
    frameRate: 18,
  },
}

const ANIM_PREFIX = 'ezreal-spell-cast'

type CastRow = 'down' | 'up' | 'side'

function animKey(slot: EzrealSpellSlot, row: CastRow): string {
  return `${ANIM_PREFIX}-${slot}-${row}`
}

function castRowFromAim(facing: PlayerFacing): CastRow {
  if (facing === 'up') return 'up'
  if (facing === 'down') return 'down'
  return 'side'
}

export function loadEzrealSpellCastSheets(scene: Phaser.Scene) {
  for (const slot of Object.keys(SPELL_SHEETS) as EzrealSpellSlot[]) {
    const sheet = SPELL_SHEETS[slot]
    if (scene.textures.exists(sheet.key)) continue
    scene.load.spritesheet(sheet.key, sheet.url, {
      frameWidth: sheet.frameWidth,
      frameHeight: sheet.frameHeight,
    })
  }
}

export function createEzrealSpellCastAnimations(scene: Phaser.Scene) {
  for (const slot of Object.keys(SPELL_SHEETS) as EzrealSpellSlot[]) {
    const sheet = SPELL_SHEETS[slot]
    if (!scene.textures.exists(sheet.key)) continue
    const rows: CastRow[] = ['down', 'up', 'side']
    for (const row of rows) {
      const key = animKey(slot, row)
      if (scene.anims.exists(key)) continue
      const rowIndex = row === 'down' ? 0 : row === 'up' ? 1 : 2
      const start = rowIndex * sheet.framesPerRow
      const end = start + sheet.framesPerRow - 1
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(sheet.key, { start, end }),
        frameRate: sheet.frameRate,
        repeat: 0,
      })
    }
  }
}

export function playEzrealSpellCastAnimation(
  sprite: Phaser.GameObjects.Sprite,
  nx: number,
  ny: number,
  slot: EzrealSpellSlot,
) {
  if (!sprite.anims) return
  const facing = aimFacingFromDirection(nx, ny)
  const row = castRowFromAim(facing)
  const key = animKey(slot, row)
  if (!sprite.scene.anims.exists(key)) return
  sprite.anims.play(key, true)
}

export function isEzrealSpellCastAnimationPlaying(sprite: Phaser.GameObjects.Sprite) {
  const key = sprite.anims.currentAnim?.key ?? ''
  return key.startsWith(`${ANIM_PREFIX}-`)
}
