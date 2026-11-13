import * as Phaser from 'phaser'
import { EZREAL_SPELL_VFX } from './ezrealAuthenticSpellVfx'
import type { EzrealBoltVisual } from './ezrealMysticShotVisual'

const ADD = Phaser.BlendModes.ADD

const R_CORE = 0xfffef5
const R_BEAM = 0xfef08a
const R_HOT = 0xfde047
const R_TAIL = 0xf5c542

/** Spell4 HD ~frame 3–4 antes del disparo (18 fps). */
export const EZREAL_R_RELEASE_MS = 220

function pick(scene: Phaser.Scene, ...keys: string[]): string | null {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

function crescentSize(beamWidth: number): { w: number; h: number } {
  const w = Phaser.Math.Clamp(beamWidth * 2.25, 82, 148)
  const h = Phaser.Math.Clamp(beamWidth * 1.42, 52, 96)
  return { w, h }
}

/**
 * Onda viajera tipo media luna (r_glow + r_arrow).
 * No usar r_trail estirado: al tilear genera franjas horizontales.
 */
export function createEzrealTrueshotBoltVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
  beamWidth: number,
): EzrealBoltVisual {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 6)
  root.setRotation(angle)

  const { w, h } = crescentSize(beamWidth)

  const wispKey = pick(scene, EZREAL_SPELL_VFX.baWhisps)
  if (wispKey) {
    const wake = scene.add.image(-w * 0.38, 0, wispKey)
    wake.setOrigin(1, 0.5)
    wake.setDisplaySize(w * 0.42, h * 0.38)
    wake.setBlendMode(ADD)
    wake.setTint(R_TAIL)
    wake.setAlpha(0.28)
    root.add(wake)
  }

  const tailKey = pick(scene, EZREAL_SPELL_VFX.rTail)
  if (tailKey) {
    const sheen = scene.add.image(-w * 0.12, 0, tailKey)
    sheen.setOrigin(0.85, 0.5)
    sheen.setDisplaySize(w * 0.55, h * 0.5)
    sheen.setBlendMode(ADD)
    sheen.setTint(R_HOT)
    sheen.setAlpha(0.36)
    sheen.setRotation(Math.PI / 2)
    root.add(sheen)
  }

  const glowKey = pick(scene, EZREAL_SPELL_VFX.rGlow)
  if (glowKey) {
    const body = scene.add.image(0, 0, glowKey)
    body.setOrigin(0.5, 0.58)
    body.setRotation(Math.PI / 2)
    body.setDisplaySize(w, h)
    body.setBlendMode(ADD)
    body.setTint(R_BEAM)
    body.setAlpha(0.82)
    root.add(body)

    const bodyHot = scene.add.image(0, 0, glowKey)
    bodyHot.setOrigin(0.5, 0.58)
    bodyHot.setRotation(Math.PI / 2)
    bodyHot.setDisplaySize(w * 0.88, h * 0.82)
    bodyHot.setBlendMode(ADD)
    bodyHot.setTint(R_CORE)
    bodyHot.setAlpha(0.55)
    root.add(bodyHot)
  }

  const arrowKey = pick(scene, EZREAL_SPELL_VFX.rArrow)
  if (arrowKey) {
    const crest = scene.add.image(w * 0.06, 0, arrowKey)
    crest.setOrigin(0.38, 0.5)
    crest.setRotation(Math.PI)
    crest.setDisplaySize(w * 1.02, h * 0.92)
    crest.setBlendMode(ADD)
    crest.setTint(R_HOT)
    crest.setAlpha(0.92)
    root.add(crest)
  }

  const flareKey = pick(scene, EZREAL_SPELL_VFX.eGlowFlare)
  if (flareKey) {
    const bloom = scene.add.image(w * 0.14, 0, flareKey)
    bloom.setOrigin(0.5, 0.5)
    bloom.setDisplaySize(h * 0.55, h * 0.55)
    bloom.setBlendMode(ADD)
    bloom.setTint(R_CORE)
    bloom.setAlpha(0.4)
    root.add(bloom)
  }

  const sparkKey = pick(scene, EZREAL_SPELL_VFX.qHitSpark)
  if (sparkKey) {
    const tip = scene.add.image(w * 0.2, 0, sparkKey)
    tip.setOrigin(0.5, 0.5)
    tip.setDisplaySize(h * 0.38, h * 0.38)
    tip.setBlendMode(ADD)
    tip.setTint(0xffffff)
    tip.setAlpha(0.78)
    root.add(tip)
  }

  return { root, visualDx: 0, visualDy: 0 }
}

export function spawnEzrealTrueshotCast(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const pulseKey = pick(scene, EZREAL_SPELL_VFX.rCastPulse, EZREAL_SPELL_VFX.commonCrystal)
  if (pulseKey) {
    const pulse = scene.add.image(x, y, pulseKey)
    pulse.setDepth(depth + 6)
    pulse.setRotation(angle)
    pulse.setDisplaySize(26, 26)
    pulse.setBlendMode(ADD)
    pulse.setTint(R_HOT)
    pulse.setAlpha(0.82)
    scene.tweens.add({
      targets: pulse,
      alpha: 0,
      scale: 1.22,
      duration: 240,
      ease: 'Sine.easeOut',
      onComplete: () => pulse.destroy(),
    })
  }

  const bowKey = pick(scene, EZREAL_SPELL_VFX.rBowTex)
  if (bowKey) {
    const bow = scene.add.image(x, y, bowKey)
    bow.setDepth(depth + 5)
    bow.setRotation(angle)
    bow.setDisplaySize(22, 22)
    bow.setBlendMode(ADD)
    bow.setAlpha(0.62)
    scene.tweens.add({
      targets: bow,
      alpha: 0,
      duration: 280,
      ease: 'Sine.easeOut',
      onComplete: () => bow.destroy(),
    })
  }

  const flareKey = pick(scene, EZREAL_SPELL_VFX.eGlowFlare, EZREAL_SPELL_VFX.eFlare)
  if (flareKey) {
    const flare = scene.add.image(x + Math.cos(angle) * 4, y + Math.sin(angle) * 4, flareKey)
    flare.setDepth(depth + 7)
    flare.setRotation(angle)
    flare.setDisplaySize(18, 14)
    flare.setBlendMode(ADD)
    flare.setTint(R_CORE)
    flare.setAlpha(0.55)
    scene.tweens.add({
      targets: flare,
      alpha: 0,
      duration: 200,
      onComplete: () => flare.destroy(),
    })
  }
}

/** Fin de trayectoria — disipación en la punta. */
export function spawnEzrealTrueshotDissipate(
  scene: Phaser.Scene,
  x: number,
  y: number,
  nx: number,
  ny: number,
  depth: number,
  beamWidth: number,
) {
  const angle = Math.atan2(ny, nx)
  const { w, h } = crescentSize(beamWidth)
  const glowKey = pick(scene, EZREAL_SPELL_VFX.rGlow)
  if (glowKey) {
    const bloom = scene.add.image(x, y, glowKey)
    bloom.setDepth(depth + 4)
    bloom.setRotation(angle + Math.PI / 2)
    bloom.setDisplaySize(w * 1.1, h * 1.1)
    bloom.setBlendMode(ADD)
    bloom.setTint(R_BEAM)
    bloom.setAlpha(0.55)
    scene.tweens.add({
      targets: bloom,
      alpha: 0,
      scale: 1.25,
      duration: 360,
      ease: 'Sine.easeOut',
      onComplete: () => bloom.destroy(),
    })
  }
  const sparkKey = pick(scene, EZREAL_SPELL_VFX.qHitSpark)
  if (sparkKey) {
    const spark = scene.add.image(x, y, sparkKey)
    spark.setDepth(depth + 5)
    spark.setDisplaySize(22, 22)
    spark.setBlendMode(ADD)
    spark.setTint(R_CORE)
    spark.setAlpha(0.85)
    scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 1.3,
      duration: 280,
      onComplete: () => spark.destroy(),
    })
  }
}
