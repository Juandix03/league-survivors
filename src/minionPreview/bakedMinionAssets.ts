import * as Phaser from 'phaser'
import {
  WALK8_OCTANT_SUFFIX,
  type Walk8OctantSuffix,
} from '../game/champions/playerFacing'
import type { MinionPreviewKind } from './minionPreviewConstants'

/**
 * Spritesheet bake: 256×256 (4 filas) o 256×320 (5 filas con attack en ranged/siege).
 * Filas: idle / walk↓ / walk↑ / walk→ [/ attack↓]
 */
export const BAKED_FRAME = {
  frameWidth: 64,
  frameHeight: 64,
  framesPerCycle: 4,
  originY: 0.72,
} as const

export type BakedAnimRow = 'idle' | 'walkDown' | 'walkUp' | 'walkSide' | 'attackDown'

/** Minions con fila de ataque horneada (caster + cañón). */
export const BAKED_ATTACK_MINION_KINDS: MinionPreviewKind[] = [
  'orderRanged',
  'chaosRanged',
  'orderSiege',
  'chaosSiege',
]

/** Incrementar si cambia el PNG (p. ej. 256→320 con fila attack) para evitar caché rota. */
export const BAKED_MINION_SHEET_QUERY = 'v=4'

export type BakedMinionSheetDef = {
  kind: MinionPreviewKind
  sheetKey: string
  url: string
  displayScale: number
}

function bakedSheetUrl(path: string) {
  return `${path}?${BAKED_MINION_SHEET_QUERY}`
}

export const BAKED_MINION_SHEETS: BakedMinionSheetDef[] = [
  {
    kind: 'orderMelee',
    sheetKey: 'baked_minion_order_melee',
    url: bakedSheetUrl('/assets/minions-preview/baked/order-melee.png'),
    displayScale: 1.05,
  },
  {
    kind: 'chaosMelee',
    sheetKey: 'baked_minion_chaos_melee',
    url: bakedSheetUrl('/assets/minions-preview/baked/chaos-melee.png'),
    displayScale: 1.05,
  },
  {
    kind: 'orderRanged',
    sheetKey: 'baked_minion_order_ranged',
    url: bakedSheetUrl('/assets/minions-preview/baked/order-ranged.png'),
    displayScale: 1.02,
  },
  {
    kind: 'chaosRanged',
    sheetKey: 'baked_minion_chaos_ranged',
    url: bakedSheetUrl('/assets/minions-preview/baked/chaos-ranged.png'),
    displayScale: 1.02,
  },
  {
    kind: 'orderSiege',
    sheetKey: 'baked_minion_order_siege',
    url: bakedSheetUrl('/assets/minions-preview/baked/order-siege.png'),
    displayScale: 0.98,
  },
  {
    kind: 'chaosSiege',
    sheetKey: 'baked_minion_chaos_siege',
    url: bakedSheetUrl('/assets/minions-preview/baked/chaos-siege.png'),
    displayScale: 0.98,
  },
  {
    kind: 'orderSuper',
    sheetKey: 'baked_minion_order_super',
    url: bakedSheetUrl('/assets/minions-preview/baked/order-super.png'),
    displayScale: 1.08,
  },
  {
    kind: 'chaosSuper',
    sheetKey: 'baked_minion_chaos_super',
    url: bakedSheetUrl('/assets/minions-preview/baked/chaos-super.png'),
    displayScale: 1.08,
  },
]

const sheetByKind = new Map(BAKED_MINION_SHEETS.map((s) => [s.kind, s]))

export function getBakedSheetDef(kind: MinionPreviewKind): BakedMinionSheetDef | undefined {
  return sheetByKind.get(kind)
}

/** @deprecated use getBakedSheetDef('orderMelee') */
export const BAKED_ORDER_MELEE = {
  sheetKey: BAKED_MINION_SHEETS[0].sheetKey,
  url: BAKED_MINION_SHEETS[0].url,
  frameWidth: BAKED_FRAME.frameWidth,
  frameHeight: BAKED_FRAME.frameHeight,
  framesPerCycle: BAKED_FRAME.framesPerCycle,
  displayScale: BAKED_MINION_SHEETS[0].displayScale,
  originY: BAKED_FRAME.originY,
} as const

export function bakedAnimKey(kind: MinionPreviewKind, row: BakedAnimRow): string {
  return `baked-${kind}-${row}`
}

export function bakedAnimKey8(kind: MinionPreviewKind, suffix: Walk8OctantSuffix): string {
  return `baked-${kind}-walk-${suffix}`
}

function bakedSheetPixelHeight(scene: Phaser.Scene, kind: MinionPreviewKind): number {
  const def = getBakedSheetDef(kind)
  if (!def || !scene.textures.exists(def.sheetKey)) {
    return 0
  }
  const tex = scene.textures.get(def.sheetKey)
  const src = tex.getSourceImage() as { height?: number }
  return src?.height ?? 0
}

/** Detecta bake 8-dir por alto del PNG (9×64 = 576, +attack 640). */
export function bakedMinionSheetDirectionMode(
  scene: Phaser.Scene,
  kind: MinionPreviewKind,
): '4' | '8' {
  const h = bakedSheetPixelHeight(scene, kind)
  if (h >= BAKED_FRAME.frameHeight * 9) {
    return '8'
  }
  const def = getBakedSheetDef(kind)
  if (def && scene.textures.exists(def.sheetKey)) {
    const frameTotal = scene.textures.get(def.sheetKey).frameTotal
    if (frameTotal >= BAKED_FRAME.framesPerCycle * 9) {
      return '8'
    }
  }
  return '4'
}

const ROW_FRAME_START: Record<BakedAnimRow, number> = {
  idle: 0,
  walkDown: 4,
  walkUp: 8,
  walkSide: 12,
  attackDown: 16,
}

export function bakedMinionSheetHasAttackRow(scene: Phaser.Scene, kind: MinionPreviewKind): boolean {
  const h = bakedSheetPixelHeight(scene, kind)
  if (h <= 0) {
    return false
  }
  const mode = bakedMinionSheetDirectionMode(scene, kind)
  if (mode === '8') {
    return h >= BAKED_FRAME.frameHeight * 10
  }
  return h >= BAKED_FRAME.frameHeight * 5
}

export function loadBakedMinionSheets(scene: Phaser.Scene) {
  for (const def of BAKED_MINION_SHEETS) {
    if (scene.textures.exists(def.sheetKey)) {
      continue
    }
    scene.load.spritesheet(def.sheetKey, def.url, {
      frameWidth: BAKED_FRAME.frameWidth,
      frameHeight: BAKED_FRAME.frameHeight,
    })
  }
}

/** @deprecated */
export function loadBakedOrderMeleeSheet(scene: Phaser.Scene) {
  loadBakedMinionSheets(scene)
}

export function createBakedMinionAnimations(scene: Phaser.Scene) {
  const { framesPerCycle } = BAKED_FRAME
  const n = framesPerCycle
  let any = false

  for (const def of BAKED_MINION_SHEETS) {
    if (!scene.textures.exists(def.sheetKey)) {
      continue
    }
    any = true
    scene.textures.get(def.sheetKey).setFilter(Phaser.Textures.FilterMode.NEAREST)

    const mode = bakedMinionSheetDirectionMode(scene, def.kind)

    if (mode === '8') {
      const idleKey = bakedAnimKey(def.kind, 'idle')
      if (scene.anims.exists(idleKey)) scene.anims.remove(idleKey)
      scene.anims.create({
        key: idleKey,
        frames: scene.anims.generateFrameNumbers(def.sheetKey, { start: 0, end: n - 1 }),
        frameRate: 8,
        repeat: -1,
      })
      for (let i = 0; i < WALK8_OCTANT_SUFFIX.length; i += 1) {
        const suffix = WALK8_OCTANT_SUFFIX[i]
        const start = n * (1 + i)
        const key = bakedAnimKey8(def.kind, suffix)
        if (scene.anims.exists(key)) scene.anims.remove(key)
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(def.sheetKey, {
            start,
            end: start + n - 1,
          }),
          frameRate: 10,
          repeat: -1,
        })
      }
      if (bakedMinionSheetHasAttackRow(scene, def.kind)) {
        const start = n * 9
        const key = bakedAnimKey(def.kind, 'attackDown')
        if (scene.anims.exists(key)) scene.anims.remove(key)
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(def.sheetKey, {
            start,
            end: start + n - 1,
          }),
          frameRate: 12,
          repeat: 0,
        })
      }
    } else {
      const rows: { row: BakedAnimRow; rate: number; repeat: number }[] = [
        { row: 'idle', rate: 8, repeat: -1 },
        { row: 'walkDown', rate: 10, repeat: -1 },
        { row: 'walkUp', rate: 10, repeat: -1 },
        { row: 'walkSide', rate: 10, repeat: -1 },
      ]

      if (bakedMinionSheetHasAttackRow(scene, def.kind)) {
        rows.push({ row: 'attackDown', rate: 12, repeat: 0 })
      }

      for (const { row, rate, repeat } of rows) {
        const key = bakedAnimKey(def.kind, row)
        const start = ROW_FRAME_START[row]
        if (scene.anims.exists(key)) {
          scene.anims.remove(key)
        }
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(def.sheetKey, {
            start,
            end: start + n - 1,
          }),
          frameRate: rate,
          repeat,
        })
      }
    }
  }
  return any
}

export function bakedSheetAvailable(scene: Phaser.Scene, kind: MinionPreviewKind): boolean {
  const def = getBakedSheetDef(kind)
  return def ? scene.textures.exists(def.sheetKey) : false
}

export function bakedSheetsLoadedCount(scene: Phaser.Scene): number {
  return BAKED_MINION_SHEETS.filter((d) => scene.textures.exists(d.sheetKey)).length
}
