import * as Phaser from 'phaser'
import { JINX_SPELL_VFX, JINX_W_PROJECTILE_SPRITE } from './jinxSpellVfxConfig'
import { hasJinxSpellTexture } from './loadJinxSpellVfx'

const ADD = Phaser.BlendModes.ADD
const MUZZLE_OFFSET = 34

export type JinxWProjectileVisual = {
  root: Phaser.GameObjects.Container
  /** Legacy particle strip (fallback only). */
  lightningStrip: Phaser.GameObjects.TileSprite | null
}

export function loadJinxWProjectileSprite(scene: Phaser.Scene) {
  const { key, url } = JINX_W_PROJECTILE_SPRITE
  if (!scene.textures.exists(key)) {
    scene.load.image(key, url)
  }
}

export function hasJinxWProjectileSprite(scene: Phaser.Scene): boolean {
  return scene.textures.exists(JINX_W_PROJECTILE_SPRITE.key)
}

function createFromPngSprite(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): JinxWProjectileVisual {
  const nx = Math.cos(angle)
  const ny = Math.sin(angle)
  const spawnX = x + nx * MUZZLE_OFFSET
  const spawnY = y + ny * MUZZLE_OFFSET

  const root = scene.add.container(spawnX, spawnY)
  root.setDepth(depth)
  root.setRotation(angle)
  root.setData('jinxWVisual', 'png-zap-sprite')

  const bolt = scene.add.image(0, 0, JINX_W_PROJECTILE_SPRITE.key)
  bolt.setOrigin(0.12, 0.52)
  bolt.setBlendMode(ADD)
  bolt.setDisplaySize(52, 30)
  bolt.setTint(0xcffafe)
  bolt.setAlpha(0.95)
  root.add(bolt)

  if (hasJinxSpellTexture(scene, 'wMisFlash')) {
    const core = scene.add.image(14, 0, JINX_SPELL_VFX.wMisFlash)
    core.setOrigin(0.5, 0.5)
    core.setBlendMode(ADD)
    core.setScale(0.08)
    core.setAlpha(0.75)
    core.setTint(0xf0abfc)
    root.add(core)
  }

  return { root, lightningStrip: null }
}

function createFromParticleStrip(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
): JinxWProjectileVisual | null {
  if (!hasJinxSpellTexture(scene, 'wLightningStrip')) {
    return null
  }

  const nx = Math.cos(angle)
  const ny = Math.sin(angle)
  const spawnX = x + nx * MUZZLE_OFFSET
  const spawnY = y + ny * MUZZLE_OFFSET

  const root = scene.add.container(spawnX, spawnY)
  root.setDepth(depth)
  root.setRotation(angle)
  root.setData('jinxWVisual', 'vfx-quad-lightning-scroll-fallback')

  const stripW = 18
  const stripH = 56
  const strip = scene.add.tileSprite(0, 0, stripW, stripH, JINX_SPELL_VFX.wLightningStrip)
  strip.setOrigin(0.5, 0.88)
  strip.setBlendMode(ADD)
  strip.setTint(0x7dd3fc)
  strip.setAlpha(0.92)
  strip.setTileScale(1 / stripW, stripH / 512)
  root.add(strip)

  return { root, lightningStrip: strip }
}

export function createJinxWProjectileVisual(
  scene: Phaser.Scene,
  playerX: number,
  playerY: number,
  angle: number,
  depth: number,
): JinxWProjectileVisual | null {
  if (hasJinxWProjectileSprite(scene)) {
    return createFromPngSprite(scene, playerX, playerY, angle, depth)
  }

  if (import.meta.env.DEV) {
    console.warn(
      '[Jinx W] PNG sprite missing — fallback a estela jinx_lightning. Ejecutá npm run jinx:bake-w-sprite',
    )
  }
  return createFromParticleStrip(scene, playerX, playerY, angle, depth)
}

export function updateJinxWProjectileScroll(
  strip: Phaser.GameObjects.TileSprite | null,
  deltaMs: number,
) {
  if (!strip) return
  strip.tilePositionY -= deltaMs * 0.028
}
