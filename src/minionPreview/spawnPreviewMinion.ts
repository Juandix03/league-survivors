import * as Phaser from 'phaser'
import { MINION_PREVIEW_TEXTURE, type MinionPreviewKind } from './minionPreviewConstants'
import {
  minionBodyRadius as inspiredBodyRadius,
  minionDisplayScale as inspiredDisplayScale,
} from './inspiredMinionTextures'
import {
  riotMinionBodyRadius,
  riotMinionDisplayScale,
  riotMinionTextureKey,
} from './riotMinionAssets'

import type { MinionPreviewArtMode } from './minionPreviewArtMode'
import {
  BAKED_FRAME,
  bakedAnimKey,
  bakedSheetAvailable,
  getBakedSheetDef,
  type BakedAnimRow,
} from './bakedMinionAssets'

const HP_BAR_HEIGHT = 4
const HP_BAR_OFFSET_Y = 8

export type PreviewMinion = {
  kind: MinionPreviewKind
  visual: Phaser.GameObjects.Container
  sprite?: Phaser.GameObjects.Sprite
  hpBarBg: Phaser.GameObjects.Rectangle
  hpBarFill: Phaser.GameObjects.Rectangle
  hpBarMaxWidth: number
  radius: number
}

function hpBarWidthForRadius(radius: number) {
  return Math.max(22, Math.round(radius * 1.85))
}

export function syncPreviewMinionHpBar(minion: PreviewMinion, ratio: number) {
  const r = Phaser.Math.Clamp(ratio, 0, 1)
  minion.hpBarFill.setSize(minion.hpBarMaxWidth * r, HP_BAR_HEIGHT)
}

export function playPreviewMinionBakedAnim(minion: PreviewMinion, row: BakedAnimRow) {
  if (!minion.sprite) {
    return
  }
  const key = bakedAnimKey(minion.kind, row)
  if (minion.sprite.anims.currentAnim?.key !== key) {
    minion.sprite.play(key, true)
  }
}

export function spawnPreviewMinion(
  scene: Phaser.Scene,
  x: number,
  y: number,
  kind: MinionPreviewKind,
  healthRatio = 1,
  artMode: MinionPreviewArtMode = 'riot',
  bakedRow: BakedAnimRow = 'idle',
): PreviewMinion {
  const bakedDef = getBakedSheetDef(kind)
  const useBaked = artMode === 'baked' && bakedDef !== undefined && bakedSheetAvailable(scene, kind)
  const radius = useBaked
    ? 14
    : artMode === 'riot'
      ? riotMinionBodyRadius(kind)
      : inspiredBodyRadius(kind)
  const scale = useBaked
    ? bakedDef!.displayScale
    : artMode === 'riot'
      ? riotMinionDisplayScale(kind)
      : inspiredDisplayScale(kind)
  const barW = hpBarWidthForRadius(radius)
  const barY = -radius - HP_BAR_OFFSET_Y

  const shadow = scene.add.ellipse(0, radius * 0.72, radius * 2.2, radius * 0.55, 0x160c20, 0.4)

  let sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite
  let animSprite: Phaser.GameObjects.Sprite | undefined

  if (useBaked && bakedDef) {
    animSprite = scene.add.sprite(0, 0, bakedDef.sheetKey, 0)
    animSprite.setOrigin(0.5, BAKED_FRAME.originY)
    animSprite.setScale(scale)
    const animKey = bakedAnimKey(kind, bakedRow)
    if (scene.anims.exists(animKey)) {
      animSprite.play(animKey, true)
    }
    sprite = animSprite
  } else {
    const texKey =
      artMode === 'riot' && scene.textures.exists(riotMinionTextureKey(kind))
        ? riotMinionTextureKey(kind)
        : MINION_PREVIEW_TEXTURE[kind]
    const img = scene.add.image(0, 0, texKey)
    img.setScale(scale)
    if (artMode === 'riot') {
      img.setOrigin(0.5, 0.72)
    }
    sprite = img
  }

  const hpBarBg = scene.add.rectangle(-barW / 2, barY, barW, HP_BAR_HEIGHT, 0x0f172a, 0.78)
  hpBarBg.setOrigin(0, 0.5)
  hpBarBg.setStrokeStyle(1, 0x334155, 0.9)

  const hpBarFill = scene.add.rectangle(-barW / 2, barY, barW, HP_BAR_HEIGHT, 0x4ade80, 1)
  hpBarFill.setOrigin(0, 0.5)

  const visual = scene.add.container(x, y, [shadow, sprite, hpBarBg, hpBarFill])
  visual.setDepth(y)

  const minion: PreviewMinion = {
    kind,
    visual,
    sprite: animSprite,
    hpBarBg,
    hpBarFill,
    hpBarMaxWidth: barW,
    radius,
  }
  syncPreviewMinionHpBar(minion, healthRatio)
  return minion
}
