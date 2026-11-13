import * as Phaser from 'phaser'
import { ARENA_DECOR_SEED, TEXTURE, WORLD_HEIGHT, WORLD_WIDTH } from '../constants'
import { MEADOW_COMBAT_CLEAR_RADIUS } from './meadowConfig'

type DecorSpec = {
  key: string
  scale: number
  minDistFromCenter: number
  weight: number
}

const DECOR: DecorSpec[] = [
  { key: TEXTURE.bush, scale: 0.95, minDistFromCenter: 680, weight: 4 },
  { key: TEXTURE.bushTall, scale: 0.82, minDistFromCenter: 980, weight: 1 },
  { key: TEXTURE.rock, scale: 1, minDistFromCenter: 720, weight: 2 },
  { key: TEXTURE.pebble, scale: 1, minDistFromCenter: 640, weight: 3 },
  { key: TEXTURE.flower, scale: 1, minDistFromCenter: 650, weight: 2 },
  { key: TEXTURE.grassTuft, scale: 1, minDistFromCenter: 620, weight: 3 },
]

function hash01(seed: number, i: number): number {
  let n = (seed * 1664525 + i * 1013904223) >>> 0
  n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0
  return (n ^ (n >>> 16)) / 4294967296
}

function pickDecor(i: number): DecorSpec {
  const total = DECOR.reduce((s, d) => s + d.weight, 0)
  let r = hash01(ARENA_DECOR_SEED, i * 3 + 11) * total
  for (const d of DECOR) {
    r -= d.weight
    if (r <= 0) {
      return d
    }
  }
  return DECOR[0]
}

export function scatterArenaEdgeDecor(scene: Phaser.Scene): Phaser.GameObjects.Image[] {
  const cx = WORLD_WIDTH / 2
  const cy = WORLD_HEIGHT / 2
  const maxDist = Math.hypot(cx, cy) - 80
  const attempts = 58
  const sprites: Phaser.GameObjects.Image[] = []

  for (let i = 0; i < attempts; i++) {
    const spec = pickDecor(i)
    const angle = hash01(ARENA_DECOR_SEED, i * 5 + 1) * Math.PI * 2
    const distBase = MEADOW_COMBAT_CLEAR_RADIUS + 40
    const dist =
      distBase + hash01(ARENA_DECOR_SEED, i * 7 + 3) * (maxDist - distBase)
    if (dist < spec.minDistFromCenter) {
      continue
    }

    let x = cx + Math.cos(angle) * dist
    let y = cy + Math.sin(angle) * dist

    const edgeBias = hash01(ARENA_DECOR_SEED, i * 9 + 5)
    if (edgeBias > 0.55) {
      const side = Math.floor(hash01(ARENA_DECOR_SEED, i * 11) * 4)
      const inset = 100 + hash01(ARENA_DECOR_SEED, i * 13) * 220
      if (side === 0) {
        y = inset
      } else if (side === 1) {
        y = WORLD_HEIGHT - inset
      } else if (side === 2) {
        x = inset
      } else {
        x = WORLD_WIDTH - inset
      }
    }

    x = Phaser.Math.Clamp(x, 48, WORLD_WIDTH - 48)
    y = Phaser.Math.Clamp(y, 48, WORLD_HEIGHT - 48)
    if (Math.hypot(x - cx, y - cy) < MEADOW_COMBAT_CLEAR_RADIUS) {
      continue
    }

    if (!scene.textures.exists(spec.key)) {
      continue
    }

    const img = scene.add.image(x, y, spec.key)
    img.setScale(spec.scale)
    img.setDepth(y)
    sprites.push(img)
  }

  return sprites
}
