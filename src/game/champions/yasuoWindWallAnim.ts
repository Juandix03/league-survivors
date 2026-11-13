import * as Phaser from 'phaser'
import {
  YASUO_W_SCB_HORIZONTAL_SHEET,
  YASUO_W_SCB_TOPDOWN_SHEET,
} from './yasuo'
import { aimFacingFromDirection } from './yasuoAttackAnim'
import { YASUO_SPELL_PARTICLE_VFX } from '../vfx/yasuo/yasuoAuthenticSpellVfx'

const CURTAIN_KEY = 'yasuo-w-wall-curtain'

function addEdgeMist(scene: Phaser.Scene, root: Phaser.GameObjects.Container, span: number) {
  const steamKey = YASUO_SPELL_PARTICLE_VFX.wSteam
  const wispyKey = YASUO_SPELL_PARTICLE_VFX.wWispy
  const key = scene.textures.exists(steamKey) ? steamKey : wispyKey
  if (!scene.textures.exists(key)) return

  for (const sign of [-1, 1] as const) {
    const edge = scene.add.image(sign * span * 0.44, 10, key)
    edge.setOrigin(sign < 0 ? 1 : 0, 0.68)
    edge.setDisplaySize(54, 40)
    edge.setAlpha(0.24)
    edge.setTint(0xc6ecff)
    edge.setBlendMode(Phaser.BlendModes.ADD)
    edge.setFlipX(sign < 0)
    root.add(edge)
  }
}

function attachWallScroll(
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

function addScrollBand(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  textureKey: string,
  span: number,
  height: number,
  y: number,
  alpha: number,
  tint: number,
  speed: number,
  tileScaleX = 2,
) {
  if (!scene.textures.exists(textureKey)) return
  const tile = scene.add.tileSprite(0, y, span, height, textureKey)
  tile.setOrigin(0.5, 0.72)
  tile.setAlpha(alpha)
  tile.setTint(tint)
  tile.setBlendMode(Phaser.BlendModes.ADD)
  tile.setTileScale(tileScaleX, 1)
  tile.tilePositionX = Phaser.Math.FloatBetween(0, 96)
  root.add(tile)
  attachWallScroll(scene, root, tile, speed)
}

export const YASUO_W_SCB_HORIZ_PREFIX = 'yasuo-w-wall-scb-h'
export const YASUO_W_SCB_TOPDOWN_PREFIX = 'yasuo-w-wall-scb-td'

export const YASUO_W_SCB_HORIZ_ANIM = {
  down: `${YASUO_W_SCB_HORIZ_PREFIX}-down`,
  up: `${YASUO_W_SCB_HORIZ_PREFIX}-up`,
  side: `${YASUO_W_SCB_HORIZ_PREFIX}-side`,
} as const

export const YASUO_W_SCB_TOPDOWN_ANIM = {
  down: `${YASUO_W_SCB_TOPDOWN_PREFIX}-down`,
  up: `${YASUO_W_SCB_TOPDOWN_PREFIX}-up`,
  side: `${YASUO_W_SCB_TOPDOWN_PREFIX}-side`,
} as const

export type YasuoWindWallScbVisual = {
  root: Phaser.GameObjects.Container
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.TileSprite
}

type WallSheetCfg = {
  key: string
  frameWidth: number
  frameHeight: number
  framesPerRow: number
  frameRate: number
}

function pickWallAnim(
  nx: number,
  ny: number,
  prefix: typeof YASUO_W_SCB_TOPDOWN_PREFIX | typeof YASUO_W_SCB_HORIZ_PREFIX,
): string {
  const facing = aimFacingFromDirection(nx, ny)
  if (facing === 'up') return `${prefix}-up`
  if (facing === 'down') return `${prefix}-down`
  return `${prefix}-side`
}

function registerSheetAnims(scene: Phaser.Scene, cfg: WallSheetCfg, prefix: string) {
  if (!scene.textures.exists(cfg.key)) return
  const fpr = cfg.framesPerRow
  const defs = [
    { key: `${prefix}-down`, start: 0, end: fpr - 1 },
    { key: `${prefix}-up`, start: fpr, end: fpr * 2 - 1 },
    { key: `${prefix}-side`, start: fpr * 2, end: fpr * 3 - 1 },
  ]
  for (const def of defs) {
    if (scene.anims.exists(def.key)) scene.anims.remove(def.key)
    const frames = scene.anims.generateFrameNumbers(cfg.key, { start: def.start, end: def.end })
    if (!frames.length) continue
    scene.anims.create({
      key: def.key,
      frames,
      frameRate: cfg.frameRate,
      repeat: -1,
    })
  }
}

export function loadYasuoWindWallAssets(scene: Phaser.Scene) {
  for (const cfg of [YASUO_W_SCB_TOPDOWN_SHEET, YASUO_W_SCB_HORIZONTAL_SHEET]) {
    if (!cfg.url || scene.textures.exists(cfg.key)) continue
    scene.load.spritesheet(cfg.key, cfg.url, {
      frameWidth: cfg.frameWidth,
      frameHeight: cfg.frameHeight,
    })
  }
  const curtainUrl = '/assets/champions/yasuo/w_wall_curtain_strip.png?v=2'
  if (!scene.textures.exists(CURTAIN_KEY)) {
    scene.load.image(CURTAIN_KEY, curtainUrl)
  }
}

export function createYasuoWindWallScbAnimations(scene: Phaser.Scene) {
  registerSheetAnims(scene, YASUO_W_SCB_TOPDOWN_SHEET, YASUO_W_SCB_TOPDOWN_PREFIX)
  registerSheetAnims(scene, YASUO_W_SCB_HORIZONTAL_SHEET, YASUO_W_SCB_HORIZ_PREFIX)
}

function addWallBackdrop(scene: Phaser.Scene, root: Phaser.GameObjects.Container, span: number) {
  addScrollBand(scene, root, CURTAIN_KEY, span * 1.06, 40, 6, 0.2, 0xdaf4ff, 1.4, 2.4)
  addScrollBand(
    scene,
    root,
    YASUO_SPELL_PARTICLE_VFX.wWallMain02,
    span * 1.04,
    34,
    8,
    0.14,
    0x8ee0ff,
    -1.2,
    2.8,
  )
}

function createSheetWallSprite(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  cfg: WallSheetCfg,
  animPrefix: typeof YASUO_W_SCB_TOPDOWN_PREFIX | typeof YASUO_W_SCB_HORIZ_PREFIX,
  nx: number,
  ny: number,
  span: number,
): Phaser.GameObjects.Sprite | null {
  const animKey = pickWallAnim(nx, ny, animPrefix)
  if (!scene.textures.exists(cfg.key) || !scene.anims.exists(animKey)) return null

  const facing = aimFacingFromDirection(nx, ny)
  const flip = facing === 'left' || facing === 'right' ? nx < 0 : false
  const aspect = cfg.frameWidth / cfg.frameHeight
  const displayW = span
  const displayH = Phaser.Math.Clamp(displayW / aspect, 76, 142)

  const glow = scene.add.sprite(0, 4, cfg.key, 0)
  glow.setOrigin(0.5, 0.78)
  glow.setDisplaySize(displayW * 1.02, displayH * 1.06)
  glow.setAlpha(0.14)
  glow.setTint(0x7dd3fc)
  glow.setBlendMode(Phaser.BlendModes.ADD)
  glow.setFlipX(flip)
  glow.play(animKey)
  root.add(glow)

  const body = scene.add.sprite(0, 2, cfg.key, 0)
  body.setOrigin(0.5, 0.78)
  body.setDisplaySize(displayW * 1.06, displayH * 1.05)
  body.setAlpha(0.74)
  body.setTint(0xf2fcff)
  body.setBlendMode(Phaser.BlendModes.ADD)
  body.setFlipX(flip)
  body.play(animKey)
  root.add(body)

  return body
}

/** Muro W: sheet top-down ancho + cortina scroll; sin tiles iso estirados. */
export function createYasuoWindWallScbVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  nx: number,
  ny: number,
  depth: number,
  spanPx: number,
  thicknessPx = 52,
): YasuoWindWallScbVisual | null {
  const root = scene.add.container(x, y)
  root.setDepth(depth + 6)

  const span = Phaser.Math.Clamp(spanPx * 2.45, 248, 372)
  const _bandH = Phaser.Math.Clamp(thicknessPx * 2.6, 68, 120)

  addWallBackdrop(scene, root, span)
  addEdgeMist(scene, root, span)

  const body =
    createSheetWallSprite(
      scene,
      root,
      YASUO_W_SCB_TOPDOWN_SHEET,
      YASUO_W_SCB_TOPDOWN_PREFIX,
      nx,
      ny,
      span,
    ) ??
    createSheetWallSprite(
      scene,
      root,
      YASUO_W_SCB_HORIZONTAL_SHEET,
      YASUO_W_SCB_HORIZ_PREFIX,
      nx,
      ny,
      span,
    )

  if (body) return { root, sprite: body }

  const mainKey = YASUO_SPELL_PARTICLE_VFX.wWallMain
  if (!scene.textures.exists(mainKey)) {
    root.destroy()
    return null
  }
  const tile = scene.add.tileSprite(0, 4, span, _bandH, mainKey)
  tile.setOrigin(0.5, 0.72)
  tile.setAlpha(0.32)
  tile.setTint(0xe8f8ff)
  tile.setBlendMode(Phaser.BlendModes.ADD)
  tile.setTileScale(2.6, 1.1)
  root.add(tile)
  attachWallScroll(scene, root, tile, 1.5)
  return { root, sprite: tile }
}
