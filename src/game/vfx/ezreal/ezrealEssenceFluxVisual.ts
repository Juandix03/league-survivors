import * as Phaser from 'phaser'
import { EZREAL_SPELL_VFX } from './ezrealAuthenticSpellVfx'

const ADD = Phaser.BlendModes.ADD
const W_TINT = 0xfbbf24
const W_GLOW = 0xfde68a

/** Spell2 — mismo release que básico/Q (~frame 3 @ 24fps). */
export const EZREAL_W_RELEASE_MS = 110

function pick(scene: Phaser.Scene, ...keys: string[]): string | null {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

export function spawnEzrealEssenceFluxCast(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const ringKey = pick(scene, EZREAL_SPELL_VFX.wRing)
  if (ringKey) {
    const ring = scene.add.image(x, y, ringKey)
    ring.setDepth(depth + 5)
    ring.setRotation(angle)
    ring.setDisplaySize(22, 22)
    ring.setBlendMode(ADD)
    ring.setTint(W_TINT)
    ring.setAlpha(0.9)
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.22,
      duration: 160,
      onComplete: () => ring.destroy(),
    })
  }
  const glowKey = pick(scene, EZREAL_SPELL_VFX.baGlow)
  if (glowKey) {
    const glow = scene.add.image(x, y, glowKey)
    glow.setDepth(depth + 4)
    glow.setRotation(angle)
    glow.setDisplaySize(14, 11)
    glow.setAlpha(0.65)
    glow.setBlendMode(ADD)
    glow.setTint(W_GLOW)
    scene.tweens.add({
      targets: glow,
      alpha: 0,
      scale: 1.15,
      duration: 130,
      onComplete: () => glow.destroy(),
    })
  }
}

function createEzrealEssenceFluxOrbLayers(scene: Phaser.Scene, root: Phaser.GameObjects.Container) {
  const ringKey = pick(scene, EZREAL_SPELL_VFX.wRing)
  if (ringKey) {
    const hoop = scene.add.image(0, 0, ringKey)
    hoop.setDisplaySize(36, 36)
    hoop.setBlendMode(ADD)
    hoop.setTint(W_TINT)
    hoop.setAlpha(0.9)
    root.add(hoop)
  }

  let spin: Phaser.GameObjects.Image | null = null
  const spinKey = pick(scene, EZREAL_SPELL_VFX.wSpin)
  if (spinKey) {
    spin = scene.add.image(0, 0, spinKey)
    spin.setDisplaySize(22, 22)
    spin.setBlendMode(ADD)
    spin.setTint(W_GLOW)
    spin.setAlpha(0.5)
    root.add(spin)
  }

  const orbKey = pick(scene, EZREAL_SPELL_VFX.wOrb)
  if (orbKey) {
    const core = scene.add.image(0, 0, orbKey)
    core.setDisplaySize(9, 9)
    core.setBlendMode(ADD)
    core.setTint(W_GLOW)
    core.setAlpha(0.35)
    root.add(core)
  }

  return {
    scrollTrail: () => {
      if (spin) spin.angle += 6
    },
  }
}

export function createEzrealEssenceFluxBoltVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): {
  root: Phaser.GameObjects.Container
  visualDx?: number
  visualDy?: number
  scrollTrail?: () => void
} {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 5)
  root.setRotation(angle)
  const layered = createEzrealEssenceFluxOrbLayers(scene, root)
  return { root, scrollTrail: layered.scrollTrail }
}

/** Fin de trayectoria — el aro se desvanece, sin explosión. */
export function spawnEzrealEssenceFluxDissipate(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  const ringKey = pick(scene, EZREAL_SPELL_VFX.wRing)
  if (ringKey) {
    const ring = scene.add.image(x, y, ringKey)
    ring.setDepth(depth + 3)
    ring.setDisplaySize(28, 28)
    ring.setBlendMode(ADD)
    ring.setTint(W_GLOW)
    ring.setAlpha(0.45)
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 0.82,
      duration: 200,
      onComplete: () => ring.destroy(),
    })
  }
}

export function attachEzrealEssenceMark(
  scene: Phaser.Scene,
  enemyRoot: Phaser.GameObjects.Container,
): Phaser.GameObjects.Container | null {
  const ringKey = pick(scene, EZREAL_SPELL_VFX.wRing)
  if (!ringKey) return null

  const anchor = scene.add.container(0, -20)
  const ring = scene.add.image(0, 0, ringKey)
  ring.setDisplaySize(40, 40)
  ring.setBlendMode(ADD)
  ring.setTint(W_TINT)
  ring.setAlpha(0.92)
  anchor.add(ring)

  const spinKey = pick(scene, EZREAL_SPELL_VFX.wSpin)
  if (spinKey) {
    const rune = scene.add.image(0, 0, spinKey)
    rune.setDisplaySize(24, 24)
    rune.setBlendMode(ADD)
    rune.setTint(W_GLOW)
    rune.setAlpha(0.55)
    anchor.add(rune)
    scene.tweens.add({
      targets: rune,
      angle: 360,
      duration: 1400,
      repeat: -1,
    })
  }

  scene.tweens.add({
    targets: ring,
    alpha: 0.55,
    scaleX: 1.06,
    scaleY: 1.06,
    duration: 480,
    yoyo: true,
    repeat: -1,
  })

  enemyRoot.add(anchor)
  return anchor
}

/** Detonación al consumir la marca (AA / Q / E / R). */
export function spawnEzrealEssenceMarkDetonate(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  const ringKey = pick(scene, EZREAL_SPELL_VFX.wRing)
  if (ringKey) {
    const burst = scene.add.image(x, y - 8, ringKey)
    burst.setDepth(depth + 6)
    burst.setDisplaySize(30, 30)
    burst.setBlendMode(ADD)
    burst.setTint(W_TINT)
    burst.setAlpha(0.95)
    scene.tweens.add({
      targets: burst,
      alpha: 0,
      scale: 1.45,
      duration: 240,
      onComplete: () => burst.destroy(),
    })
  }
  const spinKey = pick(scene, EZREAL_SPELL_VFX.wSpin)
  if (spinKey) {
    const spark = scene.add.image(x, y - 8, spinKey)
    spark.setDepth(depth + 7)
    spark.setDisplaySize(22, 22)
    spark.setBlendMode(ADD)
    spark.setTint(0xffffff)
    spark.setAlpha(0.85)
    scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 1.55,
      duration: 200,
      onComplete: () => spark.destroy(),
    })
  }
  const orbKey = pick(scene, EZREAL_SPELL_VFX.wOrb)
  if (orbKey) {
    const core = scene.add.image(x, y - 8, orbKey)
    core.setDepth(depth + 5)
    core.setDisplaySize(14, 14)
    core.setBlendMode(ADD)
    core.setTint(W_GLOW)
    core.setAlpha(0.7)
    scene.tweens.add({
      targets: core,
      alpha: 0,
      scale: 0.5,
      duration: 180,
      onComplete: () => core.destroy(),
    })
  }
}
