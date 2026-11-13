import * as Phaser from 'phaser'
import {
  LUX_BAKED_E_SINGULARITY,
  LUX_E_KUGEL_TOP_ANIM,
  LUX_E_KUGEL_TOP_SHEET,
} from './luxBakedSpellSprites'
import { LUX_SPELL_PARTICLE_VFX } from './luxAuthenticSpellVfx'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

const TINT = {
  core: 0xffffff,
  gold: 0xfde68a,
  flare: 0xfff7ed,
  hot: 0xfbbf24,
  /** Borde azul claro como el anillo del cliente. */
  rim: 0x7dd3fc,
  warm: 0xfef9c3,
} as const

function pickKey(scene: Phaser.Scene, ...keys: string[]): string | null {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

export type LuxEKugelMissileVisual = {
  root: Phaser.GameObjects.Container
  spin: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | null
}

export type LuxSingularityZoneVisual = {
  root: Phaser.GameObjects.Container
  core: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | null
  ring: Phaser.GameObjects.Image | null
  innerRing: Phaser.GameObjects.Image | null
  /** Luz central persistente (flash/flare del cliente). */
  lightHalo: Phaser.GameObjects.Image | null
  lightCore: Phaser.GameObjects.Image | null
  lightSpark: Phaser.GameObjects.Image | null
  coreBaseScale: number
  moteTimerMs: number
}

/** Kugel en vuelo — sale del báculo hacia el suelo. */
export function createLuxEKugelMissileVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
): LuxEKugelMissileVisual {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 4)

  let spin: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | null = null
  if (scene.textures.exists(LUX_E_KUGEL_TOP_SHEET.key)) {
    spin = scene.add.sprite(0, 0, LUX_E_KUGEL_TOP_SHEET.key, 0)
    spin.setScale(0.46)
    spin.setTint(TINT.gold)
    spin.setAlpha(0.92)
    spin.setBlendMode(ADD)
    if (spin instanceof Phaser.GameObjects.Sprite && scene.anims.exists(LUX_E_KUGEL_TOP_ANIM)) {
      spin.play(LUX_E_KUGEL_TOP_ANIM)
    }
    root.add(spin)
  } else {
    const baked = pickKey(scene, LUX_BAKED_E_SINGULARITY.key, LUX_SPELL_PARTICLE_VFX.eSphere)
    if (baked) {
      spin = scene.add.image(0, 0, baked)
      spin.setDisplaySize(44, 44)
      spin.setTint(TINT.gold)
      spin.setAlpha(0.9)
      spin.setBlendMode(SCREEN)
      root.add(spin)
    }
  }

  const flareKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.eFlare, LUX_SPELL_PARTICLE_VFX.eGlow)
  if (flareKey) {
    const flare = scene.add.image(0, 0, flareKey)
    flare.setDisplaySize(36, 36)
    flare.setAlpha(0.42)
    flare.setTint(TINT.flare)
    flare.setBlendMode(ADD)
    root.addAt(flare, 0)
  }

  const glowKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.eGlow)
  if (glowKey) {
    const glow = scene.add.image(0, 0, glowKey)
    glow.setDisplaySize(28, 28)
    glow.setAlpha(0.35)
    glow.setTint(TINT.core)
    glow.setBlendMode(SCREEN)
    root.addAt(glow, 0)
  }

  return { root, spin }
}

export function tickLuxEKugelMissileVisual(visual: LuxEKugelMissileVisual, _deltaMs: number) {
  const pulse = 1 + Math.sin(Date.now() * 0.018) * 0.06
  if (visual.spin?.active) {
    visual.spin.setScale(visual.spin instanceof Phaser.GameObjects.Sprite ? 0.46 * pulse : pulse)
  }
}

export function spawnLuxEKugelTrail(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  const key = pickKey(scene, LUX_SPELL_PARTICLE_VFX.eMote, LUX_SPELL_PARTICLE_VFX.eFlare)
  if (!key) return
  const mote = scene.add.image(x, y, key)
  mote.setDepth(depth - 1)
  mote.setDisplaySize(14, 14)
  mote.setTint(TINT.gold)
  mote.setAlpha(0.55)
  mote.setBlendMode(ADD)
  scene.tweens.add({
    targets: mote,
    alpha: 0,
    y: y + 6,
    scale: 0.4,
    duration: 260,
    onComplete: () => mote.destroy(),
  })
}

export function spawnLuxEKugelLandPulse(scene: Phaser.Scene, x: number, y: number, depth: number) {
  const key = pickKey(scene, LUX_SPELL_PARTICLE_VFX.eFlash, LUX_SPELL_PARTICLE_VFX.eFlare)
  if (!key) return
  const burst = scene.add.image(x, y, key)
  burst.setDepth(depth + 2)
  burst.setDisplaySize(48, 48)
  burst.setTint(TINT.flare)
  burst.setAlpha(0.65)
  burst.setBlendMode(SCREEN)
  scene.tweens.add({
    targets: burst,
    alpha: 0,
    scale: 1.35,
    duration: 340,
    onComplete: () => burst.destroy(),
  })
}

function spawnLuxESingularityMote(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  radius: number,
) {
  const key = pickKey(scene, LUX_SPELL_PARTICLE_VFX.eMote, LUX_SPELL_PARTICLE_VFX.eFlash)
  if (!key) return
  const a = Math.random() * Math.PI * 2
  const r = radius * (0.35 + Math.random() * 0.55)
  const mote = scene.add.image(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.82, key)
  mote.setDepth(depth + 1)
  mote.setDisplaySize(10 + Math.random() * 8, 10 + Math.random() * 8)
  mote.setTint(TINT.gold)
  mote.setAlpha(0.45)
  mote.setBlendMode(ADD)
  scene.tweens.add({
    targets: mote,
    alpha: 0,
    y: mote.y - 10 - Math.random() * 8,
    scale: 0.35,
    duration: 480 + Math.random() * 220,
    onComplete: () => mote.destroy(),
  })
}

/** Singularidad en el suelo — sin daño hasta recast o timeout. */
export function createLuxSingularityZoneVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  radius: number,
): LuxSingularityZoneVisual {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 2)

  const ground = scene.add.graphics()
  ground.fillStyle(0xfffbeb, 0.035)
  ground.fillEllipse(0, 2, radius * 1.5, radius * 1.18)
  ground.lineStyle(2.5, TINT.rim, 0.62)
  ground.strokeEllipse(0, 2, radius * 1.95, radius * 1.55)
  root.add(ground)

  /** Perímetro fino en suelo; `e_flame_ring` a tamaño AoE parece un disco enorme en top-down. */
  const ring: Phaser.GameObjects.Image | null = null
  const innerRing: Phaser.GameObjects.Image | null = null

  const coreBaseScale = 0.22 * (radius / 56)
  let core: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | null = null
  if (scene.textures.exists(LUX_E_KUGEL_TOP_SHEET.key)) {
    core = scene.add.sprite(0, -3, LUX_E_KUGEL_TOP_SHEET.key, 0)
    core.setScale(coreBaseScale)
    core.setTint(TINT.warm)
    core.setAlpha(0.62)
    core.setBlendMode(ADD)
    if (core instanceof Phaser.GameObjects.Sprite && scene.anims.exists(LUX_E_KUGEL_TOP_ANIM)) {
      core.play(LUX_E_KUGEL_TOP_ANIM)
    }
    root.add(core)
  } else {
    const bakedKey = pickKey(scene, LUX_BAKED_E_SINGULARITY.key, LUX_SPELL_PARTICLE_VFX.eSphere)
    if (bakedKey) {
      core = scene.add.image(0, -3, bakedKey)
      const size = radius * (bakedKey === LUX_BAKED_E_SINGULARITY.key ? 0.38 : 0.32)
      core.setDisplaySize(size, size)
      core.setAlpha(0.82)
      core.setTint(TINT.warm)
      core.setBlendMode(SCREEN)
      root.add(core)
    }
  }

  let lightHalo: Phaser.GameObjects.Image | null = null
  let lightCore: Phaser.GameObjects.Image | null = null
  let lightSpark: Phaser.GameObjects.Image | null = null

  const glowKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.eGlow)
  if (glowKey) {
    const field = scene.add.image(0, 1, glowKey)
    field.setDisplaySize(radius * 1.35, radius * 1.05)
    field.setAlpha(0.065)
    field.setTint(TINT.warm)
    field.setBlendMode(SCREEN)
    root.addAt(field, 1)

    lightHalo = scene.add.image(0, -2, glowKey)
    lightHalo.setDisplaySize(Math.min(26, radius * 0.22), Math.min(26, radius * 0.22))
    lightHalo.setAlpha(0.32)
    lightHalo.setTint(TINT.warm)
    lightHalo.setBlendMode(SCREEN)
    root.add(lightHalo)
  }

  const flareKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.eFlare)
  if (flareKey) {
    lightCore = scene.add.image(0, -2, flareKey)
    const corePx = Math.min(20, radius * 0.16)
    lightCore.setDisplaySize(corePx, corePx)
    lightCore.setAlpha(0.65)
    lightCore.setTint(TINT.core)
    lightCore.setBlendMode(ADD)
    root.add(lightCore)
  }

  const flashKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.eFlash)
  if (flashKey) {
    lightSpark = scene.add.image(0, -2, flashKey)
    const sparkPx = Math.min(14, radius * 0.11)
    lightSpark.setDisplaySize(sparkPx, sparkPx)
    lightSpark.setAlpha(0.88)
    lightSpark.setTint(TINT.core)
    lightSpark.setBlendMode(ADD)
    root.add(lightSpark)
  }

  return {
    root,
    core,
    ring,
    innerRing,
    lightHalo,
    lightCore,
    lightSpark,
    coreBaseScale,
    moteTimerMs: 0,
  }
}

export function updateLuxSingularityZoneVisual(
  scene: Phaser.Scene,
  zone: LuxSingularityZoneVisual,
  worldX: number,
  worldY: number,
  depth: number,
  radius: number,
  lingerRatio: number,
  deltaMs: number,
) {
  const t = Date.now()
  const pulse = 1 + Math.sin(t * 0.012) * 0.05
  const hotPulse = 1 + Math.sin(t * 0.021) * 0.08
  const urgency = 1 - lingerRatio
  if (zone.core instanceof Phaser.GameObjects.Sprite) {
    zone.core.setScale(zone.coreBaseScale * pulse * (1 + urgency * 0.05))
  } else if (zone.core?.active) {
    zone.core.setScale(pulse * (1 + urgency * 0.04))
  }
  zone.lightHalo?.setScale(pulse)
  zone.lightHalo?.setAlpha(0.3 + hotPulse * 0.1 + urgency * 0.08)
  zone.lightCore?.setScale(0.94 + hotPulse * 0.08)
  zone.lightCore?.setAlpha(0.62 + hotPulse * 0.12 + urgency * 0.08)
  zone.lightSpark?.setScale(0.9 + hotPulse * 0.1)
  zone.lightSpark?.setAlpha(0.85 + hotPulse * 0.12)

  zone.moteTimerMs += deltaMs
  if (zone.moteTimerMs > 130) {
    zone.moteTimerMs = 0
    spawnLuxESingularityMote(scene, worldX, worldY, depth, radius)
    if (Math.random() < 0.35) {
      spawnLuxESingularityMote(scene, worldX, worldY - 4, depth, radius * 0.25)
    }
    if (urgency > 0.55 && Math.random() < 0.45) {
      spawnLuxESingularityMote(scene, worldX, worldY, depth, radius)
    }
  }
}

export function spawnLuxEDetonateBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  radius: number,
) {
  const flashKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.eFlash, LUX_SPELL_PARTICLE_VFX.eFlare)
  if (flashKey) {
    const flash = scene.add.image(x, y, flashKey)
    flash.setDepth(depth + 6)
    flash.setDisplaySize(radius * 2.4, radius * 2.4)
    flash.setTint(TINT.core)
    flash.setAlpha(0.82)
    flash.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.25,
      duration: 380,
      onComplete: () => flash.destroy(),
    })
  }

  const ringKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.eRing)
  if (ringKey) {
    const ring = scene.add.image(x, y, ringKey)
    ring.setDepth(depth + 5)
    ring.setDisplaySize(radius * 2.6, radius * 2.6)
    ring.setTint(TINT.gold)
    ring.setAlpha(0.7)
    ring.setBlendMode(ADD)
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.45,
      duration: 420,
      onComplete: () => ring.destroy(),
    })
  }
}
