import * as Phaser from 'phaser'
import { MINION_PREVIEW_TEXTURE, type MinionPreviewKind } from './minionPreviewConstants'

const FRAME = 64

type Team = 'order' | 'chaos'
type Role = 'melee' | 'ranged' | 'siege' | 'super'

const TEAM = {
  order: { armor: 0x2563eb, armorHi: 0x60a5fa, cloth: 0x1e3a8a, skin: 0xd4a574 },
  chaos: { armor: 0xb91c1c, armorHi: 0xf87171, cloth: 0x7f1d1d, skin: 0xc4a882 },
} as const

function drawMinion(
  g: Phaser.GameObjects.Graphics,
  team: Team,
  role: Role,
) {
  const t = TEAM[team]
  g.fillStyle(0x000000, 0)
  g.fillRect(0, 0, FRAME, FRAME)

  const cx = FRAME / 2
  const cy = FRAME * 0.58
  const scale =
    role === 'super' ? 1.22 : role === 'siege' ? 1.05 : role === 'ranged' ? 0.88 : 1

  g.fillStyle(0x120812, 0.35)
  g.fillEllipse(cx, cy + 14 * scale, 28 * scale, 10 * scale)

  g.fillStyle(t.skin, 1)
  g.fillCircle(cx, cy - 6 * scale, 9 * scale)
  g.fillStyle(0x1a1020, 0.85)
  g.fillCircle(cx - 3 * scale, cy - 7 * scale, 2.2 * scale)
  g.fillCircle(cx + 3 * scale, cy - 7 * scale, 2.2 * scale)

  if (role === 'super') {
    g.fillStyle(0xfbbf24, 0.95)
    g.fillCircle(cx - 3.5 * scale, cy - 7 * scale, 2.8 * scale)
    g.fillCircle(cx + 3.5 * scale, cy - 7 * scale, 2.8 * scale)
  }

  g.fillStyle(t.cloth, 1)
  g.fillEllipse(cx, cy + 4 * scale, 14 * scale, 12 * scale)
  g.fillStyle(t.armor, 1)
  g.fillRoundedRect(cx - 11 * scale, cy - 2 * scale, 22 * scale, 14 * scale, 4)

  g.fillStyle(t.armorHi, 0.9)
  g.fillRect(cx - 9 * scale, cy, 6 * scale, 8 * scale)
  g.fillRect(cx + 3 * scale, cy, 6 * scale, 8 * scale)

  if (role === 'melee' || role === 'super') {
    g.lineStyle(2.5, 0xc0c4cc, 1)
    g.lineBetween(cx + 10 * scale, cy + 2 * scale, cx + 22 * scale, cy - 10 * scale)
    g.fillStyle(0x94a3b8, 1)
    g.fillTriangle(
      cx + 22 * scale,
      cy - 10 * scale,
      cx + 26 * scale,
      cy - 6 * scale,
      cx + 20 * scale,
      cy - 4 * scale,
    )
  }

  if (role === 'ranged') {
    g.lineStyle(2, 0x78350f, 1)
    g.lineBetween(cx + 8 * scale, cy + 4 * scale, cx + 24 * scale, cy - 2 * scale)
    g.fillStyle(0xa16207, 1)
    g.fillCircle(cx + 24 * scale, cy - 2 * scale, 3 * scale)
  }

  if (role === 'siege' || role === 'super') {
    g.fillStyle(0x475569, 1)
    g.fillRoundedRect(cx - 18 * scale, cy + 6 * scale, 14 * scale, 8 * scale, 2)
    g.fillStyle(0x64748b, 1)
    g.fillCircle(cx - 11 * scale, cy + 10 * scale, 5 * scale)
  }

  if (role === 'super') {
    g.lineStyle(2, team === 'order' ? 0x93c5fd : 0xfca5a5, 0.85)
    g.strokeCircle(cx, cy + 2 * scale, 20 * scale)
  }
}

function bakeKey(scene: Phaser.Scene, key: string, draw: (g: Phaser.GameObjects.Graphics) => void) {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key)
  }
  const g = scene.add.graphics()
  draw(g)
  g.generateTexture(key, FRAME, FRAME)
  g.destroy()
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
}

export function rebakeInspiredMinionTextures(scene: Phaser.Scene) {
  const pairs: [MinionPreviewKind, (g: Phaser.GameObjects.Graphics) => void][] = [
    ['orderMelee', (g) => drawMinion(g, 'order', 'melee')],
    ['chaosMelee', (g) => drawMinion(g, 'chaos', 'melee')],
    ['orderRanged', (g) => drawMinion(g, 'order', 'ranged')],
    ['chaosRanged', (g) => drawMinion(g, 'chaos', 'ranged')],
    ['orderSiege', (g) => drawMinion(g, 'order', 'siege')],
    ['chaosSiege', (g) => drawMinion(g, 'chaos', 'siege')],
    ['orderSuper', (g) => drawMinion(g, 'order', 'super')],
    ['chaosSuper', (g) => drawMinion(g, 'chaos', 'super')],
  ]
  for (const [kind, draw] of pairs) {
    bakeKey(scene, MINION_PREVIEW_TEXTURE[kind], draw)
  }
}

export function minionDisplayScale(kind: MinionPreviewKind): number {
  if (kind.includes('Super')) return 1.35
  if (kind.includes('Siege')) return 1.12
  if (kind.includes('Ranged')) return 0.92
  return 1
}

export function minionBodyRadius(kind: MinionPreviewKind): number {
  const base = 13
  return Math.round(base * minionDisplayScale(kind))
}
