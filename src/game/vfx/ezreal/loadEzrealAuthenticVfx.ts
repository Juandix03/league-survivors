import * as Phaser from 'phaser'
import { EZREAL_SPELL_FILES, EZREAL_SPELL_VFX } from './ezrealAuthenticSpellVfx'
import {
  EZREAL_BA_BOLT_SHEET,
  EZREAL_BA_BOLT_SPRITE,
  EZREAL_Q_BOLT_SHEET,
  EZREAL_Q_BOLT_SPRITE,
} from './ezrealBakedSprites'

export function loadEzrealAuthenticVfx(scene: Phaser.Scene) {
  if (!scene.textures.exists(EZREAL_BA_BOLT_SHEET.key)) {
    scene.load.spritesheet(EZREAL_BA_BOLT_SHEET.key, EZREAL_BA_BOLT_SHEET.url, {
      frameWidth: EZREAL_BA_BOLT_SHEET.frameWidth,
      frameHeight: EZREAL_BA_BOLT_SHEET.frameHeight,
    })
  }
  if (!scene.textures.exists(EZREAL_BA_BOLT_SPRITE.key)) {
    scene.load.image(EZREAL_BA_BOLT_SPRITE.key, EZREAL_BA_BOLT_SPRITE.url)
  }
  if (!scene.textures.exists(EZREAL_Q_BOLT_SHEET.key)) {
    scene.load.spritesheet(EZREAL_Q_BOLT_SHEET.key, EZREAL_Q_BOLT_SHEET.url, {
      frameWidth: EZREAL_Q_BOLT_SHEET.frameWidth,
      frameHeight: EZREAL_Q_BOLT_SHEET.frameHeight,
    })
  }
  if (!scene.textures.exists(EZREAL_Q_BOLT_SPRITE.key)) {
    scene.load.image(EZREAL_Q_BOLT_SPRITE.key, EZREAL_Q_BOLT_SPRITE.url)
  }

  for (const key of Object.keys(EZREAL_SPELL_VFX) as (keyof typeof EZREAL_SPELL_VFX)[]) {
    const textureKey = EZREAL_SPELL_VFX[key]
    if (scene.textures.exists(textureKey)) continue
    scene.load.image(textureKey, EZREAL_SPELL_FILES[key])
  }
}

export function applyEzrealAuthenticVfxFilters(scene: Phaser.Scene) {
  for (const key of [
    ...Object.values(EZREAL_SPELL_VFX),
    EZREAL_BA_BOLT_SHEET.key,
    EZREAL_BA_BOLT_SPRITE.key,
    EZREAL_Q_BOLT_SHEET.key,
    EZREAL_Q_BOLT_SPRITE.key,
  ]) {
    if (!scene.textures.exists(key)) continue
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
}
