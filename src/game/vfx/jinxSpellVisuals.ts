import * as Phaser from 'phaser'
import { TEXTURE } from '../constants'
import {
  JINX_R_PROJECTILE_ROTATION_OFFSET,
  JINX_R_PROJECTILE_SPRITE,
  JINX_SPELL_VFX,
} from './jinxSpellVfxConfig'
import { hasJinxRProjectileSprite, hasJinxSpellTexture } from './loadJinxSpellVfx'

type Scene = Phaser.Scene

const ADD = Phaser.BlendModes.ADD
const NORMAL = Phaser.BlendModes.NORMAL

/** Escala del cuerpo bakeado (144×213). Sin factor 640/144: el trim solo quitó alpha vacío. */
const R_BAKED_BODY_SCALE = 0.42
const R_FALLBACK_BODY_SCALE = 1.25

export function spawnWImpactVisual(scene: Scene, x: number, y: number, depth: number) {
  const authentic = hasJinxSpellTexture(scene, 'wSparks')
  const key = authentic ? JINX_SPELL_VFX.wSparks : TEXTURE.zapHit
  const hit = scene.add.image(x, y, key)
  hit.setDepth(depth + 1)
  hit.setOrigin(0.5, 0.5)
  hit.setBlendMode(ADD)
  hit.setScale(authentic ? 0.22 : 0.65)
  hit.setAlpha(0.92)
  scene.tweens.add({
    targets: hit,
    alpha: 0,
    scale: hit.scale * 1.25,
    duration: 120,
    onComplete: () => hit.destroy(),
  })
}

export type ChomperTrapVisual = Phaser.GameObjects.Container & {
  chomperBody?: Phaser.GameObjects.Image
  chomperBlur?: Phaser.GameObjects.Image
}

/** E idle: Grenade (NORMAL) + Grenade_Blur (ADD), como `Jinx_Base_E_Mis`. */
export function createChomperTrapVisual(
  scene: Scene,
  x: number,
  y: number,
  depth: number,
): ChomperTrapVisual {
  const root = scene.add.container(x, y) as ChomperTrapVisual
  root.setDepth(depth)

  const useAuthentic = hasJinxSpellTexture(scene, 'eGrenade')
  if (useAuthentic) {
    if (hasJinxSpellTexture(scene, 'eGrenadeBlur')) {
      const blur = scene.add.image(0, 0, JINX_SPELL_VFX.eGrenadeBlur)
      blur.setOrigin(0.5, 0.55)
      blur.setBlendMode(ADD)
      blur.setAlpha(0.55)
      blur.setScale(0.52)
      root.add(blur)
      root.chomperBlur = blur
    }

    const body = scene.add.image(0, 0, JINX_SPELL_VFX.eGrenade)
    body.setOrigin(0.5, 0.55)
    body.setBlendMode(NORMAL)
    body.setAlpha(1)
    body.setScale(0.5)
    root.add(body)
    root.chomperBody = body
  } else {
    const fallback = scene.add.image(0, 0, TEXTURE.chomperTrap)
    fallback.setOrigin(0.5, 0.55)
    fallback.setScale(0.95)
    root.add(fallback)
    root.chomperBody = fallback
  }

  return root
}

/** Animación suave del halo Grenade_Blur (alpha over lifetime aproximado). */
export function updateChomperTrapVisualIdle(trap: ChomperTrapVisual, timeMs: number) {
  trap.chomperBody?.setAlpha(1)
  if (trap.chomperBlur) {
    trap.chomperBlur.setAlpha(0.42 + Math.sin(timeMs / 280) * 0.22)
  }
}

export function spawnChomperTriggerVisual(scene: Scene, x: number, y: number, depth: number) {
  const key = hasJinxSpellTexture(scene, 'eSplat')
    ? JINX_SPELL_VFX.eSplat
    : TEXTURE.chomperTrap
  const splat = scene.add.image(x, y, key)
  splat.setDepth(depth + 2)
  splat.setOrigin(0.5, 0.5)
  splat.setScale(hasJinxSpellTexture(scene, 'eSplat') ? 0.35 : 0.7)
  splat.setAlpha(0.78)
  splat.setBlendMode(hasJinxSpellTexture(scene, 'eSplat') ? ADD : NORMAL)
  scene.tweens.add({
    targets: splat,
    alpha: 0,
    scale: splat.scale * 1.2,
    duration: 200,
    onComplete: () => splat.destroy(),
  })
}

/** R: cuerpo opaco (bake scb+UV); estela ADD detrás. */
export function createRMissileVisual(
  scene: Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y)
  root.setRotation(angle + JINX_R_PROJECTILE_ROTATION_OFFSET)
  root.setDepth(depth)

  const useBaked = hasJinxRProjectileSprite(scene)
  const body = scene.add.image(
    0,
    0,
    useBaked ? JINX_R_PROJECTILE_SPRITE.key : TEXTURE.megaRocket,
  )
  body.setOrigin(0.5, 0.5)
  body.setBlendMode(NORMAL)
  body.setAlpha(1)
  body.setScale(useBaked ? R_BAKED_BODY_SCALE : R_FALLBACK_BODY_SCALE)
  root.add(body)

  return root
}

export function spawnRTrailPuff(scene: Scene, x: number, y: number, depth: number) {
  if (!hasJinxSpellTexture(scene, 'rRocketFire')) {
    return
  }
  const puff = scene.add.image(x, y, JINX_SPELL_VFX.rRocketFire)
  puff.setDepth(depth - 1)
  puff.setOrigin(0.5, 0.5)
  puff.setScale(0.12)
  puff.setAlpha(0.55)
  puff.setBlendMode(ADD)
  scene.tweens.add({
    targets: puff,
    alpha: 0,
    scale: 0.18,
    duration: 180,
    onComplete: () => puff.destroy(),
  })
}
