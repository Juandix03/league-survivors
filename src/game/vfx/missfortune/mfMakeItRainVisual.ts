import * as Phaser from 'phaser'
import { MF_ANIM, MF_SMOKE_SHEET } from './missFortuneAtlases'
import { MF_SPELL_VFX } from './missFortuneAuthenticSpellVfx'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

export const MF_E_RAIN_STREAK_SHEET = {
  key: 'mf-e-rain-streak-sheet',
  url: '/assets/vfx/missfortune/baked/mf_e_rain_streak_sheet.png?v=4',
  frameWidth: 256,
  frameHeight: 10,
  frameCount: 8,
} as const

function pick(scene: Phaser.Scene, ...keys: string[]) {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

export function loadMfMakeItRainAssets(scene: Phaser.Scene) {
  if (!scene.textures.exists(MF_E_RAIN_STREAK_SHEET.key)) {
    scene.load.spritesheet(MF_E_RAIN_STREAK_SHEET.key, MF_E_RAIN_STREAK_SHEET.url, {
      frameWidth: MF_E_RAIN_STREAK_SHEET.frameWidth,
      frameHeight: MF_E_RAIN_STREAK_SHEET.frameHeight,
    })
  }
  const single = MF_SPELL_VFX.eRainStreak
  if (!scene.textures.exists(single)) {
    scene.load.image(single, '/assets/vfx/missfortune/baked/mf_e_rain_streak.png?v=4')
  }
}

export type MfRainZoneVisual = {
  destroy: () => void
}

/** Make It Rain — anillo + rayas naranjas (blur_03 horneado). */
export function createMfMakeItRainZone(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  radius: number,
  durationMs: number,
): MfRainZoneVisual {
  const root = scene.add.container(x, y)
  root.setDepth(depth - 6)

  const ringKey = pick(scene, MF_SPELL_VFX.eRing)
  if (ringKey) {
    const glow = scene.add.image(0, 5, ringKey)
    glow.setDisplaySize(radius * 2.08, radius * 1.58)
    glow.setAlpha(0.32)
    glow.setBlendMode(ADD)
    glow.setTint(0xff6644)
    root.add(glow)

    const ring = scene.add.image(0, 5, ringKey)
    ring.setDisplaySize(radius * 2, radius * 1.52)
    ring.setAlpha(0.78)
    ring.setBlendMode(ADD)
    ring.setTint(0xff7755)
    root.add(ring)
  }

  const floor = scene.add.graphics()
  floor.fillStyle(0xff5522, 0.08)
  floor.fillEllipse(0, 5, radius * 1.75, radius * 1.38)
  root.add(floor)

  const hasStreakSheet = scene.textures.exists(MF_E_RAIN_STREAK_SHEET.key)
  const ballKey = pick(scene, MF_SPELL_VFX.bulletFire, MF_SPELL_VFX.bullet)
  const smokeSheet = MF_SMOKE_SHEET.key
  const liveDrops: Phaser.GameObjects.Container[] = []

  const spawnDrop = () => {
    if (!ballKey) return
    const wx = x + (Math.random() - 0.5) * radius * 1.75
    const wy = y - radius * 0.55 - Math.random() * 55
    const drop = scene.add.container(wx, wy)
    drop.setDepth(depth + 8)
    drop.setRotation((Math.random() - 0.5) * 0.12)

    const ballSize = 12 + Math.random() * 4

    if (hasStreakSheet) {
      const frame = Math.floor(Math.random() * MF_E_RAIN_STREAK_SHEET.frameCount)
      const trail = scene.add.image(0, -ballSize * 0.55, MF_E_RAIN_STREAK_SHEET.key, frame)
      trail.setRotation(Math.PI / 2)
      trail.setDisplaySize(9 + Math.random() * 5, 3.2 + Math.random() * 1.2)
      trail.setAlpha(0.48)
      trail.setBlendMode(ADD)
      trail.setTint(0xff9922)
      drop.add(trail)
    }

    const ball = scene.add.image(0, 0, ballKey)
    ball.setDisplaySize(ballSize, ballSize)
    ball.setBlendMode(ADD)
    ball.setTint(0xffe0a8)
    ball.setAlpha(0.94)
    drop.add(ball)

    const hot = scene.add.image(0, ballSize * 0.08, ballKey)
    hot.setDisplaySize(ballSize * 0.55, ballSize * 0.55)
    hot.setBlendMode(ADD)
    hot.setTint(0xfff6dd)
    hot.setAlpha(0.7)
    drop.add(hot)

    liveDrops.push(drop)
    const targetY = y + (Math.random() - 0.5) * radius * 0.95
    const driftX = wx + (Math.random() - 0.5) * 10
    scene.tweens.add({
      targets: drop,
      x: driftX,
      y: targetY,
      duration: 88 + Math.random() * 55,
      ease: 'Quad.in',
      onComplete: () => {
        const i = liveDrops.indexOf(drop)
        if (i >= 0) liveDrops.splice(i, 1)
        drop.destroy()
      },
    })
  }

  const dropEvent = scene.time.addEvent({
    delay: 26,
    loop: true,
    callback: () => {
      spawnDrop()
      spawnDrop()
      spawnDrop()
      if (Math.random() > 0.35) spawnDrop()
    },
  })

  const smokeEvent = scene.time.addEvent({
    delay: 300,
    loop: true,
    callback: () => {
      if (!scene.textures.exists(smokeSheet)) return
      const sx = x + (Math.random() - 0.5) * radius
      const sy = y + (Math.random() - 0.5) * radius * 0.7
      const puff = scene.add.sprite(sx, sy, smokeSheet, 0)
      puff.setDepth(depth + 2)
      puff.setDisplaySize(24, 24)
      puff.setAlpha(0.22)
      puff.setBlendMode(SCREEN)
      if (scene.anims.exists(MF_ANIM.eRainSmoke)) puff.play(MF_ANIM.eRainSmoke)
      puff.once('animationcomplete', () => puff.destroy())
    },
  })

  function teardown() {
    dropEvent.destroy()
    smokeEvent.destroy()
    for (const c of liveDrops) c.destroy()
    liveDrops.length = 0
    root.destroy()
  }

  const cleanupTimer = scene.time.delayedCall(durationMs, teardown)

  return {
    destroy: () => {
      cleanupTimer.destroy()
      teardown()
    },
  }
}

export function spawnMfEHit(scene: Phaser.Scene, x: number, y: number, depth: number) {
  const splashKey = pick(scene, MF_SPELL_VFX.eSplash)
  if (splashKey) {
    const s = scene.add.image(x, y, splashKey)
    s.setDepth(depth + 4)
    s.setDisplaySize(34, 34)
    s.setAlpha(0.88)
    s.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: s,
      alpha: 0,
      scale: 1.2,
      duration: 340,
      onComplete: () => s.destroy(),
    })
  }
}

/** @deprecated */
export function spawnMfERainZone(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  radius: number,
  durationMs: number,
) {
  createMfMakeItRainZone(scene, x, y, depth, radius, durationMs)
}
