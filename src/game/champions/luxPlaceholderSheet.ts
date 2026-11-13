import * as Phaser from 'phaser'
import { LUX_CHAMPION } from './lux'
import { championTextureHasFrame, registerNumberedGridFrames } from './championSheetFrames'

const COLS = 4
const ROWS = 4
const FW = 64
const FH = 64

/** Prototipo 4×4 hasta `npm run lux:render`. */
export function ensureLuxPlaceholderSheet(scene: Phaser.Scene) {
  const key = LUX_CHAMPION.sheet.key
  if (scene.textures.exists(key)) {
    if (!championTextureHasFrame(key, scene, 0)) {
      registerNumberedGridFrames(scene, key, FW, FH, COLS, ROWS)
    }
    return
  }

  const g = scene.make.graphics({ x: 0, y: 0 }, false)
  const dress = 0xfde68a
  const hair = 0xfbbf24
  const glow = 0x67e8f9
  const outline = 0x78350f

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const ox = col * FW
      const oy = row * FH
      const bob = row === 0 ? 0 : Math.sin((col + row) * 0.5) * 2
      g.fillStyle(0x000000, 0)
      g.fillRect(ox, oy, FW, FH)
      g.fillStyle(outline, 0.3)
      g.fillEllipse(ox + 32, oy + 48 + bob, 20, 7)
      g.fillStyle(dress, 1)
      g.fillEllipse(ox + 32, oy + 38 + bob, 18, 22)
      g.fillStyle(hair, 1)
      g.fillEllipse(ox + 32, oy + 22 + bob, 16, 14)
      g.fillStyle(glow, 0.85)
      g.fillCircle(ox + 28, oy + 32 + bob, 2)
      g.fillCircle(ox + 36, oy + 32 + bob, 2)
    }
  }

  g.generateTexture(key, COLS * FW, ROWS * FH)
  g.destroy()
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
  registerNumberedGridFrames(scene, key, FW, FH, COLS, ROWS)
}
