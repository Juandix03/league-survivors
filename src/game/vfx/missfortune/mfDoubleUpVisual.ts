import * as Phaser from 'phaser'
import {
  MF_ANIM,
  MF_IMPACT_SPARKS_SHEET,
  MF_MUZZLE_SHEET,
  MF_Q_FLAMES_SHEET,
} from './missFortuneAtlases'
import { MF_SPELL_VFX } from './missFortuneAuthenticSpellVfx'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

function pick(scene: Phaser.Scene, ...keys: string[]) {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

export type MfBulletVisual = {
  root: Phaser.GameObjects.Container
  scrollBlur?: () => void
}

/** Auto — cono aa_glow + chispa de cañón pequeña (cliente). */
export function spawnMfBasicAttackCast(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const glowKey = pick(scene, MF_SPELL_VFX.aaGlow)
  if (glowKey) {
    const glow = scene.add.image(x, y, glowKey)
    glow.setDepth(depth + 4)
    glow.setRotation(angle)
    glow.setDisplaySize(22, 16)
    glow.setAlpha(0.62)
    glow.setBlendMode(ADD)
    glow.setTint(0xffaa66)
    scene.tweens.add({
      targets: glow,
      alpha: 0,
      scaleX: 1.15,
      duration: 110,
      onComplete: () => glow.destroy(),
    })
  }
  if (scene.textures.exists(MF_MUZZLE_SHEET.key)) {
    const flash = scene.add.sprite(x, y, MF_MUZZLE_SHEET.key, 0)
    flash.setDepth(depth + 5)
    flash.setRotation(angle)
    flash.setDisplaySize(20, 14)
    flash.setBlendMode(ADD)
    flash.setAlpha(0.72)
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 90,
      onComplete: () => flash.destroy(),
    })
  }
}

/** Double Up — destello Q + luz de alquitrán al disparar. */
export function spawnMfDoubleUpCast(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const flashKey = pick(scene, MF_SPELL_VFX.qFlash)
  if (flashKey) {
    const burst = scene.add.image(x, y, flashKey)
    burst.setDepth(depth + 6)
    burst.setRotation(angle)
    burst.setDisplaySize(38, 38)
    burst.setAlpha(0.82)
    burst.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: burst,
      alpha: 0,
      scale: 1.25,
      duration: 180,
      onComplete: () => burst.destroy(),
    })
  }
  if (scene.textures.exists(MF_MUZZLE_SHEET.key) && scene.anims.exists(MF_ANIM.muzzleFlash)) {
    const flash = scene.add.sprite(x, y, MF_MUZZLE_SHEET.key)
    flash.setDepth(depth + 5)
    flash.setRotation(angle)
    flash.setDisplaySize(40, 28)
    flash.setBlendMode(ADD)
    flash.setAlpha(0.9)
    flash.play(MF_ANIM.muzzleFlash)
    flash.once('animationcomplete', () => flash.destroy())
  }
  const lightKey = pick(scene, MF_SPELL_VFX.qTarLight)
  if (lightKey) {
    const light = scene.add.image(x + Math.cos(angle) * 8, y + Math.sin(angle) * 8, lightKey)
    light.setDepth(depth + 4)
    light.setRotation(angle)
    light.setDisplaySize(34, 34)
    light.setAlpha(0.78)
    light.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: light,
      alpha: 0,
      duration: 220,
      onComplete: () => light.destroy(),
    })
  }
}

export function createMfBasicAttackBullet(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): MfBulletVisual {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 5)
  root.setRotation(angle)

  const blurKey = pick(scene, MF_SPELL_VFX.aaSmoke, MF_SPELL_VFX.bulletBlur)
  let blur: Phaser.GameObjects.TileSprite | null = null
  if (blurKey) {
    blur = scene.add.tileSprite(-10, 0, 18, 7, blurKey)
    blur.setOrigin(1, 0.5)
    blur.setAlpha(0.38)
    blur.setBlendMode(SCREEN)
    blur.setTileScale(0.28, 0.28)
    root.add(blur)
  }

  const ballKey = pick(scene, MF_SPELL_VFX.bulletFire, MF_SPELL_VFX.bullet)
  if (ballKey) {
    const ball = scene.add.image(0, 0, ballKey)
    ball.setDisplaySize(11, 11)
    ball.setBlendMode(ADD)
    ball.setTint(0xffd090)
    ball.setAlpha(0.9)
    root.add(ball)
  }

  return {
    root,
    scrollBlur: blur
      ? () => {
          blur!.tilePositionX -= 3
        }
      : undefined,
  }
}

export function createMfDoubleUpBullet(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): MfBulletVisual {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 6)
  root.setRotation(angle)

  const blurKey = pick(scene, MF_SPELL_VFX.bulletBlur)
  let blur: Phaser.GameObjects.TileSprite | null = null
  if (blurKey) {
    blur = scene.add.tileSprite(-22, 0, 44, 16, blurKey)
    blur.setOrigin(1, 0.5)
    blur.setAlpha(0.55)
    blur.setBlendMode(SCREEN)
    blur.setTileScale(0.42, 0.42)
    root.add(blur)
  }

  if (scene.textures.exists(MF_Q_FLAMES_SHEET.key) && scene.anims.exists(MF_ANIM.qBulletFlames)) {
    const flames = scene.add.sprite(-12, 0, MF_Q_FLAMES_SHEET.key)
    flames.setOrigin(1, 0.5)
    flames.setDisplaySize(36, 26)
    flames.setAlpha(0.8)
    flames.setBlendMode(ADD)
    flames.setTint(0xff8833)
    flames.play(MF_ANIM.qBulletFlames)
    root.add(flames)
  }

  const fireKey = pick(scene, MF_SPELL_VFX.bulletFire)
  if (fireKey) {
    const fire = scene.add.image(-4, 0, fireKey)
    fire.setDisplaySize(24, 14)
    fire.setAlpha(0.65)
    fire.setBlendMode(ADD)
    fire.setTint(0xffcc88)
    root.add(fire)
  }

  const ballKey = pick(scene, MF_SPELL_VFX.bullet)
  if (ballKey) {
    const ball = scene.add.image(0, 0, ballKey)
    ball.setDisplaySize(18, 18)
    ball.setBlendMode(ADD)
    ball.setTint(0xffe8c0)
    root.add(ball)
  }

  return {
    root,
    scrollBlur: blur
      ? () => {
          blur!.tilePositionX -= 5
        }
      : undefined,
  }
}

export function updateMfBulletVisual(vis: MfBulletVisual, x: number, y: number, nx: number, ny: number) {
  vis.root.setPosition(x, y)
  vis.root.setRotation(Math.atan2(ny, nx))
  vis.scrollBlur?.()
}

export function spawnMfDoubleUpHit(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  bounceHit = false,
) {
  if (scene.textures.exists(MF_IMPACT_SPARKS_SHEET.key) && scene.anims.exists(MF_ANIM.qImpactSparks)) {
    const sparks = scene.add.sprite(x, y, MF_IMPACT_SPARKS_SHEET.key)
    sparks.setDepth(depth + 6)
    sparks.setDisplaySize(bounceHit ? 28 : 36, bounceHit ? 28 : 36)
    sparks.setBlendMode(ADD)
    sparks.setAlpha(bounceHit ? 0.65 : 0.85)
    sparks.play(MF_ANIM.qImpactSparks)
    sparks.once('animationcomplete', () => sparks.destroy())
  }

  const flashKey = pick(scene, MF_SPELL_VFX.qFlash)
  if (flashKey) {
    const hit = scene.add.image(x, y, flashKey)
    hit.setDepth(depth + 5)
    hit.setDisplaySize(bounceHit ? 24 : 32, bounceHit ? 24 : 32)
    hit.setAlpha(bounceHit ? 0.5 : 0.72)
    hit.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: hit,
      alpha: 0,
      scale: 1.15,
      duration: bounceHit ? 140 : 200,
      onComplete: () => hit.destroy(),
    })
  }

  const dustKey = pick(scene, MF_SPELL_VFX.qTarDust)
  if (dustKey && !bounceHit) {
    const dust = scene.add.image(x, y + 4, dustKey)
    dust.setDepth(depth + 2)
    dust.setDisplaySize(36, 20)
    dust.setAlpha(0.35)
    dust.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: dust,
      alpha: 0,
      duration: 320,
      onComplete: () => dust.destroy(),
    })
  }
}

/** @deprecated use spawnMfDoubleUpCast — kept for import stability */
export function spawnMfMuzzleFlash(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  spawnMfDoubleUpCast(scene, x, y, angle, depth)
}

export function spawnMfQImpact(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  bounceHit = false,
) {
  spawnMfDoubleUpHit(scene, x, y, depth, bounceHit)
}

export function tickMfBulletTrail(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
) {
  const key = pick(scene, MF_SPELL_VFX.aaSmoke, MF_SPELL_VFX.baEmbers)
  if (!key) return
  const t = scene.add.image(x, y, key)
  t.setDepth(depth + 3)
  t.setRotation(angle)
  t.setDisplaySize(14, 7)
  t.setAlpha(0.32)
  t.setBlendMode(SCREEN)
  scene.tweens.add({
    targets: t,
    alpha: 0,
    scale: 0.5,
    duration: 180,
    onComplete: () => t.destroy(),
  })
}
