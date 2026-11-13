import * as Phaser from 'phaser'
import { TEXTURE } from './constants'

function bake(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
  options?: { force?: boolean },
) {
  if (options?.force && scene.textures.exists(key)) {
    scene.textures.remove(key)
  }
  if (scene.textures.exists(key)) {
    return
  }

  const graphics = scene.add.graphics()
  draw(graphics)
  graphics.generateTexture(key, width, height)
  graphics.destroy()
}

/** Runeterra-inspired meadow palette (reference: bright top-down field). */
const C = {
  grassA: 0x8ec65a,
  grassB: 0x7ab648,
  grassC: 0xa3d66e,
  grassD: 0x6fa842,
  dirt: 0x9a7b5a,
  dirtDark: 0x6d5340,
  outline: 0x2d4a22,
  outlineSoft: 0x3e5c32,
  rock: 0x8a939e,
  rockHi: 0xc5cdd8,
  rockLo: 0x5c6570,
  leaf: 0x3d7a32,
  leafHi: 0x5fa84a,
  leafDeep: 0x2f5f28,
  petal: 0xb794f6,
  petalHi: 0xe9d5ff,
  water: 0x5ec8e8,
  waterHi: 0xb8f0ff,
} as const

/** Tile del pasto (px). Cambiar si se invalida bake en caliente. */
export const GRASS_TILE = 192

function tileHash(ix: number, iy: number, seed: number): number {
  let n = (ix * 374761393 + iy * 668265263 + seed * 1442695041) >>> 0
  n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0
  return (n ^ (n >>> 16)) / 4294967296
}

/** Señal continua con periodo exacto del tile (sin costuras al repetir). */
function meadowField(x: number, y: number, phase: number): number {
  const nx = (x / GRASS_TILE) * Math.PI * 2
  const ny = (y / GRASS_TILE) * Math.PI * 2
  return (
    Math.sin(nx * 2 + phase) * 0.38 +
    Math.cos(ny * 2 + phase * 0.65) * 0.34 +
    Math.sin((nx + ny) * 3 + phase * 1.1) * 0.22 +
    Math.cos((nx - ny) * 5 + phase * 0.4) * 0.12
  )
}

function withWrappedOffsets(
  x: number,
  y: number,
  radius: number,
  fn: (wx: number, wy: number) => void,
) {
  const shifts = [{ ox: 0, oy: 0 }]
  if (x - radius < 0) {
    shifts.push({ ox: GRASS_TILE, oy: 0 })
  }
  if (x + radius > GRASS_TILE) {
    shifts.push({ ox: -GRASS_TILE, oy: 0 })
  }
  if (y - radius < 0) {
    shifts.push({ ox: 0, oy: GRASS_TILE })
  }
  if (y + radius > GRASS_TILE) {
    shifts.push({ ox: 0, oy: -GRASS_TILE })
  }
  const corner =
    (x - radius < 0 && y - radius < 0) ||
    (x + radius > GRASS_TILE && y - radius < 0) ||
    (x - radius < 0 && y + radius > GRASS_TILE) ||
    (x + radius > GRASS_TILE && y + radius > GRASS_TILE)
  if (corner) {
    shifts.push(
      { ox: GRASS_TILE, oy: GRASS_TILE },
      { ox: -GRASS_TILE, oy: GRASS_TILE },
      { ox: GRASS_TILE, oy: -GRASS_TILE },
      { ox: -GRASS_TILE, oy: -GRASS_TILE },
    )
  }

  const seen = new Set<string>()
  for (const { ox, oy } of shifts) {
    const key = `${ox},${oy}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    fn(x + ox, y + oy)
  }
}

function drawGrassBlade(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  seed: number,
) {
  const len = 3.5 + tileHash(x, y, seed) * 5
  const tilt = (tileHash(y, x, seed + 17) - 0.5) * 2.8
  withWrappedOffsets(x, y, 8, (wx, wy) => {
    g.lineBetween(wx, wy, wx + tilt, wy - len)
  })
}

/** Pasto tileable estilo fantasía — capa base de la arena. */
function tileGrassBase(g: Phaser.GameObjects.Graphics, variant: 0 | 1) {
  const phase = variant === 0 ? 0.35 : 2.1
  const seed = variant === 0 ? 11 : 29

  g.fillStyle(C.grassB, 1)
  g.fillRect(0, 0, GRASS_TILE, GRASS_TILE)

  for (let i = 0; i < 48; i += 1) {
    const cx = (i * 41 + seed * 7) % GRASS_TILE
    const cy = (i * 59 + seed * 13) % GRASS_TILE
    const field = meadowField(cx, cy, phase)
    const r = 12 + tileHash(i, seed, 1) * 28
    withWrappedOffsets(cx, cy, r, (wx, wy) => {
      g.fillStyle(field > 0 ? C.grassC : C.grassA, 0.08 + Math.abs(field) * 0.14)
      g.fillEllipse(wx, wy, r * 1.15, r * 0.85)
    })
  }

  for (let cell = 0; cell < 6; cell += 1) {
    const cx = (cell * 73 + seed * 13) % GRASS_TILE
    const cy = (cell * 89 + seed * 17) % GRASS_TILE
    withWrappedOffsets(cx, cy, 14, (wx, wy) => {
      g.fillStyle(C.dirt, 0.16 + tileHash(cell, cy, 5) * 0.12)
      g.fillEllipse(wx, wy, 22 + cell * 2, 14 + cell)
      g.fillStyle(C.dirtDark, 0.1)
      g.fillEllipse(wx + 2, wy + 1, 14, 9)
    })
  }

  const bladeColor = variant === 0 ? C.outlineSoft : C.grassD
  g.lineStyle(1.35, bladeColor, 0.52)
  for (let i = 0; i < 72; i += 1) {
    const bx = (i * 23 + seed * 7) % GRASS_TILE
    const by = (i * 37 + seed * 13) % GRASS_TILE
    drawGrassBlade(g, bx, by, seed + i)
  }

  g.lineStyle(1.05, C.grassC, 0.45)
  for (let i = 0; i < 40; i += 1) {
    const bx = (i * 29 + seed * 3 + 8) % GRASS_TILE
    const by = (i * 43 + seed * 11 + 4) % GRASS_TILE
    drawGrassBlade(g, bx, by, seed + i + 100)
  }

  g.fillStyle(C.leafHi, variant === 0 ? 0.28 : 0.22)
  for (let i = 0; i < 18; i += 1) {
    const px = (i * 53 + seed * 2) % GRASS_TILE
    const py = (i * 67 + seed * 5) % GRASS_TILE
    withWrappedOffsets(px, py, 5, (wx, wy) => {
      g.fillCircle(wx, wy, 3 + (i % 3))
    })
  }

  g.lineStyle(1.8, C.outline, 0.08)
  for (let i = 0; i < 5; i += 1) {
    const y = ((i * 41 + seed * 19) % (GRASS_TILE - 20)) + 10
    g.lineBetween(0, y, GRASS_TILE, y + (variant === 0 ? 6 : -5))
  }
}

/** Regenera pasto aunque la textura ya exista (evita bake obsoleto tras HMR / reinicio de escena). */
export function rebakeGrassTextures(scene: Phaser.Scene) {
  bake(scene, TEXTURE.grass, GRASS_TILE, GRASS_TILE, (g) => tileGrassBase(g, 0), {
    force: true,
  })
  bake(scene, TEXTURE.grassAlt, GRASS_TILE, GRASS_TILE, (g) => tileGrassBase(g, 1), {
    force: true,
  })

  for (const key of [TEXTURE.grass, TEXTURE.grassAlt] as const) {
    if (scene.textures.exists(key)) {
      scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
    }
  }
}

export function bakeArenaTextures(scene: Phaser.Scene) {
  rebakeGrassTextures(scene)

  bake(scene, TEXTURE.dirtPatch, 192, 144, (g) => {
    g.fillStyle(C.dirt, 1)
    g.fillEllipse(96, 78, 168, 108)
    g.fillStyle(C.dirtDark, 0.55)
    g.fillEllipse(88, 86, 120, 72)
    g.lineStyle(3, C.outline, 0.35)
    g.strokeEllipse(96, 78, 168, 108)
    g.lineStyle(1.5, C.dirtDark, 0.65)
    g.lineBetween(48, 70, 120, 92)
    g.lineBetween(72, 58, 130, 74)
    g.lineBetween(60, 98, 140, 88)
    g.fillStyle(C.grassB, 0.35)
    g.fillCircle(42, 52, 8)
    g.fillCircle(148, 62, 6)
  })

  bake(scene, TEXTURE.powPowBolt, 18, 8, (g) => {
    g.fillStyle(0xf472b6, 1)
    g.fillRoundedRect(1, 1, 14, 5, 2)
    g.fillStyle(0xfdf2f8, 1)
    g.fillCircle(15, 4, 2.5)
    g.fillStyle(0x22d3ee, 0.95)
    g.fillCircle(3, 4, 1.8)
    g.lineStyle(1, 0xfbcfe8, 0.85)
    g.strokeRoundedRect(1, 1, 14, 5, 2)
  })

  bake(scene, TEXTURE.ahriSpiritBolt, 14, 14, (g) => {
    g.fillStyle(0x0284c7, 0.28)
    g.fillCircle(7, 7, 6.5)
    g.fillStyle(0x38bdf8, 0.85)
    g.fillCircle(7, 7, 4.2)
    g.fillStyle(0xbae6fd, 1)
    g.fillCircle(7, 7, 2.6)
    g.fillStyle(0xffffff, 0.95)
    g.fillCircle(5.5, 5.2, 1.1)
    g.lineStyle(1, 0x7dd3fc, 0.75)
    g.strokeCircle(7, 7, 5.2)
  })

  bake(scene, TEXTURE.ahriQOrb, 36, 36, (g) => {
    g.fillStyle(0x1d4ed8, 0.22)
    g.fillCircle(18, 18, 16)
    g.fillStyle(0x3b82f6, 0.45)
    g.fillCircle(18, 18, 13)
    g.fillStyle(0x60a5fa, 0.92)
    g.fillCircle(18, 18, 10)
    g.fillStyle(0x93c5fd, 1)
    g.fillCircle(18, 18, 7.2)
    g.fillStyle(0xe0f2fe, 1)
    g.fillCircle(18, 18, 4.5)
    g.fillStyle(0xffffff, 0.98)
    g.fillCircle(14.5, 13.5, 2.2)
    g.lineStyle(1.5, 0xc4b5fd, 0.55)
    g.strokeCircle(18, 18, 11.5)
    g.lineStyle(1, 0xbfdbfe, 0.85)
    g.strokeCircle(18, 18, 7.8)
  })

  bake(scene, TEXTURE.zapBolt, 22, 6, (g) => {
    g.fillStyle(0x67e8f9, 1)
    g.fillRoundedRect(0, 1, 18, 4, 2)
    g.fillStyle(0xffffff, 0.95)
    g.fillCircle(19, 3, 2.5)
    g.lineStyle(1, 0x22d3ee, 0.9)
    g.strokeRoundedRect(0, 1, 18, 4, 2)
  })

  bake(scene, TEXTURE.zapHit, 20, 20, (g) => {
    g.lineStyle(2, 0x67e8f9, 1)
    g.lineBetween(10, 2, 10, 18)
    g.lineBetween(2, 10, 18, 10)
    g.fillStyle(0xe0f2fe, 0.85)
    g.fillCircle(10, 10, 4)
  })

  bake(scene, TEXTURE.chomperTrap, 24, 24, (g) => {
    g.fillStyle(0xea580c, 1)
    g.fillCircle(12, 13, 9)
    g.fillStyle(0xfbbf24, 1)
    g.fillTriangle(12, 4, 6, 11, 18, 11)
    g.fillStyle(0x1c1917, 1)
    g.fillCircle(9, 14, 2)
    g.fillCircle(15, 14, 2)
    g.lineStyle(1.5, 0x7c2d12, 0.9)
    g.strokeCircle(12, 13, 9)
  })

  bake(scene, TEXTURE.megaRocket, 36, 12, (g) => {
    g.fillStyle(0x7c3aed, 1)
    g.fillRoundedRect(2, 2, 28, 8, 3)
    g.fillStyle(0xf472b6, 1)
    g.fillTriangle(30, 6, 36, 3, 36, 9)
    g.fillStyle(0xfde68a, 1)
    g.fillRect(6, 4, 4, 4)
    g.lineStyle(1.2, 0x4c1d95, 1)
    g.strokeRoundedRect(2, 2, 28, 8, 3)
  })

  bake(scene, TEXTURE.fishbonesRocket, 28, 14, (g) => {
    g.fillStyle(0x6b21a8, 1)
    g.fillRoundedRect(2, 3, 22, 8, 3)
    g.fillStyle(0xf472b6, 1)
    g.fillTriangle(24, 7, 28, 4, 28, 10)
    g.fillStyle(0xa855f7, 0.9)
    g.fillCircle(8, 7, 3)
    g.fillStyle(0xfde68a, 1)
    g.fillRect(4, 5, 3, 4)
    g.lineStyle(1.2, 0x4c1d95, 0.9)
    g.strokeRoundedRect(2, 3, 22, 8, 3)
  })

  bake(scene, TEXTURE.bush, 64, 52, (g) => {
    g.fillStyle(C.outline, 0.25)
    g.fillEllipse(32, 46, 44, 10)
    g.fillStyle(C.leafDeep, 1)
    g.fillCircle(22, 28, 16)
    g.fillCircle(40, 26, 17)
    g.fillCircle(32, 18, 15)
    g.lineStyle(2.5, C.outline, 0.85)
    g.strokeCircle(22, 28, 16)
    g.strokeCircle(40, 26, 17)
    g.strokeCircle(32, 18, 15)
    g.fillStyle(C.leaf, 1)
    g.fillCircle(26, 26, 9)
    g.fillCircle(36, 24, 8)
    g.fillStyle(C.leafHi, 0.9)
    g.fillCircle(28, 22, 4)
    g.fillCircle(34, 20, 3)
  })

  bake(scene, TEXTURE.bushTall, 72, 64, (g) => {
    g.fillStyle(C.outline, 0.22)
    g.fillEllipse(36, 58, 38, 9)
    g.fillStyle(C.leafDeep, 1)
    g.fillCircle(24, 36, 18)
    g.fillCircle(48, 34, 19)
    g.fillCircle(36, 22, 17)
    g.fillCircle(30, 14, 12)
    g.lineStyle(2.5, C.outline, 0.9)
    g.strokeCircle(24, 36, 18)
    g.strokeCircle(48, 34, 19)
    g.strokeCircle(36, 22, 17)
    g.fillStyle(C.leaf, 1)
    g.fillCircle(28, 32, 10)
    g.fillCircle(42, 30, 9)
    g.fillStyle(C.petalHi, 0.95)
    g.fillCircle(52, 40, 3)
    g.fillCircle(20, 38, 2.5)
  })

  bake(scene, TEXTURE.rock, 48, 36, (g) => {
    g.fillStyle(C.outline, 0.25)
    g.fillEllipse(24, 30, 32, 9)
    g.fillStyle(C.rockLo, 1)
    g.fillEllipse(24, 20, 34, 22)
    g.lineStyle(2, C.outline, 0.8)
    g.strokeEllipse(24, 20, 34, 22)
    g.fillStyle(C.rock, 1)
    g.fillEllipse(18, 17, 14, 10)
    g.fillStyle(C.rockHi, 1)
    g.fillEllipse(16, 14, 8, 5)
    g.fillStyle(C.rockLo, 1)
    g.fillEllipse(30, 22, 10, 6)
  })

  bake(scene, TEXTURE.rockCluster, 80, 56, (g) => {
    g.fillStyle(C.outline, 0.22)
    g.fillEllipse(40, 48, 56, 12)
    g.fillStyle(C.rockLo, 1)
    g.fillEllipse(28, 32, 28, 20)
    g.fillEllipse(52, 28, 26, 22)
    g.fillEllipse(40, 38, 22, 16)
    g.lineStyle(2.2, C.outline, 0.85)
    g.strokeEllipse(28, 32, 28, 20)
    g.strokeEllipse(52, 28, 26, 22)
    g.fillStyle(C.rockHi, 1)
    g.fillEllipse(22, 26, 10, 6)
    g.fillEllipse(48, 22, 9, 5)
  })

  bake(scene, TEXTURE.pebble, 16, 12, (g) => {
    g.fillStyle(C.rockLo, 1)
    g.fillEllipse(8, 7, 12, 8)
    g.lineStyle(1, C.outline, 0.6)
    g.strokeEllipse(8, 7, 12, 8)
    g.fillStyle(C.rockHi, 0.8)
    g.fillEllipse(6, 5, 4, 3)
  })

  bake(scene, TEXTURE.flower, 24, 28, (g) => {
    g.lineStyle(2, C.outline, 0.75)
    g.lineBetween(12, 12, 12, 26)
    g.fillStyle(C.leaf, 1)
    g.fillEllipse(9, 20, 6, 3)
    g.fillEllipse(15, 18, 5, 3)
    g.fillStyle(C.petal, 1)
    g.fillCircle(8, 10, 4)
    g.fillCircle(16, 10, 4)
    g.fillCircle(12, 6, 4)
    g.fillCircle(12, 14, 4)
    g.lineStyle(1.5, C.outline, 0.7)
    g.strokeCircle(8, 10, 4)
    g.strokeCircle(16, 10, 4)
    g.fillStyle(C.petalHi, 1)
    g.fillCircle(12, 10, 2.5)
  })

  bake(scene, TEXTURE.grassTuft, 20, 24, (g) => {
    g.lineStyle(2, C.outline, 0.65)
    g.lineBetween(10, 20, 8, 8)
    g.lineBetween(10, 20, 12, 6)
    g.lineBetween(10, 20, 14, 9)
    g.fillStyle(C.leafHi, 1)
    g.fillTriangle(8, 8, 6, 14, 10, 12)
    g.fillTriangle(12, 6, 10, 12, 14, 11)
    g.fillTriangle(14, 9, 11, 13, 16, 14)
  })

  bake(scene, TEXTURE.waterPuddle, 64, 48, (g) => {
    g.fillStyle(C.water, 0.85)
    g.fillEllipse(32, 28, 52, 34)
    g.lineStyle(2, C.outline, 0.45)
    g.strokeEllipse(32, 28, 52, 34)
    g.fillStyle(C.waterHi, 0.65)
    g.fillEllipse(24, 22, 18, 10)
    g.fillStyle(C.grassB, 0.5)
    g.fillCircle(48, 36, 4)
    g.fillCircle(18, 34, 3)
  })

  bake(scene, TEXTURE.xpCrystal, 28, 32, (g) => {
    g.fillStyle(0x0c4a6e, 0.35)
    g.fillEllipse(14, 26, 16, 6)
    g.fillStyle(0x22d3ee, 1)
    g.fillTriangle(14, 4, 6, 18, 22, 18)
    g.fillStyle(0x67e8f9, 1)
    g.fillTriangle(14, 8, 9, 17, 19, 17)
    g.fillStyle(0xf0fdff, 1)
    g.fillCircle(12, 14, 2.2)
    g.lineStyle(1.5, 0xa5f3fc, 0.9)
    g.strokeTriangle(14, 4, 6, 18, 22, 18)
    g.lineStyle(1, 0xfbbf24, 0.85)
    g.strokeCircle(14, 14, 9)
  })

  bake(scene, TEXTURE.rune, 120, 120, (g) => {
    g.lineStyle(3, 0x7c3aed, 0.35)
    g.strokeCircle(60, 60, 48)
    g.lineStyle(1.5, 0xfbbf24, 0.28)
    g.strokeCircle(60, 60, 34)
    g.lineStyle(1, 0xa78bfa, 0.45)
    g.strokeCircle(60, 60, 18)
    g.fillStyle(0xc4b5fd, 0.35)
    g.fillCircle(60, 12, 3)
    g.fillCircle(60, 108, 3)
    g.fillCircle(12, 60, 3)
    g.fillCircle(108, 60, 3)
  })
}
