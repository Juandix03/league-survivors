import * as Phaser from 'phaser'
import { EZREAL_ANIM, EZREAL_BA_BOLT_SHEET, EZREAL_BA_BOLT_SPRITE } from './ezrealBakedSprites'
import { EZREAL_SPELL_VFX } from './ezrealAuthenticSpellVfx'
import { createEzrealEssenceFluxBoltVisual } from './ezrealEssenceFluxVisual'
import { createEzrealTrueshotBoltVisual } from './ezrealTrueshotVisual'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

/** Cabeza dorado-arcana del básico (cliente usa ba_glow + ba_mis en cinta). */
const BA_HEAD_TINT = 0xfff0c8
const BA_TRAIL_TINT = 0x8fe8ff
const BA_WISP_TINT = 0x67e8f9
const Q_CORE_TINT = 0xf8feff
const Q_TRAIL_TINT = 0x4fd4ff
const Q_SPARK_TINT = 0xa8ebff
/** Mismo release que el básico (Attack1a ~frame 3 @ 26fps). */
export const EZREAL_BOLT_RELEASE_MS = 110
export const EZREAL_Q_RELEASE_MS = EZREAL_BOLT_RELEASE_MS

function pick(scene: Phaser.Scene, ...keys: string[]): string | null {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

export type EzrealBoltVisual = {
  root: Phaser.GameObjects.Container
  visualDx?: number
  visualDy?: number
  scrollTrail?: () => void
}

export function spawnEzrealBasicCast(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const glowKey = pick(scene, EZREAL_SPELL_VFX.baGlow)
  if (glowKey) {
    const glow = scene.add.image(x, y, glowKey)
    glow.setDepth(depth + 4)
    glow.setRotation(angle)
    glow.setDisplaySize(14, 10)
    glow.setAlpha(0.75)
    glow.setBlendMode(ADD)
    glow.setTint(BA_HEAD_TINT)
    scene.tweens.add({
      targets: glow,
      alpha: 0,
      scaleX: 1.15,
      duration: 95,
      onComplete: () => glow.destroy(),
    })
  }
  const wispKey = pick(scene, EZREAL_SPELL_VFX.baWhisps)
  if (wispKey) {
    const wisp = scene.add.image(x + Math.cos(angle) * 6, y + Math.sin(angle) * 6, wispKey)
    wisp.setDepth(depth + 3)
    wisp.setRotation(angle)
    wisp.setDisplaySize(16, 10)
    wisp.setAlpha(0.45)
    wisp.setBlendMode(ADD)
    wisp.setTint(BA_WISP_TINT)
    scene.tweens.add({
      targets: wisp,
      alpha: 0,
      duration: 110,
      onComplete: () => wisp.destroy(),
    })
  }
}

export function spawnEzrealMysticCast(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const along = (d: number) => ({
    x: x + Math.cos(angle) * d,
    y: y + Math.sin(angle) * d,
  })
  const glowKey = pick(scene, EZREAL_SPELL_VFX.baGlow)
  if (glowKey) {
    const glow = scene.add.image(x, y, glowKey)
    glow.setDepth(depth + 5)
    glow.setRotation(angle)
    glow.setDisplaySize(20, 16)
    glow.setAlpha(0.92)
    glow.setBlendMode(ADD)
    glow.setTint(Q_CORE_TINT)
    scene.tweens.add({
      targets: glow,
      alpha: 0,
      scale: 1.4,
      duration: 130,
      onComplete: () => glow.destroy(),
    })
  }
  const sparkKey = pick(scene, EZREAL_SPELL_VFX.qHitSpark)
  if (sparkKey) {
    const p = along(8)
    const spark = scene.add.image(p.x, p.y, sparkKey)
    spark.setDepth(depth + 6)
    spark.setRotation(angle)
    spark.setDisplaySize(16, 16)
    spark.setAlpha(0.98)
    spark.setBlendMode(ADD)
    spark.setTint(0xffffff)
    scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 1.55,
      duration: 150,
      onComplete: () => spark.destroy(),
    })
  }
}

function createEzrealMysticShotLayers(scene: Phaser.Scene, root: Phaser.GameObjects.Container) {
  const trailKey = pick(scene, EZREAL_SPELL_VFX.qTrail, EZREAL_SPELL_VFX.zBeaconTrail)

  let trailBack: Phaser.GameObjects.TileSprite | null = null
  let trailMain: Phaser.GameObjects.TileSprite | null = null
  const trailAnchorX = -1
  const trailLen = 46
  if (trailKey) {
    trailBack = scene.add.tileSprite(trailAnchorX, 0, trailLen, 10, trailKey)
    trailBack.setOrigin(1, 0.5)
    trailBack.setAlpha(0.22)
    trailBack.setBlendMode(ADD)
    trailBack.setTint(Q_TRAIL_TINT)
    trailBack.setTileScale(0.088, 0.075)
    root.add(trailBack)

    trailMain = scene.add.tileSprite(trailAnchorX, 0, trailLen, 9, trailKey)
    trailMain.setOrigin(1, 0.5)
    trailMain.setAlpha(0.78)
    trailMain.setBlendMode(ADD)
    trailMain.setTint(Q_TRAIL_TINT)
    trailMain.setTileScale(0.092, 0.09)
    root.add(trailMain)
  }

  const wispsKey = pick(scene, EZREAL_SPELL_VFX.baWhisps)
  if (wispsKey) {
    const wisps = scene.add.image(-10, 0, wispsKey)
    wisps.setOrigin(1, 0.5)
    wisps.setDisplaySize(18, 9)
    wisps.setBlendMode(ADD)
    wisps.setTint(Q_TRAIL_TINT)
    wisps.setAlpha(0.4)
    root.add(wisps)
  }

  const headGlowKey = pick(scene, EZREAL_SPELL_VFX.baGlow)
  if (headGlowKey) {
    const headGlow = scene.add.image(-2, 0, headGlowKey)
    headGlow.setDisplaySize(16, 14)
    headGlow.setBlendMode(ADD)
    headGlow.setTint(Q_CORE_TINT)
    headGlow.setAlpha(0.98)
    root.add(headGlow)
  }

  const sparkKey = pick(scene, EZREAL_SPELL_VFX.qHitSpark)
  if (sparkKey) {
    const tip = scene.add.image(0, 0, sparkKey)
    tip.setOrigin(0.78, 0.5)
    tip.setDisplaySize(17, 17)
    tip.setBlendMode(ADD)
    tip.setTint(0xffffff)
    tip.setAlpha(0.96)
    root.add(tip)
  }

  return {
    scrollTrail:
      trailMain || trailBack
        ? () => {
            if (trailMain) trailMain.tilePositionX -= 5.4
            if (trailBack) trailBack.tilePositionX -= 4.2
          }
        : undefined,
  }
}

export function createEzrealBoltVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
  kind: 'ba' | 'q' | 'w' | 'r',
  rBeamWidth = 48,
): EzrealBoltVisual {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 5)
  root.setRotation(angle)

  if (kind === 'ba') {
    const sheetReady = scene.textures.exists(EZREAL_BA_BOLT_SHEET.key)
    const singleReady = scene.textures.exists(EZREAL_BA_BOLT_SPRITE.key)
    if (sheetReady || singleReady) {
      const key = sheetReady ? EZREAL_BA_BOLT_SHEET.key : EZREAL_BA_BOLT_SPRITE.key
      const bolt = sheetReady
        ? scene.add.sprite(0, 0, key, 0)
        : scene.add.image(0, 0, key)
      bolt.setOrigin(0.82, 0.5)
      bolt.setDisplaySize(52, 14)
      bolt.setBlendMode(ADD)
      bolt.setTint(BA_HEAD_TINT)
      bolt.setAlpha(0.94)
      if (sheetReady && bolt instanceof Phaser.GameObjects.Sprite && scene.anims.exists(EZREAL_ANIM.baBolt)) {
        bolt.play(EZREAL_ANIM.baBolt)
      }
      root.add(bolt)
      return { root }
    }

    let trail: Phaser.GameObjects.TileSprite | null = null
    const baTrailKey = pick(scene, EZREAL_SPELL_VFX.baMis)
    if (baTrailKey) {
      trail = scene.add.tileSprite(-10, 0, 24, 5, baTrailKey)
      trail.setOrigin(1, 0.5)
      trail.setAlpha(0.58)
      trail.setBlendMode(ADD)
      trail.setTint(BA_TRAIL_TINT)
      trail.setTileScale(0.11, 0.11)
      root.add(trail)
    }
    const headKey = pick(scene, EZREAL_SPELL_VFX.baGlow)
    if (headKey) {
      const head = scene.add.image(3, 0, headKey)
      head.setDisplaySize(9, 9)
      head.setBlendMode(ADD)
      head.setTint(BA_HEAD_TINT)
      head.setAlpha(0.92)
      root.add(head)
    }
    const wispKey = pick(scene, EZREAL_SPELL_VFX.baWhisps)
    if (wispKey) {
      const wisp = scene.add.image(-5, 0, wispKey)
      wisp.setDisplaySize(12, 7)
      wisp.setBlendMode(ADD)
      wisp.setTint(BA_WISP_TINT)
      wisp.setAlpha(0.4)
      root.add(wisp)
    }
    return {
      root,
      scrollTrail: trail
        ? () => {
            trail!.tilePositionX -= 2.8
          }
        : undefined,
    }
  }

  if (kind === 'q') {
    const layered = createEzrealMysticShotLayers(scene, root)
    return { root, scrollTrail: layered.scrollTrail }
  }

  if (kind === 'w') {
    return createEzrealEssenceFluxBoltVisual(scene, x, y, angle, depth)
  }

  if (kind === 'r') {
    return createEzrealTrueshotBoltVisual(scene, x, y, angle, depth, rBeamWidth)
  }

  return { root }
}

export function updateEzrealBoltVisual(vis: EzrealBoltVisual, x: number, y: number) {
  vis.root.setPosition(x + (vis.visualDx ?? 0), y + (vis.visualDy ?? 0))
  vis.scrollTrail?.()
}

export function spawnEzrealImpact(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  heavy = false,
  basic = false,
  mystic = false,
) {
  const sparkKey = pick(scene, EZREAL_SPELL_VFX.qHitSpark)
  if (sparkKey) {
    const spark = scene.add.image(x, y, sparkKey)
    spark.setDepth(depth + 2)
    const sz = heavy ? 22 : basic ? 11 : mystic ? 18 : 14
    spark.setDisplaySize(sz, sz)
    spark.setBlendMode(ADD)
    spark.setTint(basic ? BA_HEAD_TINT : mystic ? Q_SPARK_TINT : 0xffffff)
    spark.setAlpha(basic ? 0.75 : mystic ? 0.95 : 0.9)
    scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: basic ? 1.35 : 1.8,
      duration: heavy ? 280 : basic ? 140 : 200,
      onComplete: () => spark.destroy(),
    })
  }
  if (basic) return
  const crystalKey = pick(scene, EZREAL_SPELL_VFX.commonCrystal)
  if (crystalKey) {
    const burst = scene.add.image(x, y, crystalKey)
    burst.setDepth(depth + 1)
    burst.setDisplaySize(heavy ? 48 : 32, heavy ? 48 : 32)
    burst.setBlendMode(SCREEN)
    burst.setAlpha(heavy ? 0.75 : 0.55)
    scene.tweens.add({
      targets: burst,
      alpha: 0,
      scale: 1.4,
      duration: 260,
      onComplete: () => burst.destroy(),
    })
  }
}
