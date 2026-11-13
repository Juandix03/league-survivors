import * as Phaser from 'phaser'
import { JINX_SPELL_VFX } from './jinxSpellVfxConfig'

const W_BOLT_COLS = 3
const W_BOLT_ROWS = 3
const W_BOLT_SHEET = 256
const W_BOLT_CELL = Math.floor(W_BOLT_SHEET / W_BOLT_COLS)

export const JINX_W_BOLT_FRAME_PREFIX = `${JINX_SPELL_VFX.wBoltAtlas}-frame`

/** Index in row-major 3×3 atlas (CommunityDragon `jinx_base_w_lightning02`). */
/** Cell with a forward-pointing bolt silhouette (row-major 3×3). */
export const JINX_W_BOLT_PROJECTILE_FRAME = 3

export function registerJinxSpellVfxFrames(scene: Phaser.Scene) {
  if (!scene.textures.exists(JINX_SPELL_VFX.wBoltAtlas)) {
    return
  }
  const texture = scene.textures.get(JINX_SPELL_VFX.wBoltAtlas)
  for (let row = 0; row < W_BOLT_ROWS; row += 1) {
    for (let col = 0; col < W_BOLT_COLS; col += 1) {
      const index = row * W_BOLT_COLS + col
      const name = `${JINX_W_BOLT_FRAME_PREFIX}-${index}`
      if (texture.has(name)) {
        continue
      }
      texture.add(
        name,
        0,
        col * W_BOLT_CELL,
        row * W_BOLT_CELL,
        W_BOLT_CELL,
        W_BOLT_CELL,
      )
    }
  }
}

export function jinxWBoltFrameKey(frameIndex: number): string {
  return `${JINX_W_BOLT_FRAME_PREFIX}-${frameIndex}`
}
