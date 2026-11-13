import * as Phaser from 'phaser'
import { JINX_VFX } from './jinxVfxConfig'

/** Slice a loaded atlas-style PNG into named frames (no re-download). */
function addGridFrames(
  scene: Phaser.Scene,
  textureKey: string,
  frameW: number,
  frameH: number,
  cols: number,
  rows: number,
  framePrefix: string,
) {
  if (!scene.textures.exists(textureKey)) {
    return
  }
  const texture = scene.textures.get(textureKey)
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col
      const name = `${framePrefix}-${index}`
      if (texture.has(name)) {
        continue
      }
      texture.add(name, 0, col * frameW, row * frameH, frameW, frameH)
    }
  }
}

export const JINX_GUN_HIT_FRAME_PREFIX = `${JINX_VFX.qGunHit}-frame`

export function registerJinxVfxFrames(scene: Phaser.Scene) {
  addGridFrames(scene, JINX_VFX.qGunHit, 256, 256, 2, 2, JINX_GUN_HIT_FRAME_PREFIX)
}

export function randomGunHitFrameKey(scene: Phaser.Scene): string {
  const index = Phaser.Math.Between(0, 3)
  const key = `${JINX_GUN_HIT_FRAME_PREFIX}-${index}`
  if (scene.textures.exists(JINX_VFX.qGunHit) && scene.textures.get(JINX_VFX.qGunHit).has(key)) {
    return key
  }
  return JINX_VFX.qGunHit
}
