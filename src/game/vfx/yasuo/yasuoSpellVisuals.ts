import * as Phaser from 'phaser'
import { createYasuoWindWallScbVisual } from '../../champions/yasuoWindWallAnim'
import { YASUO_SPELL_PARTICLE_VFX } from './yasuoAuthenticSpellVfx'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

const TINT = {
  wind: 0xbae6fd,
  windCore: 0xffffff,
  windDeep: 0x38bdf8,
  steel: 0x7dd3fc,
  wall: 0x93c5fd,
  dash: 0xe0f2fe,
  rBlast: 0x60a5fa,
} as const

export type YasuoBasicProjectileVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Image
  bodyBaseScale: number
}

export type YasuoTornadoVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Image
}

export type YasuoWindWallVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Sprite | Phaser.GameObjects.TileSprite | Phaser.GameObjects.Image
}

function attachWindWallScroll(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  tile: Phaser.GameObjects.TileSprite,
  speedPxPerFrame: number,
) {
  const timers = (root.getData('windWallTimers') as Phaser.Time.TimerEvent[] | undefined) ?? []
  timers.push(
    scene.time.addEvent({
      delay: 32,
      loop: true,
      callback: () => {
        if (!tile.active) return
        tile.tilePositionX += speedPxPerFrame
      },
    }),
  )
  root.setData('windWallTimers', timers)
  if (!root.getData('windWallScrollHook')) {
    root.setData('windWallScrollHook', true)
    root.on('destroy', () => {
      const list = (root.getData('windWallTimers') as Phaser.Time.TimerEvent[] | undefined) ?? []
      for (const t of list) t.remove()
    })
  }
}

function addMask(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  key: string,
  scale: number,
  tint: number,
  alpha: number,
) {
  if (!scene.textures.exists(key)) return null
  const img = scene.add.image(0, 0, key)
  img.setOrigin(0.5, 0.5)
  img.setScale(scale)
  img.setTint(tint)
  img.setAlpha(alpha)
  img.setBlendMode(ADD)
  root.add(img)
  return img
}

const BA_SCALE = 0.055

export function createYasuoBasicProjectileVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): YasuoBasicProjectileVisual | null {
  const root = scene.add.container(x, y)
  root.setDepth(depth)
  root.setRotation(angle)
  addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.baWindRing, 0.05, TINT.windDeep, 0.35)
  const body =
    addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qSword, BA_SCALE, TINT.windCore, 0.9) ??
    addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.baTrail, BA_SCALE, TINT.steel, 0.85)
  if (!body) {
    root.destroy()
    return null
  }
  return { root, body, bodyBaseScale: BA_SCALE }
}

export function spawnYasuoBaTrailSegment(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const key = scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.baTrail)
    ? YASUO_SPELL_PARTICLE_VFX.baTrail
    : YASUO_SPELL_PARTICLE_VFX.qWindColor
  if (!scene.textures.exists(key)) return
  const t = scene.add.image(x, y, key)
  t.setOrigin(0.9, 0.5)
  t.setRotation(angle + Math.PI)
  t.setDepth(depth - 1)
  t.setScale(0.06, 0.04)
  t.setTint(TINT.windDeep)
  t.setAlpha(0.55)
  t.setBlendMode(ADD)
  scene.tweens.add({
    targets: t,
    alpha: 0,
    scaleX: t.scaleX * 0.45,
    duration: 220,
    onComplete: () => t.destroy(),
  })
}

export function syncYasuoBasicProjectileMotion(
  visual: YasuoBasicProjectileVisual,
  vx: number,
  vy: number,
  timeMs: number,
) {
  if (Math.abs(vx) + Math.abs(vy) > 0.01) {
    visual.root.setRotation(Math.atan2(vy, vx))
  }
  const pulse = 0.94 + Math.sin(timeMs / 75) * 0.04
  visual.body.setScale(visual.bodyBaseScale * pulse)
}

export function spawnYasuoBaMuzzleFlash(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  if (!scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.baHitFlash)) return
  const f = scene.add.image(x, y, YASUO_SPELL_PARTICLE_VFX.baHitFlash)
  f.setRotation(angle)
  f.setDepth(depth + 1)
  f.setScale(0.045)
  f.setTint(TINT.steel)
  f.setAlpha(0.55)
  f.setBlendMode(SCREEN)
  scene.tweens.add({
    targets: f,
    alpha: 0,
    scale: 0.14,
    duration: 90,
    onComplete: () => f.destroy(),
  })
}

export function createYasuoTornadoVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): YasuoTornadoVisual | null {
  const root = scene.add.container(x, y)
  root.setDepth(depth)
  root.setRotation(angle)
  addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qTornadoCas, 0.14, TINT.windDeep, 0.5)
  const body =
    addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qTornadoBlade, 0.12, TINT.windCore, 0.95) ??
    addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qTornadoGround, 0.11, TINT.wind, 0.85)
  if (!body) {
    root.destroy()
    return null
  }
  addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qWindColor, 0.07, TINT.steel, 0.5)
  return { root, body }
}

/** Anticipación del swing (espada hacia atrás). */
export function spawnYasuoMeleeWindup(
  scene: Phaser.Scene,
  originX: number,
  originY: number,
  angle: number,
  depth: number,
) {
  if (!scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.qSword)) return
  const blade = scene.add.image(originX, originY, YASUO_SPELL_PARTICLE_VFX.qSword)
  blade.setRotation(angle - 0.35)
  blade.setDepth(depth + 1)
  blade.setScale(0.05)
  blade.setTint(TINT.steel)
  blade.setAlpha(0.65)
  blade.setBlendMode(ADD)
  scene.tweens.add({
    targets: blade,
    alpha: 0,
    scale: 0.07,
    duration: 120,
    onComplete: () => blade.destroy(),
  })
}

/** Corte melee (BA o Q) — VFX en el frame de impacto. */
export function spawnYasuoSteelTempestSlash(
  scene: Phaser.Scene,
  originX: number,
  originY: number,
  angle: number,
  depth: number,
  slashRange: number,
  scaleMul = 1,
) {
  const root = scene.add.container(originX, originY)
  root.setDepth(depth + 2)
  root.setRotation(angle)

  const mid = slashRange * 0.42
  const wind = addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qWindColor, 0.09, TINT.windDeep, 0.35)
  if (wind) wind.setPosition(mid, 0)
  const slash =
    addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.baImpactSlash, 0.14, TINT.steel, 0.92) ??
    addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qSword, 0.08, TINT.windCore, 0.9)
  if (!slash) {
    root.destroy()
    return
  }
  slash.setPosition(mid, 0)
  slash.setScale(0.16 * scaleMul, 0.1 * scaleMul)
  const blade = addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qSword, 0.065, TINT.windCore, 0.75)
  if (blade) blade.setPosition(mid * 0.55, -4)

  root.setScale(0.85, 1)
  scene.tweens.add({
    targets: root,
    scaleX: 1.15,
    alpha: 0,
    duration: 140,
    ease: 'Cubic.Out',
    onComplete: () => root.destroy(),
  })

  if (scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.baHitFlash)) {
    const flash = scene.add.image(originX + Math.cos(angle) * mid, originY + Math.sin(angle) * mid, YASUO_SPELL_PARTICLE_VFX.baHitFlash)
    flash.setRotation(angle)
    flash.setDepth(depth + 3)
    flash.setScale(0.05)
    flash.setTint(TINT.windCore)
    flash.setAlpha(0.5)
    flash.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 0.12,
      duration: 100,
      onComplete: () => flash.destroy(),
    })
  }
}

/** Haz lineal de Q (Steel Tempest) — estilo LoL: franja de viento desde la espada. */
export function spawnYasuoSteelTempestThrust(
  scene: Phaser.Scene,
  originX: number,
  originY: number,
  angle: number,
  depth: number,
  rangeOrigin: number,
  range: number,
) {
  const length = rangeOrigin + range
  const root = scene.add.container(originX, originY)
  root.setDepth(depth + 2)
  root.setRotation(angle)

  const mid = length * 0.48
  const core =
    addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.baTrail, 0.055, TINT.windCore, 0.95) ??
    addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qWindColor, 0.08, TINT.windCore, 0.85)
  if (core) {
    core.setPosition(mid, 0)
    core.setScale(length * 0.0038, 0.028)
  }
  const gust = addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qTornadoBlade, 0.07, TINT.windDeep, 0.55)
  if (gust) {
    gust.setPosition(mid, 0)
    gust.setScale(length * 0.0022, 0.045)
  }
  const edge = addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qWindColor, 0.06, TINT.steel, 0.45)
  if (edge) {
    edge.setPosition(mid, 0)
    edge.setScale(length * 0.0032, 0.018)
    edge.setBlendMode(SCREEN)
  }
  const tip = addMask(scene, root, YASUO_SPELL_PARTICLE_VFX.qSword, 0.05, TINT.windCore, 0.9)
  if (tip) {
    tip.setPosition(length * 0.88, 0)
    tip.setRotation(0.08)
  }

  if (!core && !gust) {
    root.destroy()
    return
  }

  root.setAlpha(0.92)
  scene.tweens.add({
    targets: root,
    alpha: 0,
    scaleX: 1.06,
    duration: 200,
    ease: 'Cubic.Out',
    onComplete: () => root.destroy(),
  })

  if (scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.qHitSpark)) {
    const hit = scene.add.image(
      originX + Math.cos(angle) * length * 0.92,
      originY + Math.sin(angle) * length * 0.92,
      YASUO_SPELL_PARTICLE_VFX.qHitSpark,
    )
    hit.setDepth(depth + 3)
    hit.setScale(0.06)
    hit.setTint(TINT.windCore)
    hit.setAlpha(0.75)
    hit.setBlendMode(ADD)
    scene.tweens.add({
      targets: hit,
      alpha: 0,
      scale: 0.11,
      duration: 160,
      onComplete: () => hit.destroy(),
    })
  }
}

export function spawnYasuoTornadoTrail(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  if (!scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.qSmoke)) return
  const s = scene.add.image(x, y, YASUO_SPELL_PARTICLE_VFX.qSmoke)
  s.setRotation(angle)
  s.setDepth(depth - 1)
  s.setScale(0.08)
  s.setTint(TINT.wind)
  s.setAlpha(0.4)
  s.setBlendMode(ADD)
  scene.tweens.add({
    targets: s,
    alpha: 0,
    scale: 0.14,
    duration: 280,
    onComplete: () => s.destroy(),
  })
}

export function spawnYasuoBasicImpactVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  const key = scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.baImpactSlash)
    ? YASUO_SPELL_PARTICLE_VFX.baImpactSlash
    : YASUO_SPELL_PARTICLE_VFX.qHitSpark
  if (!scene.textures.exists(key)) return
  const hit = scene.add.image(x, y, key)
  hit.setDepth(depth + 1)
  hit.setScale(0.12)
  hit.setTint(TINT.steel)
  hit.setAlpha(0.88)
  hit.setBlendMode(ADD)
  scene.tweens.add({
    targets: hit,
    alpha: 0,
    scale: 0.2,
    duration: 160,
    onComplete: () => hit.destroy(),
  })
}

export function spawnYasuoWindWallCast(
  scene: Phaser.Scene,
  x: number,
  y: number,
  aimAngle: number,
  depth: number,
) {
  const puffKey = scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.wSteam)
    ? YASUO_SPELL_PARTICLE_VFX.wSteam
    : YASUO_SPELL_PARTICLE_VFX.wWispy
  if (scene.textures.exists(puffKey)) {
    const puff = scene.add.image(x, y, puffKey)
    puff.setDepth(depth + 2)
    puff.setRotation(aimAngle)
    puff.setDisplaySize(72, 36)
    puff.setTint(TINT.windCore)
    puff.setAlpha(0.65)
    puff.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: puff,
      alpha: 0,
      displayWidth: 110,
      displayHeight: 52,
      duration: 280,
      onComplete: () => puff.destroy(),
    })
  }
  if (scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.eDashFlash)) {
    const burst = scene.add.image(x, y, YASUO_SPELL_PARTICLE_VFX.eDashFlash)
    burst.setRotation(aimAngle)
    burst.setDepth(depth + 1)
    burst.setScale(0.08)
    burst.setTint(TINT.windCore)
    burst.setAlpha(0.45)
    burst.setBlendMode(ADD)
    scene.tweens.add({
      targets: burst,
      alpha: 0,
      scale: 0.16,
      duration: 220,
      onComplete: () => burst.destroy(),
    })
  }
}

function createYasuoWindWallStripFallback(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  span: number,
  bandH: number,
): Phaser.GameObjects.TileSprite | null {
  const texKey = YASUO_SPELL_PARTICLE_VFX.wWallMain
  if (!scene.textures.exists(texKey)) return null
  const scroll = scene.add.tileSprite(0, 0, span, bandH, texKey)
  scroll.setOrigin(0.5, 0.5)
  scroll.setAlpha(0.75)
  scroll.setTint(0xe8f7ff)
  scroll.setBlendMode(SCREEN)
  root.add(scroll)
  attachWindWallScroll(scene, root, scroll, 2.8)
  return scroll
}

/** W: bake scb+UV (primario) o franja CD si falta sheet. */
export function createYasuoWindWallVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  wallAngle: number,
  depth: number,
  lengthPx: number,
  _thicknessPx: number,
): YasuoWindWallVisual | null {
  const angle = wallAngle - Math.PI / 2
  const nx = Math.cos(angle)
  const ny = Math.sin(angle)

  const scb = createYasuoWindWallScbVisual(scene, x, y, nx, ny, depth, lengthPx, _thicknessPx)
  if (scb) {
    scb.root.setRotation(wallAngle)
    return { root: scb.root, body: scb.sprite }
  }

  const span = Phaser.Math.Clamp(lengthPx * 1.12, 120, 210)
  const bandH = 58
  const root = scene.add.container(x, y)
  root.setDepth(depth + 4)
  root.setRotation(wallAngle)
  const body = createYasuoWindWallStripFallback(scene, root, span, bandH)
  if (!body) {
    root.destroy()
    return null
  }
  return { root, body }
}

export function spawnYasuoEDashTrail(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const key = scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.eDashSmoke)
    ? YASUO_SPELL_PARTICLE_VFX.eDashSmoke
    : YASUO_SPELL_PARTICLE_VFX.qWindColor
  if (!scene.textures.exists(key)) return
  const s = scene.add.image(x, y, key)
  s.setRotation(angle)
  s.setDepth(depth - 1)
  s.setScale(0.07)
  s.setTint(TINT.windDeep)
  s.setAlpha(0.35)
  s.setBlendMode(ADD)
  scene.tweens.add({
    targets: s,
    alpha: 0,
    scale: 0.12,
    duration: 200,
    onComplete: () => s.destroy(),
  })
}

export function spawnYasuoEDashBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  if (scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.eDashFlash)) {
    const f = scene.add.image(x, y, YASUO_SPELL_PARTICLE_VFX.eDashFlash)
    f.setRotation(angle)
    f.setDepth(depth + 2)
    f.setScale(0.1)
    f.setTint(TINT.dash)
    f.setBlendMode(SCREEN)
    scene.tweens.add({ targets: f, alpha: 0, scale: 0.2, duration: 180, onComplete: () => f.destroy() })
  }
  if (scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.eDashRing)) {
    const r = scene.add.image(x, y, YASUO_SPELL_PARTICLE_VFX.eDashRing)
    r.setDepth(depth)
    r.setScale(0.12)
    r.setTint(TINT.windDeep)
    r.setAlpha(0.65)
    r.setBlendMode(ADD)
    scene.tweens.add({ targets: r, alpha: 0, scale: 0.22, duration: 240, onComplete: () => r.destroy() })
  }
  if (scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.eDashSmoke)) {
    const s = scene.add.image(x, y, YASUO_SPELL_PARTICLE_VFX.eDashSmoke)
    s.setDepth(depth - 1)
    s.setScale(0.1)
    s.setTint(TINT.wind)
    s.setAlpha(0.45)
    s.setBlendMode(ADD)
    scene.tweens.add({ targets: s, alpha: 0, duration: 320, onComplete: () => s.destroy() })
  }
}

export function spawnYasuoLastBreathVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  if (scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.rGroundCrack)) {
    const c = scene.add.image(x, y, YASUO_SPELL_PARTICLE_VFX.rGroundCrack)
    c.setDepth(depth - 1)
    c.setScale(0.16)
    c.setTint(0x64748b)
    c.setAlpha(0.5)
    c.setBlendMode(SCREEN)
    scene.tweens.add({ targets: c, alpha: 0, duration: 500, onComplete: () => c.destroy() })
  }
  if (scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.rWindBlast)) {
    const b = scene.add.image(x, y, YASUO_SPELL_PARTICLE_VFX.rWindBlast)
    b.setDepth(depth + 1)
    b.setScale(0.18)
    b.setTint(TINT.rBlast)
    b.setAlpha(0.85)
    b.setBlendMode(ADD)
    scene.tweens.add({ targets: b, alpha: 0, scale: 0.28, duration: 320, onComplete: () => b.destroy() })
  }
  if (scene.textures.exists(YASUO_SPELL_PARTICLE_VFX.rLandRing)) {
    const ring = scene.add.image(x, y, YASUO_SPELL_PARTICLE_VFX.rLandRing)
    ring.setDepth(depth)
    ring.setScale(0.15)
    ring.setTint(TINT.windDeep)
    ring.setAlpha(0.7)
    ring.setBlendMode(ADD)
    scene.tweens.add({ targets: ring, alpha: 0, scale: 0.26, duration: 380, onComplete: () => ring.destroy() })
  }
}
