import * as Phaser from 'phaser'
import {
  LUX_BAKED_W_SHIELD_BUBBLE,
  LUX_W_WAVE_TOP_ANIM,
  LUX_W_WAVE_TOP_SHEET,
} from './luxBakedSpellSprites'
import { LUX_SPELL_PARTICLE_VFX } from './luxAuthenticSpellVfx'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

const TINT = {
  core: 0xffffff,
  prism: 0xfffbeb,
  gold: 0xfde68a,
  shield: 0xfef3c7,
} as const

function pickKey(scene: Phaser.Scene, ...keys: string[]): string | null {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

export type LuxPrismaticWaveVisual = {
  root: Phaser.GameObjects.Container
  spin: Phaser.GameObjects.Sprite | null
  phase: 'out' | 'return'
}

export type LuxPrismaticShieldVisual = {
  root: Phaser.GameObjects.Container
  bubble: Phaser.GameObjects.Image | null
  rim: Phaser.GameObjects.Image | null
}

/** Burbuja sobre Lux — sin `w_glow_outer` (radial gigante en top-down). */
export function createLuxPrismaticShieldVisual(scene: Phaser.Scene): LuxPrismaticShieldVisual {
  const root = scene.add.container(0, 0)

  let bubble: Phaser.GameObjects.Image | null = null
  if (scene.textures.exists(LUX_BAKED_W_SHIELD_BUBBLE.key)) {
    bubble = scene.add.image(0, 0, LUX_BAKED_W_SHIELD_BUBBLE.key)
    bubble.setDisplaySize(54, 54)
    bubble.setAlpha(0.55)
    bubble.setTint(TINT.shield)
    bubble.setBlendMode(SCREEN)
    root.add(bubble)
  } else {
    const bubbleKey = pickKey(
      scene,
      LUX_SPELL_PARTICLE_VFX.wLightShield,
      LUX_SPELL_PARTICLE_VFX.wShield,
    )
    if (bubbleKey) {
      bubble = scene.add.image(0, 0, bubbleKey)
      bubble.setDisplaySize(52, 52)
      bubble.setAlpha(0.5)
      bubble.setTint(TINT.shield)
      bubble.setBlendMode(SCREEN)
      root.add(bubble)
    }
  }

  let rim: Phaser.GameObjects.Image | null = null
  const prismKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.wPrism)
  if (prismKey) {
    rim = scene.add.image(0, 0, prismKey)
    rim.setDisplaySize(40, 40)
    rim.setAlpha(0.2)
    rim.setTint(TINT.prism)
    rim.setBlendMode(ADD)
    root.addAt(rim, 0)
  }

  return { root, bubble, rim }
}

export function playLuxShieldApplyPulse(scene: Phaser.Scene, x: number, y: number, depth: number) {
  const key = pickKey(scene, LUX_SPELL_PARTICLE_VFX.wPrism, LUX_SPELL_PARTICLE_VFX.wFlash)
  if (!key) return
  const burst = scene.add.image(x, y - 10, key)
  burst.setDepth(depth + 8)
  burst.setDisplaySize(34, 34)
  burst.setTint(TINT.gold)
  burst.setAlpha(0.55)
  burst.setBlendMode(ADD)
  scene.tweens.add({
    targets: burst,
    alpha: 0,
    scale: 1.2,
    duration: 320,
    onComplete: () => burst.destroy(),
  })
}

export function updateLuxPrismaticShieldVisual(shield: LuxPrismaticShieldVisual, _deltaMs: number) {
  const s = 1 + Math.sin(Date.now() * 0.007) * 0.04
  shield.bubble?.setScale(s)
  shield.rim?.setScale(s * 1.02)
  shield.rim?.setAlpha(0.16 + Math.sin(Date.now() * 0.01) * 0.06)
}

/** Onda = núcleo giratorio + báculo (2 orbes + haz), sin TileSprite arcoíris. */
export function createLuxPrismaticWaveVisual(
  scene: Phaser.Scene,
  phase: 'out' | 'return' = 'out',
): LuxPrismaticWaveVisual | null {
  const root = scene.add.container(0, 0)

  let spin: Phaser.GameObjects.Sprite | null = null
  if (scene.textures.exists(LUX_W_WAVE_TOP_SHEET.key)) {
    spin = scene.add.sprite(0, 0, LUX_W_WAVE_TOP_SHEET.key, 0)
    spin.setScale(0.52)
    spin.setTint(phase === 'return' ? 0xf5d0fe : TINT.core)
    spin.setAlpha(0.62)
    spin.setBlendMode(ADD)
    if (scene.anims.exists(LUX_W_WAVE_TOP_ANIM)) {
      spin.play(LUX_W_WAVE_TOP_ANIM)
    }
    root.add(spin)
  }

  const rayKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.qRainbow)
  if (rayKey) {
    const ray = scene.add.image(0, 0, rayKey)
    ray.setDisplaySize(36, 16)
    ray.setAlpha(phase === 'return' ? 0.32 : 0.38)
    ray.setTint(phase === 'return' ? 0xf0abfc : TINT.prism)
    ray.setBlendMode(ADD)
    root.addAt(ray, 0)
  }

  const prismKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.wPrism)
  if (prismKey) {
    const bar = scene.add.image(0, 0, prismKey)
    bar.setDisplaySize(34, 16)
    bar.setAlpha(0.55)
    bar.setTint(TINT.prism)
    bar.setBlendMode(ADD)
    root.addAt(bar, 0)

    const orbL = scene.add.image(-12, 0, prismKey)
    orbL.setDisplaySize(28, 28)
    orbL.setAlpha(0.88)
    orbL.setTint(TINT.gold)
    orbL.setBlendMode(ADD)
    root.add(orbL)

    const orbR = scene.add.image(12, 0, prismKey)
    orbR.setDisplaySize(28, 28)
    orbR.setAlpha(0.88)
    orbR.setTint(TINT.core)
    orbR.setBlendMode(ADD)
    root.add(orbR)
  }

  const flashKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.wFlash)
  if (flashKey) {
    const tip = scene.add.image(phase === 'return' ? -14 : 14, 0, flashKey)
    tip.setDisplaySize(16, 16)
    tip.setAlpha(0.55)
    tip.setTint(TINT.core)
    tip.setBlendMode(SCREEN)
    root.add(tip)
  }

  if (!spin && !prismKey) {
    root.destroy()
    return null
  }

  return { root, spin, phase }
}

export function setLuxPrismaticWavePhase(visual: LuxPrismaticWaveVisual, phase: 'out' | 'return') {
  visual.phase = phase
  if (visual.spin?.active) {
    visual.spin.setTint(phase === 'return' ? 0xf5d0fe : TINT.core)
  }
}

export function updateLuxPrismaticWaveVisual(visual: LuxPrismaticWaveVisual, _deltaMs: number) {
  if (visual.spin?.active) {
    visual.spin.setScale(0.52 * (1 + Math.sin(Date.now() * 0.014) * 0.05))
  }
}

export function spawnLuxPrismaticWaveTrail(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
  returning: boolean,
) {
  const key = pickKey(
    scene,
    LUX_SPELL_PARTICLE_VFX.qRainbow,
    LUX_SPELL_PARTICLE_VFX.wPrism,
  )
  if (!key) return
  const trail = scene.add.image(x, y, key)
  trail.setOrigin(0.95, 0.5)
  trail.setRotation(angle + Math.PI)
  trail.setDepth(depth - 1)
  const streak = key.includes('rainbow') || key.includes('Rainbow')
  trail.setDisplaySize(returning ? 36 : 32, streak ? 12 : 14)
  trail.setTint(returning ? 0xf0abfc : TINT.prism)
  trail.setAlpha(returning ? 0.38 : 0.28)
  trail.setBlendMode(ADD)
  scene.tweens.add({
    targets: trail,
    alpha: 0,
    displayWidth: trail.displayWidth * 0.45,
    duration: 380,
    onComplete: () => trail.destroy(),
  })
}

export function spawnLuxWCastBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const key = pickKey(scene, LUX_SPELL_PARTICLE_VFX.wPrism, LUX_SPELL_PARTICLE_VFX.wFlash)
  if (!key) return
  const burst = scene.add.image(x, y, key)
  burst.setRotation(angle)
  burst.setDepth(depth + 3)
  burst.setDisplaySize(30, 30)
  burst.setTint(TINT.gold)
  burst.setAlpha(0.45)
  burst.setBlendMode(SCREEN)
  scene.tweens.add({
    targets: burst,
    alpha: 0,
    scale: 1.35,
    duration: 240,
    onComplete: () => burst.destroy(),
  })
}
