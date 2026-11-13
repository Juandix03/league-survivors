import * as Phaser from 'phaser'
import { LUX_BAKED_Q_ROOT } from './luxBakedSpellSprites'
import { LUX_SPELL_PARTICLE_VFX } from './luxAuthenticSpellVfx'
import {
  createLuxQBindingVisual,
  spawnLuxQBindingTrail,
  spawnLuxQCastPortal,
  updateLuxQBindingVisual,
  type LuxQBindingVisual,
} from './luxQBindingVisual'
import {
  createLuxPrismaticShieldVisual,
  createLuxPrismaticWaveVisual,
  spawnLuxPrismaticWaveTrail,
  spawnLuxWCastBurst,
  updateLuxPrismaticShieldVisual,
  updateLuxPrismaticWaveVisual,
  type LuxPrismaticShieldVisual,
  type LuxPrismaticWaveVisual,
} from './luxPrismaticWaveVisual'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

const TINT = {
  light: 0xfff7cc,
  core: 0xffffff,
  beam: 0x7dd3fc,
  beamHot: 0xe0f2fe,
  gold: 0xfbbf24,
  qCore: 0xfffbeb,
  qTrail: 0xbae6fd,
} as const

function pickKey(scene: Phaser.Scene, ...keys: string[]): string | null {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

const FALLBACK_ORB_KEY = 'lux-fallback-orb'

function ensureLuxFallbackOrb(scene: Phaser.Scene): string {
  if (scene.textures.exists(FALLBACK_ORB_KEY)) return FALLBACK_ORB_KEY
  const g = scene.make.graphics({ x: 0, y: 0 }, false)
  g.fillStyle(0xffffff, 1)
  g.fillCircle(16, 16, 13)
  g.generateTexture(FALLBACK_ORB_KEY, 32, 32)
  g.destroy()
  return FALLBACK_ORB_KEY
}

export type LuxProjectileVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite
  bodyBaseScale?: number
  /** Rota el cuerpo hacia la dirección de vuelo (W). */
  alignToVelocity?: boolean
  qBinding?: LuxQBindingVisual
  wWave?: LuxPrismaticWaveVisual
}

/** Estela suelta (evita tileSprite “caja blanca”). */
export function spawnLuxQTrailSegment(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  spawnLuxQBindingTrail(scene, x, y, angle, depth)
}

/** Anillo de “atadura” al enganchar (circle_fixed bake). */
export function spawnLuxQBindRoot(scene: Phaser.Scene, x: number, y: number, depth: number) {
  const key = pickKey(scene, LUX_BAKED_Q_ROOT.key, LUX_SPELL_PARTICLE_VFX.qCap)
  if (!key) return
  const root = scene.add.image(x, y, key)
  root.setDepth(depth + 2)
  root.setDisplaySize(key === LUX_BAKED_Q_ROOT.key ? 72 : 44, key === LUX_BAKED_Q_ROOT.key ? 72 : 44)
  root.setTint(TINT.gold)
  root.setAlpha(0.85)
  root.setBlendMode(SCREEN)
  scene.tweens.add({
    targets: root,
    alpha: 0,
    scale: 1.35,
    duration: 520,
    onComplete: () => root.destroy(),
  })
}

export function spawnLuxQCastFlash(scene: Phaser.Scene, x: number, y: number, angle: number, depth: number) {
  spawnLuxQCastPortal(scene, x, y, angle, depth)
  const key = pickKey(scene, LUX_SPELL_PARTICLE_VFX.qSpark, LUX_SPELL_PARTICLE_VFX.baGlow)
  if (!key) return
  const flash = scene.add.image(x, y, key)
  flash.setRotation(angle)
  flash.setDepth(depth + 3)
  flash.setDisplaySize(52, 52)
  flash.setTint(TINT.qCore)
  flash.setAlpha(0.7)
  flash.setBlendMode(ADD)
  scene.tweens.add({ targets: flash, alpha: 0, scale: 1.35, duration: 200, onComplete: () => flash.destroy() })
}

/** Q — bake mesh + textura `lux_q_shape` (capas ADD, escala legible top-down). */
export function createLuxProjectileVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  kind: 'ba' | 'q' | 'w',
  wPhase: 'out' | 'return' = 'out',
): LuxProjectileVisual | null {
  const root = scene.add.container(x, y)
  root.setDepth(depth)

  if (kind === 'q') {
    const qBinding = createLuxQBindingVisual(scene)
    if (!qBinding) {
      root.destroy()
      return null
    }
    root.add(qBinding.root)
    qBinding.root.setPosition(0, 0)
    const body =
      qBinding.spin ??
      qBinding.core ??
      scene.add.image(0, 0, ensureLuxFallbackOrb(scene))
    return { root, body, qBinding }
  }

  if (kind === 'w') {
    const wWave = createLuxPrismaticWaveVisual(scene, wPhase)
    if (!wWave) {
      root.destroy()
      return null
    }
    root.add(wWave.root)
    const body =
      wWave.spin ?? scene.add.image(0, 0, ensureLuxFallbackOrb(scene))
    return { root, body, alignToVelocity: true, wWave }
  }

  const key =
    pickKey(scene, LUX_SPELL_PARTICLE_VFX.baSpark, LUX_SPELL_PARTICLE_VFX.baGlow) ??
    ensureLuxFallbackOrb(scene)
  const body = scene.add.image(0, 0, key)
  body.setScale(0.065)
  body.setTint(TINT.light)
  body.setAlpha(0.9)
  body.setBlendMode(ADD)
  root.add(body)
  return { root, body }
}

export function spawnLuxImpact(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  kind: 'ba' | 'q' | 'other' = 'other',
) {
  if (kind === 'q') {
    spawnLuxQBindRoot(scene, x, y, depth)
    const ringKey = pickKey(scene, LUX_SPELL_PARTICLE_VFX.qHitRing)
    if (ringKey) {
      const ring = scene.add.image(x, y, ringKey)
      ring.setDepth(depth)
      ring.setDisplaySize(56, 56)
      ring.setTint(TINT.qTrail)
      ring.setAlpha(0.8)
      ring.setBlendMode(ADD)
      scene.tweens.add({
        targets: ring,
        alpha: 0,
        scale: 1.45,
        duration: 280,
        onComplete: () => ring.destroy(),
      })
    }
  }
  const key = pickKey(scene, LUX_SPELL_PARTICLE_VFX.qCap, LUX_SPELL_PARTICLE_VFX.baHit, LUX_SPELL_PARTICLE_VFX.rFlash)
  if (!key) return
  const hit = scene.add.image(x, y, key)
  hit.setDepth(depth + 1)
  hit.setDisplaySize(kind === 'q' ? 44 : 36, kind === 'q' ? 44 : 36)
  hit.setTint(TINT.core)
  hit.setAlpha(0.85)
  hit.setBlendMode(SCREEN)
  scene.tweens.add({ targets: hit, alpha: 0, scale: 1.35, duration: 220, onComplete: () => hit.destroy() })
}

export function tickLuxWProjectileVisual(visual: LuxProjectileVisual, deltaMs: number) {
  if (visual.wWave) {
    updateLuxPrismaticWaveVisual(visual.wWave, deltaMs)
  }
}

export function tickLuxQProjectileVisual(visual: LuxProjectileVisual, deltaMs: number) {
  if (visual.qBinding) {
    updateLuxQBindingVisual(visual.qBinding, deltaMs)
    return
  }
  const pulse = 1 + Math.sin(Date.now() * 0.016) * 0.04
  if (visual.bodyBaseScale !== undefined && visual.body.active) {
    const s = visual.bodyBaseScale * pulse
    if (visual.body.width > 0 && visual.body.height > 0) {
      visual.body.setScale(s)
    }
  }
}

export function spawnLuxWTrailSegment(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
  returning = false,
) {
  spawnLuxPrismaticWaveTrail(scene, x, y, angle, depth, returning)
}

export function spawnLuxWCastFlash(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  spawnLuxWCastBurst(scene, x, y, angle, depth)
}

/** Escudo prismático sobre Lux (duración W). */
export function createLuxPrismaticShieldOnPlayer(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
): { root: Phaser.GameObjects.Container; shield: LuxPrismaticShieldVisual } {
  const shield = createLuxPrismaticShieldVisual(scene)
  const root = shield.root
  root.setPosition(x, y - 14)
  root.setDepth(depth + 5)
  return { root, shield }
}

export function tickLuxPrismaticShield(shield: LuxPrismaticShieldVisual, deltaMs: number) {
  updateLuxPrismaticShieldVisual(shield, deltaMs)
}

