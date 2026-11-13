import * as Phaser from 'phaser'
import { EZREAL_SPELL_VFX } from './ezrealAuthenticSpellVfx'

const ADD = Phaser.BlendModes.ADD
const E_TINT = 0xfde047
const E_CORE = 0xfffceb
const E_TRAIL = 0xffc933
const E_TAIL = 0xf5b942
/** Pies en (x,y); torso bajo para halo compacto al aterrizar. */
const TORSO_Y = -18
const LAND_Y = -11
/** El z_ring lleva algo de padding abajo-derecha en la textura 128². */
const ARRIVE_RING_NUDGE_X = 0
const ARRIVE_RING_NUDGE_Y = 2

function pick(scene: Phaser.Scene, ...keys: string[]): string | null {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

/** Poof al salir — chispas sueltas, sin orbe central. */
function spawnArcaneShiftDepart(scene: Phaser.Scene, x: number, y: number, depth: number) {
  const cy = y + TORSO_Y
  const ballKey = pick(scene, EZREAL_SPELL_VFX.eBall)
  const angles = [0.2, 0.9, 1.6, 2.35, 3.1, 3.85, 4.55, 5.25]
  for (let i = 0; i < angles.length; i += 1) {
    if (!ballKey) break
    const a = angles[i]
    const rad = 11 + (i % 3) * 3
    const px = x + Math.cos(a) * rad
    const py = cy + Math.sin(a) * rad * 0.65
    const spark = scene.add.image(px, py, ballKey)
    spark.setDepth(depth + 4)
    spark.setDisplaySize(3.5, 3.5)
    spark.setBlendMode(ADD)
    spark.setTint(E_CORE)
    spark.setAlpha(0.42)
    scene.tweens.add({
      targets: spark,
      alpha: 0,
      x: px + Math.cos(a) * 6,
      y: py + Math.sin(a) * 4,
      scale: 0.85,
      duration: 220,
      delay: i * 18,
      ease: 'Sine.easeOut',
      onComplete: () => spark.destroy(),
    })
  }

  const flareKey = pick(scene, EZREAL_SPELL_VFX.eGlowFlare, EZREAL_SPELL_VFX.eFlare)
  if (flareKey) {
    const flare = scene.add.image(x, cy, flareKey)
    flare.setDepth(depth + 3)
    flare.setDisplaySize(10, 10)
    flare.setBlendMode(ADD)
    flare.setTint(E_TINT)
    flare.setAlpha(0.28)
    scene.tweens.add({
      targets: flare,
      alpha: 0,
      scale: 1.08,
      duration: 180,
      ease: 'Sine.easeOut',
      onComplete: () => flare.destroy(),
    })
  }
}

/** Halo al llegar — anillo chico centrado en el aterrizaje. */
function spawnArcaneShiftArrive(scene: Phaser.Scene, x: number, y: number, depth: number) {
  const cx = x + ARRIVE_RING_NUDGE_X
  const cy = y + LAND_Y + ARRIVE_RING_NUDGE_Y

  const ringKey = pick(scene, EZREAL_SPELL_VFX.eRing)
  if (ringKey) {
    const ring = scene.add.image(cx, cy, ringKey)
    ring.setOrigin(0.5, 0.5)
    ring.setDepth(depth + 4)
    ring.setDisplaySize(17, 17)
    ring.setBlendMode(ADD)
    ring.setTint(E_TINT)
    ring.setAlpha(0.46)
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 200,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    })
  }

  const ballKey = pick(scene, EZREAL_SPELL_VFX.eBall)
  if (ballKey) {
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 2
      const px = cx + Math.cos(a) * 7
      const py = cy + Math.sin(a) * 5
      const spark = scene.add.image(px, py, ballKey)
      spark.setDepth(depth + 5)
      spark.setDisplaySize(2.5, 2.5)
      spark.setBlendMode(ADD)
      spark.setTint(E_CORE)
      spark.setAlpha(0.45)
      scene.tweens.add({
        targets: spark,
        alpha: 0,
        duration: 180,
        delay: 16 + i * 10,
        ease: 'Sine.easeOut',
        onComplete: () => spark.destroy(),
      })
    }
  }
}

export function spawnEzrealArcaneShiftCast(
  scene: Phaser.Scene,
  x: number,
  y: number,
  _angle: number,
  depth: number,
  atDest = false,
) {
  if (atDest) spawnArcaneShiftArrive(scene, x, y, depth)
  else spawnArcaneShiftDepart(scene, x, y, depth)
}

/** Misil homing — cometa dorado (cola larga + punta afilada), como Arcane Shift en cliente. */
export function createArcaneShiftMissileVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const root = scene.add.container(x, y + TORSO_Y * 0.35)
  root.setDepth(depth + 5)
  root.setRotation(angle)

  const trailAnchorX = 2
  const trailLen = 48
  let trailBack: Phaser.GameObjects.TileSprite | null = null
  let trailMain: Phaser.GameObjects.TileSprite | null = null
  const trailKey = pick(
    scene,
    EZREAL_SPELL_VFX.baMis,
    EZREAL_SPELL_VFX.zBeaconTrail,
    EZREAL_SPELL_VFX.qTrail,
  )
  if (trailKey) {
    trailBack = scene.add.tileSprite(trailAnchorX, 0, trailLen, 11, trailKey)
    trailBack.setOrigin(1, 0.5)
    trailBack.setAlpha(0.26)
    trailBack.setBlendMode(ADD)
    trailBack.setTint(E_TAIL)
    trailBack.setTileScale(0.1, 0.085)
    root.add(trailBack)

    trailMain = scene.add.tileSprite(trailAnchorX, 0, trailLen, 9, trailKey)
    trailMain.setOrigin(1, 0.5)
    trailMain.setAlpha(0.62)
    trailMain.setBlendMode(ADD)
    trailMain.setTint(E_TRAIL)
    trailMain.setTileScale(0.11, 0.095)
    root.add(trailMain)
  }

  const flareKey = pick(scene, EZREAL_SPELL_VFX.eFlare, EZREAL_SPELL_VFX.eGlowFlare)
  if (flareKey) {
    const tailBloom = scene.add.image(trailAnchorX - 6, 0, flareKey)
    tailBloom.setOrigin(1, 0.5)
    tailBloom.setDisplaySize(28, 10)
    tailBloom.setBlendMode(ADD)
    tailBloom.setTint(E_TINT)
    tailBloom.setAlpha(0.38)
    root.add(tailBloom)
  }

  const wispKey = pick(scene, EZREAL_SPELL_VFX.baWhisps)
  if (wispKey) {
    const wisp = scene.add.image(-8, 0, wispKey)
    wisp.setOrigin(1, 0.5)
    wisp.setDisplaySize(20, 9)
    wisp.setBlendMode(ADD)
    wisp.setTint(E_TRAIL)
    wisp.setAlpha(0.34)
    root.add(wisp)
  }

  const sliverKey = pick(scene, EZREAL_SPELL_VFX.zSliver)
  if (sliverKey) {
    const core = scene.add.image(0, 0, sliverKey)
    core.setOrigin(0.18, 0.5)
    core.setDisplaySize(40, 11)
    core.setBlendMode(ADD)
    core.setTint(E_CORE)
    core.setAlpha(0.88)
    root.add(core)

    const coreOuter = scene.add.image(-2, 0, sliverKey)
    coreOuter.setOrigin(0.12, 0.5)
    coreOuter.setDisplaySize(46, 14)
    coreOuter.setBlendMode(ADD)
    coreOuter.setTint(E_TINT)
    coreOuter.setAlpha(0.42)
    root.add(coreOuter)
  }

  const glowKey = pick(scene, EZREAL_SPELL_VFX.baGlow)
  if (glowKey) {
    const headGlow = scene.add.image(4, 0, glowKey)
    headGlow.setOrigin(0.35, 0.5)
    headGlow.setDisplaySize(15, 13)
    headGlow.setBlendMode(ADD)
    headGlow.setTint(E_CORE)
    headGlow.setAlpha(0.82)
    root.add(headGlow)
  }

  const ballKey = pick(scene, EZREAL_SPELL_VFX.eBall)
  if (ballKey) {
    const tip = scene.add.image(10, 0, ballKey)
    tip.setOrigin(0.42, 0.5)
    tip.setDisplaySize(15, 19)
    tip.setBlendMode(ADD)
    tip.setTint(0xffffff)
    tip.setAlpha(0.96)
    root.add(tip)

    const tipWarm = scene.add.image(9, 0, ballKey)
    tipWarm.setOrigin(0.42, 0.5)
    tipWarm.setDisplaySize(13, 16)
    tipWarm.setBlendMode(ADD)
    tipWarm.setTint(E_TINT)
    tipWarm.setAlpha(0.75)
    root.add(tipWarm)
  }

  return {
    root,
    visualDx: 0,
    visualDy: 0,
    scrollTrail:
      trailMain || trailBack
        ? () => {
            if (trailMain) trailMain.tilePositionX -= 5.6
            if (trailBack) trailBack.tilePositionX -= 4.4
          }
        : undefined,
  }
}

export function spawnEzrealArcaneShiftMissileHit(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  const flareKey = pick(scene, EZREAL_SPELL_VFX.eFlare)
  if (flareKey) {
    const hit = scene.add.image(x, y, flareKey)
    hit.setDepth(depth + 5)
    hit.setDisplaySize(16, 14)
    hit.setBlendMode(ADD)
    hit.setTint(E_CORE)
    hit.setAlpha(0.55)
    scene.tweens.add({
      targets: hit,
      alpha: 0,
      scale: 1.08,
      duration: 200,
      ease: 'Sine.easeOut',
      onComplete: () => hit.destroy(),
    })
  }
}
