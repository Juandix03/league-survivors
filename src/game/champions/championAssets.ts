import * as Phaser from 'phaser'
import { AHRI_ANIMS } from './ahri'
import { JINX_ANIMS } from './jinx'
import { LEESIN_ANIMS } from './leesin'
import { MISSFORTUNE_ANIMS } from './missfortune'
import { EZREAL_ANIMS, EZREAL_ATTACK_SHEET } from './ezreal'
import { createEzrealAttackAnimation, loadEzrealAttackSheet } from './ezrealAttackAnim'
import { createEzrealSpellCastAnimations, loadEzrealSpellCastSheets } from './ezrealSpellAnim'
import { ensureEzrealPlaceholderSheet } from './ezrealPlaceholderSheet'
import { LUX_ANIMS } from './lux'
import { createLeeSinSpellCastAnimations, loadLeeSinSpellCastSheets } from './leeSinSpellAnim'
import {
  createMissFortuneSpellCastAnimations,
  loadMissFortuneSpellCastSheets,
} from './missFortuneSpellAnim'
import { createLuxSpellCastAnimations, loadLuxSpellCastSheets } from './luxSpellAnim'
import { ensureLuxPlaceholderSheet } from './luxPlaceholderSheet'
import { YASUO_ANIMS } from './yasuo'
import { createYasuoAttackAnimation, loadYasuoAttackSheet } from './yasuoAttackAnim'
import {
  createYasuoWindWallScbAnimations,
  loadYasuoWindWallAssets,
} from './yasuoWindWallAnim'
import { ensureYasuoPlaceholderSheet } from './yasuoPlaceholderSheet'
import { getActiveChampion } from './registry'
import {
  facingFromVelocity,
  WALK8_OCTANT_SUFFIX,
  walk8AnimSuffixFromVelocity,
  type PlayerFacing,
} from './playerFacing'
import type { ChampionAnimationSet } from './types'
import {
  buildChampionAnimationFrames,
  championTextureHasFrame,
} from './championSheetFrames'

const ANIM_SETS: Record<string, ChampionAnimationSet> = {
  jinx: JINX_ANIMS,
  ahri: AHRI_ANIMS,
  yasuo: YASUO_ANIMS,
  lux: LUX_ANIMS,
  leesin: LEESIN_ANIMS,
  missfortune: MISSFORTUNE_ANIMS,
  ezreal: EZREAL_ANIMS,
}

export function loadActiveChampionAssets(scene: Phaser.Scene) {
  const champion = getActiveChampion()
  const { sheet } = champion
  if (!sheet.url) {
    if (champion.id === 'yasuo') {
      ensureYasuoPlaceholderSheet(scene)
    }
    return
  }
  if (scene.textures.exists(sheet.key) && sheet.url) {
    if (!championTextureHasFrame(sheet.key, scene, 0)) {
      scene.textures.remove(sheet.key)
    }
  }
  if (!scene.textures.exists(sheet.key) && sheet.url) {
    scene.load.spritesheet(sheet.key, sheet.url, {
      frameWidth: sheet.frameWidth,
      frameHeight: sheet.frameHeight,
    })
  }
  if (champion.id === 'yasuo') {
    loadYasuoAttackSheet(scene)
    loadYasuoWindWallAssets(scene)
  }
  if (champion.id === 'lux') {
    loadLuxSpellCastSheets(scene)
  }
  if (champion.id === 'leesin') {
    loadLeeSinSpellCastSheets(scene)
  }
  if (champion.id === 'missfortune') {
    loadMissFortuneSpellCastSheets(scene)
  }
  if (champion.id === 'ezreal') {
    loadEzrealAttackSheet(scene)
    loadEzrealSpellCastSheets(scene)
  }
}

export function applyChampionTextureFilter(scene: Phaser.Scene) {
  const champion = getActiveChampion()
  if (champion.textureFilter !== 'nearest') {
    return
  }
  if (!scene.textures.exists(champion.sheet.key)) {
    return
  }
  scene.textures.get(champion.sheet.key).setFilter(Phaser.Textures.FilterMode.NEAREST)
  if (champion.id === 'yasuo') {
    const wallKey = 'yasuo-w-wall-scb-anim'
    if (scene.textures.exists(wallKey)) {
      scene.textures.get(wallKey).setFilter(Phaser.Textures.FilterMode.LINEAR)
    }
  }
  if (champion.id === 'ezreal' && scene.textures.exists(EZREAL_ATTACK_SHEET.key)) {
    scene.textures.get(EZREAL_ATTACK_SHEET.key).setFilter(Phaser.Textures.FilterMode.NEAREST)
  }
}

export function createChampionAnimations(scene: Phaser.Scene) {
  const { sheet, id } = getActiveChampion()
  if (!scene.textures.exists(sheet.key)) {
    if (id === 'lux' && !sheet.url) {
      ensureLuxPlaceholderSheet(scene)
    }
    if (id === 'ezreal') {
      ensureEzrealPlaceholderSheet(scene)
    }
    if (!scene.textures.exists(sheet.key)) {
      return
    }
  }
  if (id === 'ezreal' && !championTextureHasFrame(sheet.key, scene, 0)) {
    scene.textures.remove(sheet.key)
    ensureEzrealPlaceholderSheet(scene)
  }

  applyChampionTextureFilter(scene)

  const prefix = id
  const champion = getActiveChampion()
  const n = champion.animTiming?.framesPerCycle ?? 4
  const idleRate = champion.animTiming?.idleFrameRate ?? 7
  const walkRate = champion.animTiming?.walkFrameRate ?? 10
  const defs =
    champion.directionMode === '8'
      ? [
          { key: `${prefix}-idle`, start: 0, end: n - 1, rate: idleRate },
          ...WALK8_OCTANT_SUFFIX.map((suffix, i) => ({
            key: `${prefix}-walk-${suffix}`,
            start: n * (i + 1),
            end: n * (i + 2) - 1,
            rate: walkRate,
          })),
        ]
      : [
          { key: `${prefix}-idle`, start: 0, end: n - 1, rate: idleRate },
          { key: `${prefix}-walk-down`, start: n, end: n * 2 - 1, rate: walkRate },
          { key: `${prefix}-walk-up`, start: n * 2, end: n * 3 - 1, rate: walkRate },
          { key: `${prefix}-walk-side`, start: n * 3, end: n * 4 - 1, rate: walkRate },
        ]

  for (const def of defs) {
    if (scene.anims.exists(def.key)) {
      scene.anims.remove(def.key)
    }
    const frames = buildChampionAnimationFrames(scene, sheet.key, def.start, def.end)
    if (frames.length === 0) {
      console.warn(
        `[champion] Animation "${def.key}" skipped: no frames ${def.start}-${def.end} on "${sheet.key}".`,
      )
      continue
    }
    scene.anims.create({
      key: def.key,
      frames,
      frameRate: def.rate,
      repeat: -1,
    })
  }

  if (id === 'yasuo') {
    createYasuoAttackAnimation(scene)
    createYasuoWindWallScbAnimations(scene)
  }
  if (id === 'lux') {
    createLuxSpellCastAnimations(scene)
  }
  if (id === 'leesin') {
    createLeeSinSpellCastAnimations(scene)
  }
  if (id === 'missfortune') {
    createMissFortuneSpellCastAnimations(scene)
  }
  if (id === 'ezreal') {
    createEzrealAttackAnimation(scene)
    createEzrealSpellCastAnimations(scene)
  }
}

function playChampionAnimationSafe(
  sprite: Phaser.Physics.Arcade.Sprite,
  animKey: string,
): boolean {
  const scene = sprite.scene
  if (!scene?.anims.exists(animKey)) {
    return false
  }
  const anim = scene.anims.get(animKey)
  if (!anim?.frames.length) {
    return false
  }
  sprite.anims.play(animKey, true)
  return true
}

function applyChampionStaticFrame(sprite: Phaser.Physics.Arcade.Sprite, sheetKey: string) {
  const texture = sprite.scene.textures.get(sheetKey)
  if (championTextureHasFrame(sheetKey, sprite.scene, 0)) {
    sprite.setFrame(0)
    return
  }
  if (texture.has('__BASE')) {
    sprite.setFrame('__BASE')
  }
}

export function createChampionPlayerSprite(
  scene: Phaser.Scene,
  x: number,
  y: number,
): Phaser.Physics.Arcade.Sprite {
  const champion = getActiveChampion()
  const sprite = scene.physics.add.sprite(x, y, champion.sheet.key, 0)
  sprite.setOrigin(champion.originX, champion.originY)
  sprite.setScale(champion.displayScale)
  sprite.setCollideWorldBounds(true)
  sprite.setCircle(
    champion.bodyRadius,
    champion.bodyOffsetX,
    champion.bodyOffsetY,
  )
  const idle = ANIM_SETS[champion.id]?.idle ?? JINX_ANIMS.idle
  if (!playChampionAnimationSafe(sprite, idle)) {
    console.warn(
      `[champion] Could not play idle "${idle}" on "${champion.sheet.key}"; using static frame.`,
    )
    applyChampionStaticFrame(sprite, champion.sheet.key)
  }
  return sprite
}

export function syncChampionAnimation(
  sprite: Phaser.Physics.Arcade.Sprite,
  vx: number,
  vy: number,
  lastAnimKey: string,
): string {
  const champion = getActiveChampion()
  const walk8 = walk8AnimSuffixFromVelocity(vx, vy)
  const set = ANIM_SETS[champion.id] ?? JINX_ANIMS
  let animKey = pickAnimationKey(champion.id, facingFromVelocity(vx, vy))
  if (champion.directionMode === '8') {
    if (walk8) {
      const key8 = `${champion.id}-walk-${walk8}`
      animKey = sprite.scene.anims.exists(key8) ? key8 : animKey
    } else {
      animKey = set.idle
    }
  }

  if (champion.directionMode === '8') {
    sprite.setFlipX(false)
  } else {
    sprite.setFlipX(facingFromVelocity(vx, vy) === 'left')
  }
  sprite.setRotation(0)

  if (animKey !== lastAnimKey) {
    if (playChampionAnimationSafe(sprite, animKey)) {
      return animKey
    }
    return lastAnimKey
  }

  if (!sprite.anims.isPlaying) {
    playChampionAnimationSafe(sprite, animKey)
  }

  return lastAnimKey
}

function pickAnimationKey(championId: string, facing: PlayerFacing): string {
  const set = ANIM_SETS[championId] ?? JINX_ANIMS

  switch (facing) {
    case 'down':
      return set.walkDown
    case 'up':
      return set.walkUp
    case 'left':
    case 'right':
      return set.walkSide
    default:
      return set.idle
  }
}
