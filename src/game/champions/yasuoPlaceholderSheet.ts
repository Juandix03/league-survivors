import * as Phaser from 'phaser'
import { YASUO_CHAMPION } from './yasuo'
import {
  championTextureHasFrame,
  registerNumberedGridFrames,
} from './championSheetFrames'

const COLS = 4
const ROWS = 4
const FW = 64
const FH = 64

export function ensureYasuoPlaceholderSheet(scene: Phaser.Scene) {
  const key = YASUO_CHAMPION.sheet.key
  if (scene.textures.exists(key)) {
    if (!championTextureHasFrame(key, scene, 0)) {
      registerNumberedGridFrames(scene, key, FW, FH, COLS, ROWS)
    }
    return
  }

  const g = scene.make.graphics({ x: 0, y: 0 }, false)
  const coat = 0x1e293b
  const steel = 0x94a3b8
  const wind = 0x38bdf8

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const ox = col * FW
      const oy = row * FH
      const bob = row === 0 ? 0 : Math.sin((col + row) * 0.5) * 2
      g.fillStyle(0x000000, 0)
      g.fillRect(ox, oy, FW, FH)
      g.fillStyle(coat, 1)
      g.fillEllipse(ox + 32, oy + 38 + bob, 18, 22)
      g.fillStyle(steel, 1)
      g.fillRect(ox + 26, oy + 28 + bob, 12, 4)
      g.lineStyle(2, wind, 0.7)
      g.beginPath()
      g.moveTo(ox + 44, oy + 32 + bob)
      g.lineTo(ox + 58, oy + 26 + bob)
      g.strokePath()
    }
  }
  g.generateTexture(key, FW * COLS, FH * ROWS)
  g.destroy()
  registerNumberedGridFrames(scene, key, FW, FH, COLS, ROWS)
}
