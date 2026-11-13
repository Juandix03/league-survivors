import * as Phaser from 'phaser'
import { WORLD_HEIGHT, WORLD_WIDTH } from '../constants'

const WORLD_PAD = 40
/** Margen extra (unidades mundo) más allá del borde visible antes de spawnear. */
const VIEW_OUTSET = 72
/** Distancia extra aleatoria tras quedar fuera de pantalla (evita spawn demasiado lejos). */
const EXTRA_DIST_MIN = 24
const EXTRA_DIST_MAX = 120
const MAX_ATTEMPTS = 28

function isOutsideExpandedView(
  x: number,
  y: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
): boolean {
  return x < left || x > right || y < top || y > bottom
}

/**
 * Posición aleatoria alrededor del jugador, fuera del rectángulo visible de la cámara (+ margen).
 * Usa `camera.worldView` (scroll, zoom y tamaño del viewport).
 */
export function pickOffScreenSpawnAroundPlayer(
  scene: Phaser.Scene,
  playerX: number,
  playerY: number,
): { x: number; y: number } {
  const cam = scene.cameras.main
  const view = cam.worldView

  const halfW = view.width * 0.5
  const halfH = view.height * 0.5
  const viewRadius = Math.hypot(halfW, halfH)
  const minDistFromPlayer = viewRadius + VIEW_OUTSET

  const innerLeft = view.x - VIEW_OUTSET
  const innerRight = view.x + view.width + VIEW_OUTSET
  const innerTop = view.y - VIEW_OUTSET
  const innerBottom = view.y + view.height + VIEW_OUTSET

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const angle = Math.random() * Math.PI * 2
    const dist =
      minDistFromPlayer +
      EXTRA_DIST_MIN +
      Math.random() * (EXTRA_DIST_MAX - EXTRA_DIST_MIN)

    let x = playerX + Math.cos(angle) * dist
    let y = playerY + Math.sin(angle) * dist

    x = Phaser.Math.Clamp(x, WORLD_PAD, WORLD_WIDTH - WORLD_PAD)
    y = Phaser.Math.Clamp(y, WORLD_PAD, WORLD_HEIGHT - WORLD_PAD)

    const fromPlayer = Math.hypot(x - playerX, y - playerY)
    if (fromPlayer < minDistFromPlayer * 0.92) {
      continue
    }

    if (
      isOutsideExpandedView(x, y, innerLeft, innerRight, innerTop, innerBottom)
    ) {
      return { x, y }
    }
  }

  // Fallback: borde del rectángulo expandido en dirección aleatoria
  const angle = Math.random() * Math.PI * 2
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const cx = view.x + halfW
  const cy = view.y + halfH
  const pad = VIEW_OUTSET + EXTRA_DIST_MIN
  let x = cx + cos * (halfW + pad)
  let y = cy + sin * (halfH + pad)
  x = Phaser.Math.Clamp(x, WORLD_PAD, WORLD_WIDTH - WORLD_PAD)
  y = Phaser.Math.Clamp(y, WORLD_PAD, WORLD_HEIGHT - WORLD_PAD)
  return { x, y }
}
