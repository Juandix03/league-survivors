import * as Phaser from 'phaser'
import {
  LUX_BAKED_SPELL_SPRITES,
  LUX_Q_BINDING_SHEET,
  LUX_E_KUGEL_TOP_SHEET,
  LUX_Q_BINDING_TOP_SHEET,
  LUX_R_BEAM_TOP_SHEET,
  LUX_W_WAVE_TOP_SHEET,
} from './luxBakedSpellSprites'
import { LUX_SPELL_PARTICLE_FILES, LUX_SPELL_PARTICLE_VFX } from './luxAuthenticSpellVfx'

export function loadLuxAuthenticVfx(scene: Phaser.Scene) {
  for (const key of Object.keys(LUX_SPELL_PARTICLE_VFX) as (keyof typeof LUX_SPELL_PARTICLE_VFX)[]) {
    const textureKey = LUX_SPELL_PARTICLE_VFX[key]
    if (scene.textures.exists(textureKey)) continue
    scene.load.image(textureKey, LUX_SPELL_PARTICLE_FILES[key])
  }
  for (const baked of LUX_BAKED_SPELL_SPRITES) {
    if (scene.textures.exists(baked.key)) continue
    scene.load.image(baked.key, baked.url)
  }
  if (!scene.textures.exists(LUX_Q_BINDING_SHEET.key)) {
    scene.load.spritesheet(LUX_Q_BINDING_SHEET.key, LUX_Q_BINDING_SHEET.url, {
      frameWidth: LUX_Q_BINDING_SHEET.frameWidth,
      frameHeight: LUX_Q_BINDING_SHEET.frameHeight,
    })
  }
  if (!scene.textures.exists(LUX_Q_BINDING_TOP_SHEET.key)) {
    scene.load.spritesheet(LUX_Q_BINDING_TOP_SHEET.key, LUX_Q_BINDING_TOP_SHEET.url, {
      frameWidth: LUX_Q_BINDING_TOP_SHEET.frameWidth,
      frameHeight: LUX_Q_BINDING_TOP_SHEET.frameHeight,
    })
  }
  if (!scene.textures.exists(LUX_W_WAVE_TOP_SHEET.key)) {
    scene.load.spritesheet(LUX_W_WAVE_TOP_SHEET.key, LUX_W_WAVE_TOP_SHEET.url, {
      frameWidth: LUX_W_WAVE_TOP_SHEET.frameWidth,
      frameHeight: LUX_W_WAVE_TOP_SHEET.frameHeight,
    })
  }
  if (!scene.textures.exists(LUX_E_KUGEL_TOP_SHEET.key)) {
    scene.load.spritesheet(LUX_E_KUGEL_TOP_SHEET.key, LUX_E_KUGEL_TOP_SHEET.url, {
      frameWidth: LUX_E_KUGEL_TOP_SHEET.frameWidth,
      frameHeight: LUX_E_KUGEL_TOP_SHEET.frameHeight,
    })
  }
  if (!scene.textures.exists(LUX_R_BEAM_TOP_SHEET.key)) {
    scene.load.spritesheet(LUX_R_BEAM_TOP_SHEET.key, LUX_R_BEAM_TOP_SHEET.url, {
      frameWidth: LUX_R_BEAM_TOP_SHEET.frameWidth,
      frameHeight: LUX_R_BEAM_TOP_SHEET.frameHeight,
    })
  }
}

export function applyLuxAuthenticVfxFilters(scene: Phaser.Scene) {
  for (const key of Object.values(LUX_SPELL_PARTICLE_VFX)) {
    if (!scene.textures.exists(key)) continue
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
  for (const baked of LUX_BAKED_SPELL_SPRITES) {
    if (!scene.textures.exists(baked.key)) continue
    scene.textures.get(baked.key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
}
