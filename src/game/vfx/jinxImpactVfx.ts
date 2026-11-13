import * as Phaser from 'phaser'
import { JINX_VFX } from './jinxVfxConfig'
import { randomGunHitFrameKey } from './jinxVfxFrames'

type ImpactScene = Phaser.Scene

/** LoL particle PNGs: black = empty when using ADD; RGB-only sheets must not use NORMAL. */
const ADD = Phaser.BlendModes.ADD

function fadeSprite(
  scene: ImpactScene,
  sprite: Phaser.GameObjects.Image,
  duration: number,
  scaleMul: number,
) {
  scene.tweens.add({
    targets: sprite,
    alpha: 0,
    scale: sprite.scale * scaleMul,
    duration,
    onComplete: () => sprite.destroy(),
  })
}

function scaleForDiameter(sourcePx: number, diameterWorld: number) {
  return diameterWorld / sourcePx
}

/** Pow-Pow impact — one frame from 2×2 gun-hit sheet (ADD, not full atlas). */
export function spawnPowPowImpact(scene: ImpactScene, x: number, y: number, depth: number) {
  const frameKey = randomGunHitFrameKey(scene)
  const hit = scene.add.image(x, y, JINX_VFX.qGunHit, frameKey)
  hit.setDepth(depth + 2)
  hit.setOrigin(0.5, 0.5)
  hit.setScale(scaleForDiameter(256, 28))
  hit.setAlpha(0.9)
  hit.setBlendMode(ADD)
  fadeSprite(scene, hit, 130, 1.2)
}

/**
 * Fishbones AoE visuals — only assets with alpha or ADD-safe black background.
 * `splashRadius` matches gameplay radius (~78) for sizing only.
 */
export function spawnFishbonesExplosion(
  scene: ImpactScene,
  x: number,
  y: number,
  depth: number,
  splashRadius: number,
) {
  const core = splashRadius * 1.05
  const layers: {
    key: string
    sourcePx: number
    diameter: number
    alpha: number
    blend: Phaser.BlendModes
    duration: number
    scaleMul: number
  }[] = [
    {
      key: JINX_VFX.baseCrater,
      sourcePx: 512,
      diameter: core * 2.1,
      alpha: 0.38,
      blend: Phaser.BlendModes.NORMAL,
      duration: 320,
      scaleMul: 1.08,
    },
    {
      key: JINX_VFX.rocketAoeFlare,
      sourcePx: 128,
      diameter: core * 1.35,
      alpha: 0.95,
      blend: ADD,
      duration: 200,
      scaleMul: 1.25,
    },
    {
      key: JINX_VFX.baShockring,
      sourcePx: 256,
      diameter: core * 1.85,
      alpha: 0.75,
      blend: ADD,
      duration: 220,
      scaleMul: 1.35,
    },
    {
      key: JINX_VFX.explosionSmoke,
      sourcePx: 512,
      diameter: core * 2.4,
      alpha: 0.55,
      blend: Phaser.BlendModes.NORMAL,
      duration: 380,
      scaleMul: 1.15,
    },
    {
      key: JINX_VFX.baSmoke,
      sourcePx: 256,
      diameter: core * 1.9,
      alpha: 0.42,
      blend: Phaser.BlendModes.NORMAL,
      duration: 340,
      scaleMul: 1.12,
    },
  ]

  for (const layer of layers) {
    if (!scene.textures.exists(layer.key)) {
      continue
    }
    const img = scene.add.image(x, y, layer.key)
    img.setDepth(depth + 1)
    img.setOrigin(0.5, 0.5)
    img.setScale(scaleForDiameter(layer.sourcePx, layer.diameter))
    img.setAlpha(layer.alpha)
    img.setBlendMode(layer.blend)
    fadeSprite(scene, img, layer.duration, layer.scaleMul)
  }
}
