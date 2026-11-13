import * as Phaser from 'phaser'
import { AHRI_CHAMPION } from './ahri'
import {
  championTextureHasFrame,
  registerNumberedGridFrames,
} from './championSheetFrames'

const COLS = 4
const ROWS = 4
const FW = 64
const FH = 64

/** Prototipo visual 4×4 hasta pipeline Ahri (CDragon/GLB). */
export function ensureAhriPlaceholderSheet(scene: Phaser.Scene) {
  const key = AHRI_CHAMPION.sheet.key
  if (scene.textures.exists(key)) {
    if (!championTextureHasFrame(key, scene, 0)) {
      registerNumberedGridFrames(scene, key, FW, FH, COLS, ROWS)
    }
    return
  }

  const g = scene.make.graphics({ x: 0, y: 0 }, false)
  const body = 0xc026d3
  const tail = 0x7c3aed
  const ear = 0xf9a8d4
  const outline = 0x4a044e

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const ox = col * FW
      const oy = row * FH
      const phase = (col + row * 0.7) * 0.4
      const bob = row === 0 ? 0 : Math.sin(phase) * 2

      g.fillStyle(0x000000, 0)
      g.fillRect(ox, oy, FW, FH)

      g.fillStyle(outline, 0.35)
      g.fillEllipse(ox + 32, oy + 48 + bob, 22, 8)

      g.fillStyle(body, 1)
      g.fillEllipse(ox + 32, oy + 36 + bob, 20, 24)
      g.fillStyle(tail, 0.85)
      g.fillTriangle(
        ox + 18,
        oy + 40 + bob,
        ox + 8,
        oy + 52 + bob,
        ox + 22,
        oy + 48 + bob,
      )
      g.fillStyle(ear, 1)
      g.fillTriangle(ox + 24, oy + 18 + bob, ox + 20, oy + 28 + bob, ox + 28, oy + 26 + bob)
      g.fillTriangle(ox + 40, oy + 18 + bob, ox + 36, oy + 26 + bob, ox + 44, oy + 28 + bob)
      g.fillStyle(0xffffff, 0.9)
      g.fillCircle(ox + 28, oy + 34 + bob, 2.2)
      g.fillCircle(ox + 36, oy + 34 + bob, 2.2)
    }
  }

  g.generateTexture(key, COLS * FW, ROWS * FH)
  g.destroy()
  const texture = scene.textures.get(key)
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST)

  const frameCount = registerNumberedGridFrames(scene, key, FW, FH, COLS, ROWS)
  if (frameCount === 0 && !texture.has('0')) {
    console.error(
      '[ahri-sheet] Procedural sheet missing numbered frames; animations will fail.',
    )
  }
}
