import * as Phaser from 'phaser'
import {
  LEESIN_BAKED_Q_CAST_RING,
  LEESIN_BAKED_Q_TRAIL,
  LEESIN_Q_MISSILE_SIDE_ANIM,
  LEESIN_Q_MISSILE_SIDE_SHEET,
} from './leeSinBakedSpellSprites'
import { LEESIN_SPELL_PARTICLE_VFX } from './leeSinAuthenticSpellVfx'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

/** Paleta Sonic Wave (cliente: dorado-blanco + azul espiritual). */
const Q_TINT = {
  core: 0xffffff,
  warm: 0xfff4d6,
  gold: 0xfbbf24,
  pale: 0xfffbeb,
} as const

/** Frame lateral: punta arriba → rotar +90° para que +X local = dirección del vuelo. */
const Q_FLY_ROT = Math.PI / 2
const Q_BODY_W = 32
const Q_BODY_H = 84

function pickKey(scene: Phaser.Scene, ...keys: string[]): string | null {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

function puff(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  key: string,
  size: number,
  alpha: number,
  blend: Phaser.BlendModes,
  tint?: number,
  ms = 360,
) {
  const img = scene.add.image(x, y, key)
  img.setDepth(depth)
  img.setDisplaySize(size, size)
  img.setAlpha(alpha)
  img.setBlendMode(blend)
  if (tint !== undefined) img.setTint(tint)
  scene.tweens.add({
    targets: img,
    alpha: 0,
    scale: 1.35,
    duration: ms,
    onComplete: () => img.destroy(),
  })
}

export type LeeSinQMissileVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Sprite | null
  tail: Phaser.GameObjects.Image | null
  tip: Phaser.GameObjects.Image | null
}

/** Anillo de cast al soltar Q (bake shockwave_low + cast_shockwave). */
export function spawnLeeSinQCastShock(
  scene: Phaser.Scene,
  x: number,
  y: number,
  _angle: number,
  depth: number,
) {
  const ringKey = pickKey(scene, LEESIN_BAKED_Q_CAST_RING.key)
  if (ringKey) {
    const ring = scene.add.image(x, y, ringKey)
    ring.setDepth(depth + 2)
    ring.setDisplaySize(56, 56)
    ring.setAlpha(0.82)
    ring.setBlendMode(ADD)
    ring.setTint(Q_TINT.gold)
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.45,
      duration: 380,
      onComplete: () => ring.destroy(),
    })
  }
}

/** Sonic Wave — bake SCB lateral (cono + flame + ondas), cola dorada, sin halo azul. */
export function createLeeSinQMissileVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): LeeSinQMissileVisual {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 6)
  root.setRotation(angle)

  let tail: Phaser.GameObjects.Image | null = null
  const tailKey = pickKey(
    scene,
    LEESIN_BAKED_Q_TRAIL.key,
    LEESIN_SPELL_PARTICLE_VFX.qMis,
  )
  if (tailKey) {
    tail = scene.add.image(-36, 0, tailKey)
    tail.setOrigin(1, 0.5)
    tail.setDisplaySize(76, 28)
    tail.setAlpha(0.82)
    tail.setTint(Q_TINT.warm)
    tail.setBlendMode(ADD)
    root.add(tail)
  }

  let body: Phaser.GameObjects.Sprite | null = null
  if (scene.textures.exists(LEESIN_Q_MISSILE_SIDE_SHEET.key)) {
    body = scene.add.sprite(0, 0, LEESIN_Q_MISSILE_SIDE_SHEET.key, 0)
    body.setRotation(Q_FLY_ROT)
    body.setDisplaySize(Q_BODY_W, Q_BODY_H)
    body.setTint(Q_TINT.pale)
    body.setAlpha(0.98)
    body.setBlendMode(ADD)
    if (scene.anims.exists(LEESIN_Q_MISSILE_SIDE_ANIM)) {
      body.play(LEESIN_Q_MISSILE_SIDE_ANIM)
    }
    root.add(body)
  } else if (import.meta.env.DEV) {
    console.warn('[leesin-q] Falta', LEESIN_Q_MISSILE_SIDE_SHEET.key, '— corre npm run leesin:bake-q')
  }

  let tip: Phaser.GameObjects.Image | null = null
  const tipKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.qMisOrb, LEESIN_SPELL_PARTICLE_VFX.qOrb)
  if (tipKey) {
    tip = scene.add.image(38, 0, tipKey)
    tip.setDisplaySize(22, 22)
    tip.setTint(Q_TINT.core)
    tip.setAlpha(0.92)
    tip.setBlendMode(ADD)
    root.add(tip)
  }

  return { root, body, tail, tip }
}

export function updateLeeSinQMissileVisual(
  vis: LeeSinQMissileVisual,
  x: number,
  y: number,
  angle: number,
  depth: number,
  _deltaMs: number,
) {
  vis.root.setPosition(x, y)
  vis.root.setRotation(angle)
  vis.root.setDepth(depth + 6)

  const t = Date.now() * 0.001
  const pulse = 1 + Math.sin(t * 14) * 0.035
  if (vis.body?.active) {
    vis.body.setDisplaySize(Q_BODY_W * pulse, Q_BODY_H * pulse)
  }
  if (vis.tip?.active) {
    vis.tip.setScale(pulse)
  }
}

export type LeeSinQMarkHandle = {
  destroy: () => void
  setPosition: (x: number, y: number) => void
}

export function attachLeeSinQMark(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  durationMs: number,
): LeeSinQMarkHandle {
  const parts: Phaser.GameObjects.Image[] = []
  const floorKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.qMarkFloor)
  if (floorKey) {
    const ring = scene.add.image(x, y, floorKey)
    ring.setDepth(depth - 1)
    ring.setDisplaySize(48, 48)
    ring.setAlpha(0.6)
    ring.setBlendMode(SCREEN)
    parts.push(ring)
  }
  const outlineKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.qMarkOutline)
  const markKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.qMark)
  if (outlineKey) {
    const outline = scene.add.image(x, y - 20, outlineKey)
    outline.setDepth(depth + 7)
    outline.setDisplaySize(36, 36)
    outline.setAlpha(0.85)
    outline.setBlendMode(ADD)
    parts.push(outline)
  }
  if (markKey) {
    const mark = scene.add.image(x, y - 20, markKey)
    mark.setDepth(depth + 8)
    mark.setDisplaySize(30, 30)
    mark.setAlpha(0.95)
    mark.setBlendMode(ADD)
    parts.push(mark)
    scene.tweens.add({
      targets: mark,
      alpha: 0.4,
      y: mark.y - 5,
      duration: 520,
      yoyo: true,
      repeat: -1,
    })
  }
  const timer = scene.time.delayedCall(durationMs, () => handle.destroy())
  const floorParts: Phaser.GameObjects.Image[] = []
  const markParts: Phaser.GameObjects.Image[] = []
  for (const p of parts) {
    if (Math.abs(p.y - y) < 12) floorParts.push(p)
    else markParts.push(p)
  }
  const handle: LeeSinQMarkHandle = {
    setPosition(px, py) {
      for (const p of floorParts) p.setPosition(px, py)
      for (const p of markParts) p.setPosition(px, py - 20)
    },
    destroy() {
      timer.remove(false)
      for (const p of parts) p.destroy()
      parts.length = 0
    },
  }
  handle.setPosition(x, y)
  return handle
}

/** @deprecated use attachLeeSinQMark */
export function spawnLeeSinQMark(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  durationMs: number,
) {
  attachLeeSinQMark(scene, x, y, depth, durationMs)
}

export function spawnLeeSinWCast(scene: Phaser.Scene, x: number, y: number, depth: number) {
  const floorKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.wFloor)
  if (floorKey) {
    puff(scene, x, y, depth, floorKey, 64, 0.55, SCREEN, 0xfef08a, 480)
  }
}

export function spawnLeeSinWShield(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  durationMs: number,
) {
  spawnLeeSinWCast(scene, x, y, depth - 1)
  const magicKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.wShieldMagic)
  if (magicKey) {
    const magic = scene.add.image(x, y - 10, magicKey)
    magic.setDepth(depth + 4)
    magic.setDisplaySize(68, 68)
    magic.setAlpha(0.5)
    magic.setBlendMode(ADD)
    scene.tweens.add({
      targets: magic,
      alpha: 0.25,
      scale: 1.12,
      duration: 500,
      yoyo: true,
      repeat: Math.floor(durationMs / 1000),
    })
    scene.time.delayedCall(durationMs, () => magic.destroy())
  }
  const key = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.wShield, LEESIN_SPELL_PARTICLE_VFX.wGlow)
  if (!key) return null
  const shield = scene.add.image(x, y - 12, key)
  shield.setDepth(depth + 5)
  shield.setDisplaySize(76, 76)
  shield.setAlpha(0.78)
  shield.setBlendMode(SCREEN)
  shield.setTint(0xfef08a)
  scene.tweens.add({
    targets: shield,
    alpha: 0.48,
    scale: 1.08,
    duration: 420,
    yoyo: true,
    repeat: Math.floor(durationMs / 840),
  })
  scene.time.delayedCall(durationMs, () => shield.destroy())
  const ringKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.wRing)
  if (ringKey) {
    const ring = scene.add.image(x, y, ringKey)
    ring.setDepth(depth + 3)
    ring.setDisplaySize(60, 60)
    ring.setAlpha(0.45)
    ring.setBlendMode(ADD)
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.55,
      duration: 520,
      onComplete: () => ring.destroy(),
    })
  }
  const ironKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.wIron)
  if (ironKey) {
    const iron = scene.add.image(x, y - 8, ironKey)
    iron.setDepth(depth + 6)
    iron.setDisplaySize(52, 52)
    iron.setAlpha(0.35)
    iron.setBlendMode(ADD)
    scene.tweens.add({
      targets: iron,
      alpha: 0,
      duration: 900,
      onComplete: () => iron.destroy(),
    })
  }
  return shield
}

export function spawnLeeSinETempest(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  radius: number,
) {
  const dragonKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.eDragon, LEESIN_SPELL_PARTICLE_VFX.eSymbol)
  if (dragonKey) {
    const dragon = scene.add.image(x, y, dragonKey)
    dragon.setDepth(depth + 6)
    dragon.setDisplaySize(radius * 2.4, radius * 2.4)
    dragon.setAlpha(0.72)
    dragon.setBlendMode(ADD)
    scene.tweens.add({
      targets: dragon,
      alpha: 0,
      scale: 1.4,
      duration: 560,
      onComplete: () => dragon.destroy(),
    })
  }
  const sparksKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.eSparks)
  if (sparksKey) {
    puff(scene, x, y, depth + 5, sparksKey, radius * 2, 0.65, ADD, undefined, 440)
  }
  const ringKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.eRing, LEESIN_SPELL_PARTICLE_VFX.eFlashRing)
  if (ringKey) {
    const ring = scene.add.image(x, y, ringKey)
    ring.setDepth(depth + 4)
    ring.setDisplaySize(radius * 2.1, radius * 2.1)
    ring.setAlpha(0.8)
    ring.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.3,
      duration: 420,
      onComplete: () => ring.destroy(),
    })
  }
}

export function spawnLeeSinECripple(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  radius: number,
) {
  const flashKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.eFlash, LEESIN_SPELL_PARTICLE_VFX.eFlashRing)
  if (flashKey) {
    const flash = scene.add.image(x, y, flashKey)
    flash.setDepth(depth + 6)
    flash.setDisplaySize(radius * 2.2, radius * 2.2)
    flash.setAlpha(0.88)
    flash.setBlendMode(ADD)
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.25,
      duration: 380,
      onComplete: () => flash.destroy(),
    })
  }
  const symbolKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.eSymbol)
  if (symbolKey) {
    puff(scene, x, y, depth + 5, symbolKey, radius * 1.8, 0.7, SCREEN, 0xc4b5fd, 400)
  }
}

/** @deprecated */
export function spawnLeeSinECast(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  radius: number,
) {
  spawnLeeSinETempest(scene, x, y, depth, radius)
}

export function spawnLeeSinRKick(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const flameKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.rFlameTrail, LEESIN_SPELL_PARTICLE_VFX.rTrail)
  if (flameKey) {
    const trail = scene.add.image(x, y, flameKey)
    trail.setDepth(depth + 5)
    trail.setRotation(angle)
    trail.setDisplaySize(80, 80)
    trail.setAlpha(0.9)
    trail.setBlendMode(ADD)
    scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 1.7,
      duration: 420,
      onComplete: () => trail.destroy(),
    })
  }
  const headKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.rFlameHead)
  if (headKey) {
    puff(scene, x, y, depth + 6, headKey, 72, 0.85, ADD, 0xf97316, 380)
  }
  const hitKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.rHit, LEESIN_SPELL_PARTICLE_VFX.rGlow)
  if (hitKey) {
    const hit = scene.add.image(x, y, hitKey)
    hit.setDepth(depth + 7)
    hit.setDisplaySize(78, 78)
    hit.setAlpha(0.92)
    hit.setBlendMode(ADD)
    scene.tweens.add({
      targets: hit,
      alpha: 0,
      scale: 1.45,
      duration: 440,
      onComplete: () => hit.destroy(),
    })
  }
  const smokeKey = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.rSmoke)
  if (smokeKey) {
    const smoke = scene.add.image(x + Math.cos(angle) * 24, y + Math.sin(angle) * 24, smokeKey)
    smoke.setDepth(depth + 4)
    smoke.setRotation(angle)
    smoke.setDisplaySize(96, 48)
    smoke.setAlpha(0.55)
    smoke.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: smoke,
      alpha: 0,
      x: smoke.x + Math.cos(angle) * 40,
      y: smoke.y + Math.sin(angle) * 40,
      duration: 520,
      onComplete: () => smoke.destroy(),
    })
  }
}

export function spawnLeeSinBaHit(scene: Phaser.Scene, x: number, y: number, depth: number) {
  const swoosh = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.baSwoosh)
  if (swoosh) {
    puff(scene, x, y, depth + 1, swoosh, 48, 0.5, ADD, undefined, 260)
  }
  const key = pickKey(scene, LEESIN_SPELL_PARTICLE_VFX.baHit)
  if (!key) return
  const hit = scene.add.image(x, y, key)
  hit.setDepth(depth + 2)
  hit.setDisplaySize(44, 44)
  hit.setAlpha(0.88)
  hit.setBlendMode(ADD)
  scene.tweens.add({
    targets: hit,
    alpha: 0,
    scale: 1.35,
    duration: 280,
    onComplete: () => hit.destroy(),
  })
}
