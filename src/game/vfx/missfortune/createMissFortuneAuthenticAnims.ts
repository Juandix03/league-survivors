import * as Phaser from 'phaser'
import {
  MF_ANIM,
  MF_IMPACT_SPARKS_SHEET,
  MF_MUZZLE_SHEET,
  MF_Q_FLAMES_SHEET,
  MF_SMOKE_SHEET,
  MF_W_STARS_SHEET,
} from './missFortuneAtlases'

export function createMissFortuneAuthenticAnims(scene: Phaser.Scene) {
  ensureOneShot(
    scene,
    MF_ANIM.muzzleFlash,
    MF_MUZZLE_SHEET.key,
    0,
    MF_MUZZLE_SHEET.frameCount - 1,
    32,
  )
  ensureLoop(
    scene,
    MF_ANIM.qBulletFlames,
    MF_Q_FLAMES_SHEET.key,
    0,
    MF_Q_FLAMES_SHEET.frameCount - 1,
    22,
  )
  ensureOneShot(
    scene,
    MF_ANIM.qImpactSparks,
    MF_IMPACT_SPARKS_SHEET.key,
    0,
    MF_IMPACT_SPARKS_SHEET.frameCount - 1,
    28,
  )
  ensureLoop(
    scene,
    MF_ANIM.wStars,
    MF_W_STARS_SHEET.key,
    0,
    MF_W_STARS_SHEET.frameCount - 1,
    14,
  )
  ensureOneShot(scene, MF_ANIM.eRainSmoke, MF_SMOKE_SHEET.key, 0, 7, 18)
}

function ensureOneShot(
  scene: Phaser.Scene,
  animKey: string,
  sheetKey: string,
  start: number,
  end: number,
  frameRate: number,
) {
  if (!scene.textures.exists(sheetKey)) return
  if (scene.anims.exists(animKey)) scene.anims.remove(animKey)
  const frames = scene.anims.generateFrameNumbers(sheetKey, { start, end })
  if (frames.length === 0) return
  scene.anims.create({ key: animKey, frames, frameRate, repeat: 0 })
}

function ensureLoop(
  scene: Phaser.Scene,
  animKey: string,
  sheetKey: string,
  start: number,
  end: number,
  frameRate: number,
) {
  if (!scene.textures.exists(sheetKey)) return
  if (scene.anims.exists(animKey)) scene.anims.remove(animKey)
  const frames = scene.anims.generateFrameNumbers(sheetKey, { start, end })
  if (frames.length === 0) return
  scene.anims.create({ key: animKey, frames, frameRate, repeat: -1 })
}
