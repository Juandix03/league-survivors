import * as Phaser from 'phaser'
import { LUX_SPELL_PARTICLE_VFX } from './luxAuthenticSpellVfx'
import { spawnLuxQCastPortal } from './luxQBindingVisual'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

const TINT = {
  core: 0xffffff,
  beam: 0x7dd3fc,
  beamHot: 0xe0f2fe,
  gold: 0xfde68a,
  charge: 0xfffbeb,
} as const

function pickKey(scene: Phaser.Scene, ...keys: string[]): string | null {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

/** Tira fina horizontal — aspect fijo (evita blob central de lazurbeam bake). */
function beamThickness(len: number, scale: number): number {
  return Phaser.Math.Clamp(len * 0.055 * scale, 14, 96)
}

function addBeamStrip(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  key: string,
  blend: Phaser.BlendModes,
  tint: number | null,
): Phaser.GameObjects.Image {
  const strip = scene.add.image(0, 0, key)
  strip.setOrigin(0, 0.5)
  strip.setAlpha(0)
  strip.setBlendMode(blend)
  if (tint === null) strip.clearTint()
  else strip.setTint(tint)
  root.add(strip)
  return strip
}

export type LuxFinalSparkVisual = {
  root: Phaser.GameObjects.Container
  update: (opts: {
    phase: 'charge' | 'fire'
    chargeRatio: number
    fireRatio: number
    pulse: number
    range: number
    width: number
    deltaMs: number
  }) => void
  flashTip: () => void
}

/** R — tiras wRainbow (UV horizontal uniforme) + burst CD en la punta. */
export function createLuxFinalSparkVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
  range: number,
  width: number,
): LuxFinalSparkVisual {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 14)
  root.setRotation(angle)

  const indicator = scene.add.graphics()
  root.add(indicator)

  const stripKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.wRainbow)
  const rainbowStrip = stripKey ? addBeamStrip(scene, root, stripKey, ADD, null) : null
  const glowStrip = stripKey ? addBeamStrip(scene, root, stripKey, SCREEN, TINT.beamHot) : null
  const coreStrip = stripKey ? addBeamStrip(scene, root, stripKey, ADD, TINT.core) : null

  const chargeCoreKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.rFlash, LUX_SPELL_PARTICLE_VFX.rGlow)
  let chargeCore: Phaser.GameObjects.Image | null = null
  if (chargeCoreKey) {
    chargeCore = scene.add.image(0, 0, chargeCoreKey)
    chargeCore.setDisplaySize(42, 42)
    chargeCore.setAlpha(0.75)
    chargeCore.setTint(TINT.charge)
    chargeCore.setBlendMode(ADD)
    root.add(chargeCore)
  }

  let beamDismissed = false
  let endPhase: 'travel' | 'fade' = 'travel'
  let fadeAlpha = 1
  const FADE_MS = 280
  let originFlashed = false
  let stripsHidden = false

  const hideStrips = () => {
    stripsHidden = true
    rainbowStrip?.setAlpha(0)
    glowStrip?.setAlpha(0)
    coreStrip?.setAlpha(0)
  }

  const layoutBeam = (
    len: number,
    w: number,
    pulse: number,
    visible: boolean,
    alphaScale: number,
  ) => {
    if (stripsHidden || !stripKey) return

    const L = Math.max(8, len)
    const a = (visible ? 1 : 0) * Phaser.Math.Clamp(alphaScale, 0, 1)
    const thick = beamThickness(L, 1 + w / 58 + pulse * 0.06)

    rainbowStrip?.setDisplaySize(L, thick * 2.35)
    rainbowStrip?.setAlpha(a * 0.44)
    glowStrip?.setDisplaySize(L, thick * 1.65)
    glowStrip?.setAlpha(a * 0.52)
    coreStrip?.setDisplaySize(L, thick * 0.75)
    coreStrip?.setAlpha(a * 0.78)
  }

  const update = (opts: {
    phase: 'charge' | 'fire'
    chargeRatio: number
    fireRatio: number
    pulse: number
    range: number
    width: number
    deltaMs: number
  }) => {
    const { phase, chargeRatio, fireRatio, pulse, range: r, width: w, deltaMs } = opts
    indicator.clear()

    if (phase === 'charge') {
      const preview = r * (0.2 + chargeRatio * 0.8)
      indicator.lineStyle(2, TINT.beam, 0.14 + chargeRatio * 0.26)
      indicator.lineBetween(0, 0, preview, 0)
      layoutBeam(0, w, pulse, false, 1)
      if (chargeCore?.active) {
        chargeCore.setScale(0.88 + chargeRatio * 0.45 + pulse * 0.1)
        chargeCore.setAlpha(0.48 + chargeRatio * 0.48)
      }
      return
    }

    if (!originFlashed) {
      originFlashed = true
      if (chargeCore?.active) chargeCore.setAlpha(0)
      spawnLuxQCastPortal(scene, root.x, root.y, root.rotation, depth)
      const flashKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.rFlash)
      if (flashKey) {
        const burst = scene.add.image(0, 0, flashKey)
        burst.setDisplaySize(58, 58)
        burst.setTint(TINT.gold)
        burst.setAlpha(0.88)
        burst.setBlendMode(ADD)
        root.add(burst)
        scene.tweens.add({
          targets: burst,
          alpha: 0,
          scale: 1.55,
          duration: 340,
          onComplete: () => burst.destroy(),
        })
      }
    }

    if (beamDismissed) return

    if (endPhase === 'fade') {
      fadeAlpha = Math.max(0, fadeAlpha - deltaMs / FADE_MS)
      if (fadeAlpha <= 0) {
        beamDismissed = true
        indicator.clear()
        hideStrips()
      }
      return
    }

    const len = r * Phaser.Math.Clamp(fireRatio, 0.05, 1)
    layoutBeam(len, w, pulse, true, 1)
  }

  const flashTip = () => {
    endPhase = 'fade'
    fadeAlpha = 1
    hideStrips()

    const tipDepth = root.y + Math.sin(root.rotation) * range + 8
    spawnLuxRFinalSparkBurst(
      scene,
      root.x,
      root.y,
      root.rotation,
      range,
      tipDepth,
      width,
    )
  }

  return { root, update, flashTip }
}

export function spawnLuxRFinalSparkBurst(
  scene: Phaser.Scene,
  originX: number,
  originY: number,
  angle: number,
  beamRange: number,
  depth: number,
  width: number,
) {
  const tx = originX + Math.cos(angle) * beamRange
  const ty = originY + Math.sin(angle) * beamRange
  const scale = 0.95 + width / 58

  const bloomKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.rGlow, LUX_SPELL_PARTICLE_VFX.baGlow)
  if (bloomKey) {
    const bloom = scene.add.image(tx, ty, bloomKey)
    bloom.setDepth(depth)
    bloom.setDisplaySize(88 * scale, 88 * scale)
    bloom.setTint(TINT.beamHot)
    bloom.setAlpha(0.58)
    bloom.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: bloom,
      alpha: 0,
      scale: 1.5,
      duration: 420,
      onComplete: () => bloom.destroy(),
    })
  }

  const flashKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.rFlash)
  if (flashKey) {
    const flash = scene.add.image(tx, ty, flashKey)
    flash.setDepth(depth + 4)
    flash.setDisplaySize(68 * scale, 68 * scale)
    flash.setTint(TINT.core)
    flash.setAlpha(0.96)
    flash.setBlendMode(ADD)
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.6,
      duration: 360,
      onComplete: () => flash.destroy(),
    })
  }
}
