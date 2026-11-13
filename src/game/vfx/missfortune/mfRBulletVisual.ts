import * as Phaser from 'phaser'
import { MF_SPELL_VFX } from './missFortuneAuthenticSpellVfx'
import { MF_E_RAIN_STREAK_SHEET } from './mfMakeItRainVisual'

const ADD = Phaser.BlendModes.ADD

/** r_mis_projectile.png = 128×256, 2 frames verticales 128×128 (cometa + cola). */
export const MF_R_PROJECTILE_SHEET = {
  key: 'mf-r-projectile-sheet',
  url: '/assets/vfx/missfortune/spells/missfortune_base_r_mis_projectile.png?v=2',
  frameWidth: 128,
  frameHeight: 128,
  frameCount: 2,
} as const

export type MfRBulletVisual = {
  root: Phaser.GameObjects.Container
}

function pick(scene: Phaser.Scene, ...keys: string[]) {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

export function loadMfRBulletAssets(scene: Phaser.Scene) {
  if (!scene.textures.exists(MF_R_PROJECTILE_SHEET.key)) {
    scene.load.spritesheet(MF_R_PROJECTILE_SHEET.key, MF_R_PROJECTILE_SHEET.url, {
      frameWidth: MF_R_PROJECTILE_SHEET.frameWidth,
      frameHeight: MF_R_PROJECTILE_SHEET.frameHeight,
    })
  }
}

/** Bullet Time — cometa del cliente (frame del sheet, no atlas entero). */
export function createMfRBulletVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): MfRBulletVisual {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 5)
  /** En la textura la cola apunta abajo (+Y imagen). */
  root.setRotation(angle + Math.PI / 2)

  if (scene.textures.exists(MF_R_PROJECTILE_SHEET.key)) {
    const frame = Math.floor(Math.random() * MF_R_PROJECTILE_SHEET.frameCount)
    const comet = scene.add.sprite(0, 0, MF_R_PROJECTILE_SHEET.key, frame)
    comet.setScale(0.11 + Math.random() * 0.025)
    comet.setAlpha(0.92)
    comet.setBlendMode(ADD)
    root.add(comet)
  } else {
    const key = pick(scene, MF_SPELL_VFX.rBullet, MF_SPELL_VFX.bullet)
    if (key) {
      const core = scene.add.image(0, 0, key)
      core.setDisplaySize(10, 10)
      core.setBlendMode(ADD)
      root.add(core)
    }
  }

  if (scene.textures.exists(MF_E_RAIN_STREAK_SHEET.key)) {
    const sf = Math.floor(Math.random() * MF_E_RAIN_STREAK_SHEET.frameCount)
    const streak = scene.add.image(0, 12, MF_E_RAIN_STREAK_SHEET.key, sf)
    streak.setRotation(-Math.PI / 2)
    streak.setDisplaySize(4, 16)
    streak.setAlpha(0.35)
    streak.setBlendMode(ADD)
    streak.setTint(0xff7700)
    root.add(streak)
  }

  return { root }
}

export function updateMfRBulletVisual(vis: MfRBulletVisual, x: number, y: number, nx: number, ny: number) {
  const a = Math.atan2(ny, nx)
  vis.root.setPosition(x, y)
  vis.root.setRotation(a + Math.PI / 2)
}
