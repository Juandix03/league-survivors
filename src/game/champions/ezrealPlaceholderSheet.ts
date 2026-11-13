import * as Phaser from 'phaser'
import { EZREAL_CHAMPION } from './ezreal'
import {
  championTextureHasFrame,
  registerNumberedGridFrames,
} from './championSheetFrames'
import { WALK8_OCTANT_SUFFIX } from './playerFacing'

const COLS = 8
const ROWS = 9
const FW = 128
const FH = 128

/** Placeholder 8-dir si el bake Khada aún no está en `public/`. */
export function ensureEzrealPlaceholderSheet(scene: Phaser.Scene) {
  const key = EZREAL_CHAMPION.sheet.key
  if (scene.textures.exists(key) && championTextureHasFrame(key, scene, 0)) {
    return
  }
  if (scene.textures.exists(key)) {
    scene.textures.remove(key)
  }

  const g = scene.make.graphics({ x: 0, y: 0 }, false)
  const coat = 0x1e3a8a
  const gold = 0xfbbf24
  const glove = 0x38bdf8

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const ox = col * FW
      const oy = row * FH
      const bob = row === 0 ? 0 : Math.sin((col + row) * 0.45) * 2
      const lean = row > 0 ? (col - 3.5) * 0.9 : 0
      g.fillStyle(0x000000, 0)
      g.fillRect(ox, oy, FW, FH)
      g.fillStyle(coat, 1)
      g.fillEllipse(ox + 64 + lean, oy + 78 + bob, 22, 28)
      g.fillStyle(gold, 1)
      g.fillRoundedRect(ox + 54 + lean, oy + 58 + bob, 20, 10, 3)
      g.fillStyle(glove, 1)
      g.fillCircle(ox + 78 + lean, oy + 64 + bob, 7)
      if (row > 0) {
        const dir = WALK8_OCTANT_SUFFIX[(row - 1) % WALK8_OCTANT_SUFFIX.length]
        g.lineStyle(2, gold, 0.65)
        if (dir.includes('right')) g.lineBetween(ox + 88, oy + 72 + bob, ox + 102, oy + 68 + bob)
        if (dir.includes('left')) g.lineBetween(ox + 40, oy + 72 + bob, ox + 26, oy + 68 + bob)
      }
    }
  }
  g.generateTexture(key, FW * COLS, FH * ROWS)
  g.destroy()

  const config = EZREAL_CHAMPION
  if (config.sheet.frameWidth !== FW || config.sheet.frameHeight !== FH) {
    // Registry usa frames numerados sobre la textura generada (128²).
    registerNumberedGridFrames(scene, key, FW, FH, COLS, ROWS)
  } else {
    registerNumberedGridFrames(scene, key, FW, FH, COLS, ROWS)
  }
}
