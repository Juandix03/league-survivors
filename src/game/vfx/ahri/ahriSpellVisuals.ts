import * as Phaser from 'phaser'
import { AHRI_SPELL_PARTICLE_VFX } from './ahriAuthenticSpellVfx'
import {
  AHRI_R_DASH_CAPSULE_SPRITE,
  AHRI_W_FOXFIRE_ALT_SPRITE,
  AHRI_W_FOXFIRE_SPRITE,
} from './ahriProjectileSprites'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

export type AhriQOrbVisualPhase = 'out' | 'return'

export type AhriBasicProjectileVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Image
  /** Escala base del mote (sync de pulso). */
  bodyBaseScale: number
}

export type AhriQOrbVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Image
  glow?: Phaser.GameObjects.Image
  core?: Phaser.GameObjects.Image
  phase: AhriQOrbVisualPhase
}

export type AhriFoxFireVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Image
  fireGlow?: Phaser.GameObjects.Image
  bodyBaseScale: number
}

export type AhriCharmBoltVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Image
  glow?: Phaser.GameObjects.Image
  core?: Phaser.GameObjects.Image
}

const CHARM_BODY_SCALE = 0.19
const CHARM_GLOW_SCALE = 0.24
const CHARM_CORE_SCALE = 0.105

export type AhriSpiritRushVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Image
  aura?: Phaser.GameObjects.Image
}

export type AhriFoxFireVariant = 'primary' | 'alt'

const TINT = {
  /** Autoataque — espíritu azul (misma línea que Q ida / W). */
  baCore: 0x22d3ee,
  baMote: 0xffffff,
  baGlow: 0x0ea5e9,
  baTrail: 0x38bdf8,
  /** Ida — cian/azul LoL (Orb of Deception outbound). */
  qOutAura: 0x0284c7,
  qOutRing: 0x22d3ee,
  qOutCore: 0x7dd3fc,
  qOutTrail: 0x0ea5e9,
  /** Vuelta — verdadero. */
  qReturnAura: 0x16a34a,
  qReturnRing: 0x4ade80,
  qReturnCore: 0xbbf7d0,
  qReturnTrail: 0x22c55e,
  /** Fuego zorruno — azul espiritual (no verde/rays del atlas). */
  wFox: 0x22d3ee,
  wFoxCore: 0x7dd3fc,
  wFoxFlame: 0x38bdf8,
  eAura: 0xff3eb5,
  eHeart: 0xffffff,
  eHeartCore: 0xff85c1,
  eRibbon: 0xffc4e8,
  eTrail: 0xff6ec7,
  eSmoke: 0xdb2777,
  eSpark: 0xfdf2f8,
  /** Impulso espiritual — espíritu azul (como W/Q), no magenta/amarillo. */
  rSpirit: 0x22d3ee,
  rSpiritCore: 0x7dd3fc,
  rSpiritAura: 0x0ea5e9,
  rSpiritTrail: 0x38bdf8,
  rDash: 0x38bdf8,
} as const

function addRDashNoiseWisp(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
): Phaser.GameObjects.Image | null {
  const key = AHRI_SPELL_PARTICLE_VFX.rDashBillboard
  if (!scene.textures.exists(key)) {
    return null
  }
  const source = scene.textures.get(key).getSourceImage() as
    | HTMLImageElement
    | HTMLCanvasElement
  const tw = source.width ?? 128
  const th = source.height ?? 128
  const wisp = scene.add.image(0, -6, key)
  wisp.setOrigin(0.5, 1)
  wisp.setCrop(0, 0, tw, Math.max(8, Math.floor(th * 0.42)))
  wisp.setScale(0.11, 0.08)
  wisp.setAlpha(0.38)
  wisp.setTint(TINT.rSpiritCore)
  wisp.setBlendMode(ADD)
  root.add(wisp)
  return wisp
}

function addMaskLayer(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  textureKey: string,
  scale: number,
  tint: number,
  alpha = 0.9,
): Phaser.GameObjects.Image | null {
  if (!scene.textures.exists(textureKey)) {
    return null
  }
  const img = scene.add.image(0, 0, textureKey)
  img.setOrigin(0.5, 0.5)
  img.setScale(scale)
  img.setTint(tint)
  img.setAlpha(alpha)
  img.setBlendMode(ADD)
  root.add(img)
  return img
}

/** Optional mesh bake core (ADD — negro del PNG no tapa el pasto). */
function addBakedCore(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  spriteKey: string,
  scale: number,
  tint: number,
): Phaser.GameObjects.Image | null {
  if (!scene.textures.exists(spriteKey)) {
    return null
  }
  const img = scene.add.image(0, 0, spriteKey)
  img.setOrigin(0.5, 0.5)
  img.setScale(scale)
  img.setTint(tint)
  img.setAlpha(0.55)
  img.setBlendMode(ADD)
  root.add(img)
  return img
}

const BA_MOTE_SCALE = 0.036

/**
 * Autoataque — **bolita** mínima (`ba_mote` + halo chico).
 * Sin texturas de Q ni silueta de zorro (eso es W).
 */
export function createAhriBasicProjectileVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): AhriBasicProjectileVisual | null {
  const root = scene.add.container(x, y)
  root.setDepth(depth)
  root.setRotation(angle)

  addMaskLayer(
    scene,
    root,
    AHRI_SPELL_PARTICLE_VFX.baOrbBackground,
    0.042,
    TINT.baGlow,
    0.32,
  )

  const body =
    addMaskLayer(scene, root, AHRI_SPELL_PARTICLE_VFX.baMote, BA_MOTE_SCALE, TINT.baMote, 0.88) ??
    addMaskLayer(scene, root, AHRI_SPELL_PARTICLE_VFX.baOrbBackground, 0.038, TINT.baCore, 0.75)

  if (!body) {
    root.destroy()
    return null
  }

  return { root, body, bodyBaseScale: BA_MOTE_SCALE }
}

export function spawnAhriBaTrailSegment(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const key = scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.baTrail)
    ? AHRI_SPELL_PARTICLE_VFX.baTrail
    : scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.qTrail01)
      ? AHRI_SPELL_PARTICLE_VFX.qTrail01
      : null
  if (!key) {
    return
  }
  const trail = scene.add.image(x, y, key)
  trail.setOrigin(0.9, 0.5)
  trail.setRotation(angle + Math.PI)
  trail.setDepth(depth - 1)
  trail.setScale(0.052, 0.038)
  trail.setTint(TINT.baTrail)
  trail.setAlpha(0.48)
  trail.setBlendMode(ADD)
  scene.tweens.add({
    targets: trail,
    alpha: 0,
    scaleX: trail.scaleX * 0.5,
    duration: 240,
    onComplete: () => trail.destroy(),
  })
}

export function syncAhriBasicProjectileMotion(
  visual: AhriBasicProjectileVisual,
  vx: number,
  vy: number,
  timeMs: number,
) {
  if (Math.abs(vx) + Math.abs(vy) > 0.01) {
    visual.root.setRotation(Math.atan2(vy, vx))
  }
  const pulse = 0.94 + Math.sin(timeMs / 80) * 0.04
  visual.body.setScale(visual.bodyBaseScale * pulse)
}

function qOrbTints(phase: AhriQOrbVisualPhase) {
  const isReturn = phase === 'return'
  return {
    aura: isReturn ? TINT.qReturnAura : TINT.qOutAura,
    ring: isReturn ? TINT.qReturnRing : TINT.qOutRing,
    core: isReturn ? TINT.qReturnCore : TINT.qOutCore,
    trail: isReturn ? TINT.qReturnTrail : TINT.qOutTrail,
  }
}

/** Orbe Q — halo azul + anillo + núcleo (sin bake blanco que tapa todo). */
export function createAhriQOrbVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  phase: AhriQOrbVisualPhase,
): AhriQOrbVisual | null {
  const t = qOrbTints(phase)
  const root = scene.add.container(x, y)
  root.setDepth(depth)

  const glow = addMaskLayer(
    scene,
    root,
    AHRI_SPELL_PARTICLE_VFX.qOrbBackground,
    phase === 'return' ? 0.14 : 0.17,
    t.aura,
    phase === 'return' ? 0.42 : 0.48,
  )

  const body = addMaskLayer(
    scene,
    root,
    AHRI_SPELL_PARTICLE_VFX.qOrbEdge,
    phase === 'return' ? 0.095 : 0.102,
    t.ring,
    0.88,
  )

  const core = addMaskLayer(
    scene,
    root,
    AHRI_SPELL_PARTICLE_VFX.qOrbBackground,
    phase === 'return' ? 0.048 : 0.052,
    t.core,
    0.82,
  )

  if (!body) {
    root.destroy()
    return null
  }

  addMaskLayer(scene, root, AHRI_SPELL_PARTICLE_VFX.qShape, 0.07, t.ring, 0.38)

  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.qSpeed)) {
    const speed = scene.add.image(0, 0, AHRI_SPELL_PARTICLE_VFX.qSpeed)
    speed.setOrigin(0.5, 0.5)
    speed.setScale(phase === 'return' ? 0.055 : 0.062)
    speed.setTint(t.trail)
    speed.setAlpha(0.35)
    speed.setBlendMode(ADD)
    root.add(speed)
  }

  return { root, body, glow: glow ?? undefined, core: core ?? undefined, phase }
}

export function applyAhriQOrbReturnLook(visual: AhriQOrbVisual) {
  visual.phase = 'return'
  const t = qOrbTints('return')
  visual.glow?.setTint(t.aura)
  visual.glow?.setAlpha(0.42)
  visual.glow?.setScale(0.14)
  visual.body.setTint(t.ring)
  visual.core?.setTint(t.core)
  visual.core?.setScale(0.048)
}

/** Estela curva (q_trail_01/02) — la cinta azul detrás del orbe en LoL. */
export function spawnAhriQOrbTrailSegment(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
  phase: AhriQOrbVisualPhase,
) {
  const t = qOrbTints(phase)
  const useAlt =
    scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.qTrail02) && Math.random() > 0.45
  const key = useAlt
    ? AHRI_SPELL_PARTICLE_VFX.qTrail02
    : AHRI_SPELL_PARTICLE_VFX.qTrail01
  if (!scene.textures.exists(key)) {
    return
  }

  const trail = scene.add.image(x, y, key)
  trail.setOrigin(0.92, 0.5)
  trail.setRotation(angle + Math.PI)
  trail.setDepth(depth - 1)
  trail.setScale(phase === 'return' ? 0.1 : 0.125, phase === 'return' ? 0.085 : 0.1)
  trail.setTint(t.trail)
  trail.setAlpha(phase === 'return' ? 0.62 : 0.78)
  trail.setBlendMode(ADD)
  scene.tweens.add({
    targets: trail,
    alpha: 0,
    scaleX: trail.scaleX * 0.55,
    scaleY: trail.scaleY * 0.7,
    duration: phase === 'return' ? 260 : 300,
    onComplete: () => trail.destroy(),
  })
}

export function syncAhriQOrbVisualMotion(
  visual: AhriQOrbVisual,
  vx: number,
  vy: number,
  timeMs: number,
) {
  if (Math.abs(vx) + Math.abs(vy) > 0.01) {
    visual.root.setRotation(Math.atan2(vy, vx))
  }
  const pulse = 0.92 + Math.sin(timeMs / 90) * 0.06
  visual.body.setScale(0.102 * pulse)
  visual.glow?.setAlpha(
    (visual.phase === 'return' ? 0.42 : 0.48) +
      Math.sin(timeMs / 120) * 0.06,
  )
}

function addWFoxFireCell(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
): Phaser.GameObjects.Image | undefined {
  const key = AHRI_SPELL_PARTICLE_VFX.wFireAtlas
  if (!scene.textures.exists(key)) {
    return undefined
  }
  const source = scene.textures.get(key).getSourceImage() as
    | HTMLImageElement
    | HTMLCanvasElement
  const tw = source.width ?? 128
  const th = source.height ?? 128
  const fire = scene.add.image(0, -1, key)
  fire.setOrigin(0.5, 0.5)
  // Una celda del atlas 2×2 (llama wispy), no las 4 estrellas juntas.
  fire.setCrop(0, 0, Math.floor(tw / 2), Math.floor(th / 2))
  fire.setScale(0.072)
  fire.setAlpha(0.48)
  fire.setTint(TINT.wFoxFlame)
  fire.setBlendMode(ADD)
  root.add(fire)
  return fire
}

/** Textura LoL ya coloreada (heart_01 UV) — SCREEN, sin tint blanco que la amarillea. */
function addColoredVfxLayer(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  textureKey: string,
  scale: number,
  alpha: number,
  blend: Phaser.BlendModes = SCREEN,
): Phaser.GameObjects.Image | null {
  if (!scene.textures.exists(textureKey)) {
    return null
  }
  const img = scene.add.image(0, 0, textureKey)
  img.setOrigin(0.5, 0.5)
  img.setScale(scale)
  img.setAlpha(alpha)
  img.setBlendMode(blend)
  root.add(img)
  return img
}

function addAhriESmokeCell(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
  scale: number,
  alpha: number,
  cellIndex?: number,
) {
  const key = AHRI_SPELL_PARTICLE_VFX.eSmoke
  if (!scene.textures.exists(key)) {
    return
  }
  const source = scene.textures.get(key).getSourceImage() as
    | HTMLImageElement
    | HTMLCanvasElement
  const tw = source.width ?? 128
  const th = source.height ?? 128
  const cw = Math.floor(tw / 2)
  const ch = Math.floor(th / 2)
  const cell = cellIndex ?? Math.floor(Math.random() * 4)
  const col = cell % 2
  const row = Math.floor(cell / 2)
  const smoke = scene.add.image(x, y, key)
  smoke.setOrigin(0.5, 0.5)
  smoke.setCrop(col * cw, row * ch, cw, ch)
  smoke.setRotation(angle + (Math.random() - 0.5) * 0.5)
  smoke.setDepth(depth - 1)
  smoke.setScale(scale)
  smoke.setAlpha(alpha)
  smoke.setTint(TINT.eSmoke)
  smoke.setBlendMode(ADD)
  scene.tweens.add({
    targets: smoke,
    alpha: 0,
    scale: scale * 1.35,
    duration: 360 + Math.random() * 120,
    onComplete: () => smoke.destroy(),
  })
}

const W_FOX_BODY_SCALE = 0.138
const R_SPIRIT_FOX_BODY_SCALE = 0.118

function buildAhriFoxSpiritLayers(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  variant: AhriFoxFireVariant,
  bodyScale: number,
  withBake: boolean,
): AhriFoxFireVisual | null {
  const foxKey =
    variant === 'alt'
      ? AHRI_SPELL_PARTICLE_VFX.wOrbFox03
      : AHRI_SPELL_PARTICLE_VFX.wOrbFox01
  const ringScale = bodyScale * 0.9
  const bakeScale = bodyScale * 0.94

  addMaskLayer(scene, root, AHRI_SPELL_PARTICLE_VFX.wRingflare, ringScale, 0x0ea5e9, 0.48)

  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.wSmallStarTrail)) {
    const halo = scene.add.image(0, 0, AHRI_SPELL_PARTICLE_VFX.wSmallStarTrail)
    halo.setOrigin(0.5, 0.5)
    halo.setScale(bodyScale * 0.8)
    halo.setAlpha(0.4)
    halo.setTint(TINT.wFoxCore)
    halo.setBlendMode(ADD)
    root.add(halo)
  }

  if (withBake) {
    addBakedCore(
      scene,
      root,
      variant === 'alt'
        ? AHRI_W_FOXFIRE_ALT_SPRITE.key
        : AHRI_W_FOXFIRE_SPRITE.key,
      bakeScale,
      TINT.wFoxFlame,
    )
  }

  const body =
    addMaskLayer(scene, root, foxKey, bodyScale, TINT.wFox, 0.98) ??
    addMaskLayer(scene, root, AHRI_SPELL_PARTICLE_VFX.wOrbFox01, bodyScale, TINT.wFox, 0.95)

  if (!body) {
    return null
  }

  addMaskLayer(scene, root, foxKey, bodyScale * 0.55, TINT.wFoxCore, 0.35)

  const fireGlow = addWFoxFireCell(scene, root)
  if (fireGlow) {
    fireGlow.setScale(bodyScale * 0.68)
    fireGlow.setAlpha(0.58)
  }

  return { root, body, fireGlow, bodyBaseScale: bodyScale }
}

/** W — **silueta zorro** grande + anillo + llama (no confundir con bolita del AA). */
export function createAhriFoxFireVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  variant: AhriFoxFireVariant = 'primary',
): AhriFoxFireVisual | null {
  const root = scene.add.container(x, y)
  root.setDepth(depth)
  const built = buildAhriFoxSpiritLayers(
    scene,
    root,
    variant,
    W_FOX_BODY_SCALE,
    true,
  )
  if (!built) {
    root.destroy()
    return null
  }
  return built
}

export function syncAhriFoxFireVisualMotion(
  visual: AhriFoxFireVisual,
  timeMs: number,
  vx: number,
  vy: number,
) {
  if (Math.abs(vx) + Math.abs(vy) > 0.01) {
    visual.root.setRotation(Math.atan2(vy, vx))
  }
  const pulse = 0.93 + Math.sin(timeMs / 75) * 0.06
  visual.body.setScale(visual.bodyBaseScale * pulse)
  visual.fireGlow?.setAlpha(0.5 + Math.sin(timeMs / 90) * 0.12)
}

/** Estela azul detrás del espíritu (w_smallstartrail / trail_erode). */
export function spawnAhriFoxFireTrailSegment(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const key = scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.wSmallStarTrail)
    ? AHRI_SPELL_PARTICLE_VFX.wSmallStarTrail
    : scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.wTrailErode)
      ? AHRI_SPELL_PARTICLE_VFX.wTrailErode
      : null
  if (!key) {
    return
  }
  const trail = scene.add.image(x, y, key)
  trail.setOrigin(0.85, 0.5)
  trail.setRotation(angle + Math.PI)
  trail.setDepth(depth - 1)
  trail.setScale(0.11, 0.075)
  trail.setTint(TINT.wFoxFlame)
  trail.setAlpha(0.62)
  trail.setBlendMode(ADD)
  scene.tweens.add({
    targets: trail,
    alpha: 0,
    scaleX: 0.05,
    duration: 220,
    onComplete: () => trail.destroy(),
  })
}

/**
 * E — encanto LoL: `e_heart_01` (UV coloreada) + máscaras ADD.
 * No usar el bake mesh actual (UV en bandas); el corazón legible es la textura SCB.
 */
export function createAhriCharmBoltVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): AhriCharmBoltVisual | null {
  const root = scene.add.container(x, y)
  root.setDepth(depth)
  root.setRotation(angle)

  addMaskLayer(scene, root, AHRI_SPELL_PARTICLE_VFX.wRingflare, 0.11, TINT.eAura, 0.28)

  const glow = addMaskLayer(
    scene,
    root,
    AHRI_SPELL_PARTICLE_VFX.eHeart02,
    CHARM_GLOW_SCALE,
    TINT.eAura,
    0.58,
  )

  const body =
    addColoredVfxLayer(
      scene,
      root,
      AHRI_SPELL_PARTICLE_VFX.eHeartScbTex,
      CHARM_BODY_SCALE,
      0.98,
      SCREEN,
    ) ??
    addMaskLayer(
      scene,
      root,
      AHRI_SPELL_PARTICLE_VFX.eHeartRibbon,
      CHARM_BODY_SCALE,
      TINT.eHeartCore,
      0.9,
    )

  const core = addMaskLayer(
    scene,
    root,
    AHRI_SPELL_PARTICLE_VFX.eHeartRibbon,
    CHARM_CORE_SCALE,
    TINT.eHeart,
    0.42,
  )

  if (!body) {
    root.destroy()
    return null
  }

  return { root, body, glow: glow ?? undefined, core: core ?? undefined }
}

/** Destello rosa al lanzar E (`Ahri_Base_E_mis` cast). */
export function spawnAhriCharmCastFlash(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  if (!scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.baSpeedFlash)) return
  const flash = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.baSpeedFlash)
  flash.setOrigin(0.5, 0.5)
  flash.setRotation(angle)
  flash.setDepth(depth + 1)
  flash.setScale(0.055)
  flash.setAlpha(0.62)
  flash.setTint(TINT.eAura)
  flash.setBlendMode(SCREEN)
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    scale: 0.19,
    duration: 110,
    onComplete: () => flash.destroy(),
  })
}

/** Estela volumétrica rosa (humo 2×2 recortado + chispas), no cinta `e_trail` suelta. */
export function spawnAhriCharmTrailSegment(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
  segmentIndex = 0,
) {
  const backX = (dist: number) => x - Math.cos(angle) * dist
  const backY = (dist: number) => y - Math.sin(angle) * dist

  addAhriESmokeCell(scene, backX(6), backY(6), angle, depth, 0.16, 0.62, segmentIndex % 4)
  addAhriESmokeCell(
    scene,
    backX(18),
    backY(18),
    angle,
    depth,
    0.13,
    0.48,
    (segmentIndex + 2) % 4,
  )
  addAhriESmokeCell(
    scene,
    backX(30),
    backY(30),
    angle,
    depth,
    0.1,
    0.35,
    (segmentIndex + 1) % 4,
  )

  if (
    segmentIndex % 3 === 0 &&
    scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.eTrail)
  ) {
    const trail = scene.add.image(backX(14), backY(14), AHRI_SPELL_PARTICLE_VFX.eTrail)
    trail.setOrigin(0.88, 0.5)
    trail.setRotation(angle + Math.PI)
    trail.setDepth(depth - 2)
    trail.setScale(0.17, 0.12)
    trail.setTint(TINT.eTrail)
    trail.setAlpha(0.38)
    trail.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: trail.scaleX * 0.65,
      scaleY: trail.scaleY * 0.7,
      duration: 340,
      onComplete: () => trail.destroy(),
    })
  }

  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.baMote)) {
    const spark = scene.add.image(backX(10), backY(10), AHRI_SPELL_PARTICLE_VFX.baMote)
    spark.setOrigin(0.5, 0.5)
    spark.setDepth(depth)
    spark.setScale(0.045)
    spark.setAlpha(0.7)
    spark.setTint(TINT.eSpark)
    spark.setBlendMode(ADD)
    scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 0.08,
      duration: 200,
      onComplete: () => spark.destroy(),
    })
  }
}

export function syncAhriCharmBoltVisualMotion(
  visual: AhriCharmBoltVisual,
  vx: number,
  vy: number,
  timeMs: number,
) {
  if (Math.abs(vx) + Math.abs(vy) > 0.01) {
    visual.root.setRotation(Math.atan2(vy, vx))
  }
  const pulse = 0.96 + Math.sin(timeMs / 85) * 0.04
  visual.body.setScale(CHARM_BODY_SCALE * pulse)
  visual.glow?.setScale(CHARM_GLOW_SCALE * pulse)
  visual.glow?.setAlpha(0.52 + Math.sin(timeMs / 120) * 0.1)
  visual.core?.setAlpha(0.38 + Math.sin(timeMs / 70) * 0.12)
}

/** R — cápsula + aura azul; sin billboard cuadrado entero (`ahridash` solo recorte superior). */
export function createAhriSpiritRushVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): AhriSpiritRushVisual | null {
  const root = scene.add.container(x, y)
  root.setDepth(depth)
  root.setRotation(angle)

  addRDashNoiseWisp(scene, root)

  let aura: Phaser.GameObjects.Image | undefined
  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.rAuraGlow)) {
    aura = scene.add.image(0, 0, AHRI_SPELL_PARTICLE_VFX.rAuraGlow)
    aura.setOrigin(0.5, 0.5)
    aura.setScale(0.18)
    aura.setAlpha(0.5)
    aura.setTint(TINT.rSpiritAura)
    aura.setBlendMode(ADD)
    root.add(aura)
  }

  addMaskLayer(scene, root, AHRI_SPELL_PARTICLE_VFX.wOrbFox03, 0.09, TINT.rSpiritCore, 0.4)

  const body =
    addBakedCore(scene, root, AHRI_R_DASH_CAPSULE_SPRITE.key, 0.22, TINT.rSpirit) ??
    addMaskLayer(scene, root, AHRI_SPELL_PARTICLE_VFX.rAirbullet, 0.13, TINT.rSpirit, 0.85)

  if (!body) {
    root.destroy()
    return null
  }

  addMaskLayer(scene, root, AHRI_SPELL_PARTICLE_VFX.qOrbEdge, 0.06, TINT.rSpiritCore, 0.55)

  return { root, body, aura }
}

/** Proyectiles de R — mismo espíritu zorro que W, un poco más chico. */
export function createAhriRSpiritBoltVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  variant: AhriFoxFireVariant = 'primary',
): AhriFoxFireVisual | null {
  const root = scene.add.container(x, y)
  root.setDepth(depth)
  const built = buildAhriFoxSpiritLayers(
    scene,
    root,
    variant,
    R_SPIRIT_FOX_BODY_SCALE,
    true,
  )
  if (!built) {
    root.destroy()
    return null
  }
  return built
}

export function spawnAhriSpiritRushDashBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.rShockblasts)) {
    const blast = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.rShockblasts)
    blast.setOrigin(0.5, 0.5)
    blast.setRotation(angle)
    blast.setDepth(depth + 2)
    blast.setScale(0.14)
    blast.setAlpha(0.75)
    blast.setTint(TINT.rSpiritAura)
    blast.setBlendMode(ADD)
    scene.tweens.add({
      targets: blast,
      alpha: 0,
      scale: 0.28,
      duration: 200,
      onComplete: () => blast.destroy(),
    })
  }
  spawnAhriSpiritRushTrailPuff(scene, x, y, depth)
}

export function spawnAhriSpiritRushTrailSegment(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  spawnAhriSpiritRushTrailPuff(scene, x, y, depth)
  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.rTrail)) {
    const trail = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.rTrail)
    trail.setOrigin(0.85, 0.5)
    trail.setRotation(angle + Math.PI)
    trail.setDepth(depth - 1)
    trail.setScale(0.13, 0.09)
    trail.setTint(TINT.rSpiritTrail)
    trail.setAlpha(0.55)
    trail.setBlendMode(ADD)
    scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: trail.scaleX * 0.55,
      duration: 260,
      onComplete: () => trail.destroy(),
    })
  }
  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.rAuraGlow)) {
    const wisp = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.rAuraGlow)
    wisp.setOrigin(0.5, 0.5)
    wisp.setDepth(depth - 2)
    wisp.setScale(0.08)
    wisp.setAlpha(0.35)
    wisp.setTint(TINT.rSpiritCore)
    wisp.setBlendMode(ADD)
    scene.tweens.add({
      targets: wisp,
      alpha: 0,
      scale: 0.16,
      duration: 300,
      onComplete: () => wisp.destroy(),
    })
  }
}

export function syncAhriSpiritRushVisualMotion(
  visual: AhriSpiritRushVisual,
  x: number,
  y: number,
  angle: number,
  depth: number,
  timeMs: number,
) {
  visual.root.setPosition(x, y)
  visual.root.setDepth(depth)
  visual.root.setRotation(angle)
  const pulse = 0.94 + Math.sin(timeMs / 70) * 0.05
  visual.body.setScale(0.24 * pulse)
  visual.aura?.setScale(0.2 * pulse)
  visual.aura?.setAlpha(0.55 + Math.sin(timeMs / 90) * 0.08)
}

export function spawnAhriBaMuzzleFlash(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  if (!scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.baSpeedFlash)) return
  const flash = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.baSpeedFlash)
  flash.setOrigin(0.5, 0.5)
  flash.setRotation(angle)
  flash.setDepth(depth + 1)
  flash.setScale(0.038)
  flash.setAlpha(0.45)
  flash.setTint(TINT.baCore)
  flash.setBlendMode(SCREEN)
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    scale: 0.16,
    duration: 85,
    onComplete: () => flash.destroy(),
  })
}

/** Aura azul al cast de W (suelo + humo), como `Ahri_Base_W_cas`. */
export function spawnAhriFoxFireCastGroundAura(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.wRingflare)) {
    const ring = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.wRingflare)
    ring.setOrigin(0.5, 0.5)
    ring.setDepth(depth)
    ring.setScale(0.12)
    ring.setAlpha(0.65)
    ring.setTint(0x0ea5e9)
    ring.setBlendMode(ADD)
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 0.32,
      duration: 420,
      onComplete: () => ring.destroy(),
    })
  }
  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.wSmoke)) {
    const smoke = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.wSmoke)
    smoke.setOrigin(0.5, 0.5)
    smoke.setDepth(depth - 1)
    smoke.setScale(0.1)
    smoke.setAlpha(0.4)
    smoke.setTint(0x38bdf8)
    smoke.setBlendMode(ADD)
    scene.tweens.add({
      targets: smoke,
      alpha: 0,
      scale: 0.18,
      duration: 500,
      onComplete: () => smoke.destroy(),
    })
  }
}

export function spawnAhriFoxFireImpactVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  if (!scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.wRingflare)) {
    return
  }
  const hit = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.wRingflare)
  hit.setDepth(depth + 1)
  hit.setOrigin(0.5, 0.5)
  hit.setScale(0.16)
  hit.setTint(0x38bdf8)
  hit.setBlendMode(ADD)
  hit.setAlpha(0.85)
  scene.tweens.add({
    targets: hit,
    alpha: 0,
    scale: 0.26,
    duration: 180,
    onComplete: () => hit.destroy(),
  })
}

export function spawnAhriCharmImpactVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.eRaysMult)) {
    const hit = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.eRaysMult)
    hit.setDepth(depth + 1)
    hit.setOrigin(0.5, 0.5)
    hit.setScale(0.16)
    hit.setTint(TINT.eHeartCore)
    hit.setBlendMode(ADD)
    hit.setAlpha(0.88)
    scene.tweens.add({
      targets: hit,
      alpha: 0,
      scale: 0.28,
      duration: 220,
      onComplete: () => hit.destroy(),
    })
  }
  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.eHeart02)) {
    const bloom = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.eHeart02)
    bloom.setDepth(depth)
    bloom.setOrigin(0.5, 0.5)
    bloom.setScale(0.14)
    bloom.setTint(TINT.eAura)
    bloom.setBlendMode(ADD)
    bloom.setAlpha(0.75)
    scene.tweens.add({
      targets: bloom,
      alpha: 0,
      scale: 0.22,
      duration: 260,
      onComplete: () => bloom.destroy(),
    })
  }
  addAhriESmokeCell(scene, x, y, 0, depth, 0.18, 0.55, 0)
  addAhriESmokeCell(scene, x, y, 0.4, depth, 0.14, 0.45, 2)
}

export function spawnAhriSpiritRushTrailPuff(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  const key = scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.rSmokeTrail)
    ? AHRI_SPELL_PARTICLE_VFX.rSmokeTrail
    : scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.rTrail)
      ? AHRI_SPELL_PARTICLE_VFX.rTrail
      : null
  if (!key) {
    return
  }
  const puff = scene.add.image(x, y, key)
  puff.setDepth(depth - 1)
  puff.setOrigin(0.5, 0.5)
  puff.setScale(0.1)
  puff.setAlpha(0.45)
  puff.setTint(TINT.rSpiritCore)
  puff.setBlendMode(ADD)
  scene.tweens.add({
    targets: puff,
    alpha: 0,
    scale: 0.18,
    duration: 220,
    onComplete: () => puff.destroy(),
  })
}

export function spawnAhriBasicImpactVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  if (!scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.baHitSparks)) {
    return
  }
  const hit = scene.add.image(x, y, AHRI_SPELL_PARTICLE_VFX.baHitSparks)
  hit.setDepth(depth + 1)
  hit.setOrigin(0.5, 0.5)
  hit.setScale(0.22)
  hit.setTint(TINT.baCore)
  hit.setBlendMode(ADD)
  hit.setAlpha(0.9)
  scene.tweens.add({
    targets: hit,
    alpha: 0,
    scale: 0.32,
    duration: 150,
    onComplete: () => hit.destroy(),
  })
}
