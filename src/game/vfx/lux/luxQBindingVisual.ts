import * as Phaser from 'phaser'
import {
  LUX_Q_BINDING_TOP_ANIM,
  LUX_Q_BINDING_TOP_SHEET,
  LUX_BAKED_Q_PORTAL,
} from './luxBakedSpellSprites'
import { LUX_SPELL_PARTICLE_VFX } from './luxAuthenticSpellVfx'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

const TINT = {
  core: 0xffffff,
  warm: 0xfff7cc,
  gold: 0xfde047,
  cyan: 0xa5f3fc,
} as const

function pickKey(scene: Phaser.Scene, ...keys: string[]): string | null {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

export type LuxQBindingVisual = {
  root: Phaser.GameObjects.Container
  spin: Phaser.GameObjects.Sprite | null
  ribbon: Phaser.GameObjects.TileSprite | null
  core: Phaser.GameObjects.Image | null
}

/** Anillo portal solo al cast (no viaja con el misil). */
export function spawnLuxQCastPortal(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const key = pickKey(scene, LUX_BAKED_Q_PORTAL.key)
  if (!key) return
  const ring = scene.add.image(x, y, key)
  ring.setRotation(angle)
  ring.setDepth(depth + 4)
  ring.setScale(0.38)
  ring.setTint(TINT.gold)
  ring.setAlpha(0.72)
  ring.setBlendMode(ADD)
  scene.tweens.add({
    targets: ring,
    alpha: 0,
    scale: 0.55,
    duration: 320,
    onComplete: () => ring.destroy(),
  })
}

/** Light Binding — capas estilo cliente (spin mesh top-down + ribbon UV + núcleo). */
export function createLuxQBindingVisual(scene: Phaser.Scene): LuxQBindingVisual | null {
  const root = scene.add.container(0, 0)

  let ribbon: Phaser.GameObjects.TileSprite | null = null
  const cylKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.qCylinder)
  if (cylKey) {
    ribbon = scene.add.tileSprite(-28, 0, 56, 22, cylKey)
    ribbon.setOrigin(1, 0.5)
    ribbon.setAlpha(0.55)
    ribbon.setTint(TINT.cyan)
    ribbon.setBlendMode(ADD)
    ribbon.setTileScale(0.12, 0.045)
    root.add(ribbon)
  }

  let spin: Phaser.GameObjects.Sprite | null = null
  if (scene.textures.exists(LUX_Q_BINDING_TOP_SHEET.key)) {
    spin = scene.add.sprite(0, 0, LUX_Q_BINDING_TOP_SHEET.key, 0)
    spin.setScale(0.92)
    spin.setTint(TINT.warm)
    spin.setAlpha(0.97)
    spin.setBlendMode(ADD)
    if (scene.anims.exists(LUX_Q_BINDING_TOP_ANIM)) {
      spin.play(LUX_Q_BINDING_TOP_ANIM)
    }
    root.add(spin)
  }

  const rainbowKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.qRainbow)
  if (rainbowKey) {
    const ray = scene.add.image(-6, 0, rainbowKey)
    ray.setDisplaySize(48, 28)
    ray.setAlpha(0.28)
    ray.setTint(TINT.gold)
    ray.setBlendMode(ADD)
    root.addAt(ray, 0)
  }

  let core: Phaser.GameObjects.Image | null = null
  const sparkKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.qSpark, LUX_SPELL_PARTICLE_VFX.baGlow)
  if (sparkKey) {
    core = scene.add.image(10, 0, sparkKey)
    core.setDisplaySize(34, 34)
    core.setAlpha(0.92)
    core.setTint(TINT.core)
    core.setBlendMode(ADD)
    root.add(core)
  }

  const gradKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.qGradient)
  if (gradKey) {
    const glow = scene.add.image(4, 0, gradKey)
    glow.setDisplaySize(28, 28)
    glow.setAlpha(0.65)
    glow.setTint(TINT.warm)
    glow.setBlendMode(SCREEN)
    root.add(glow)
  }

  if (!spin && !core) {
    root.destroy()
    return null
  }

  return { root, spin, ribbon, core }
}

export function updateLuxQBindingVisual(visual: LuxQBindingVisual, deltaMs: number) {
  if (visual.ribbon?.active) {
    visual.ribbon.tilePositionY -= (deltaMs / 1000) * 280
  }
  const pulse = 1 + Math.sin(Date.now() * 0.018) * 0.06
  if (visual.core?.active) {
    visual.core.setScale(pulse)
  }
  if (visual.spin?.active) {
    visual.spin.setScale(0.92 * (1 + Math.sin(Date.now() * 0.012) * 0.04))
  }
}

export function spawnLuxQBindingTrail(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const key = pickKey(scene, LUX_SPELL_PARTICLE_VFX.qTrail)
  if (!key) return
  const trail = scene.add.image(x, y, key)
  trail.setOrigin(0.95, 0.5)
  trail.setRotation(angle + Math.PI)
  trail.setDepth(depth - 1)
  trail.setDisplaySize(44, 18)
  trail.setTint(TINT.cyan)
  trail.setAlpha(0.48)
  trail.setBlendMode(ADD)
  scene.tweens.add({
    targets: trail,
    alpha: 0,
    displayWidth: 22,
    duration: 320,
    onComplete: () => trail.destroy(),
  })
}
