import * as Phaser from 'phaser'
import { LEESIN_BAKED_SPELL_SPRITES, LEESIN_Q_MISSILE_SIDE_SHEET } from './leeSinBakedSpellSprites'
import { LEESIN_SPELL_PARTICLE_FILES, LEESIN_SPELL_PARTICLE_VFX } from './leeSinAuthenticSpellVfx'

export function loadLeeSinAuthenticVfx(scene: Phaser.Scene) {
  for (const key of Object.keys(LEESIN_SPELL_PARTICLE_VFX) as (keyof typeof LEESIN_SPELL_PARTICLE_VFX)[]) {
    const textureKey = LEESIN_SPELL_PARTICLE_VFX[key]
    if (scene.textures.exists(textureKey)) continue
    scene.load.image(textureKey, LEESIN_SPELL_PARTICLE_FILES[key])
  }
  for (const baked of LEESIN_BAKED_SPELL_SPRITES) {
    if (scene.textures.exists(baked.key)) continue
    scene.load.image(baked.key, baked.url)
  }
  if (!scene.textures.exists(LEESIN_Q_MISSILE_SIDE_SHEET.key)) {
    scene.load.spritesheet(LEESIN_Q_MISSILE_SIDE_SHEET.key, LEESIN_Q_MISSILE_SIDE_SHEET.url, {
      frameWidth: LEESIN_Q_MISSILE_SIDE_SHEET.frameWidth,
      frameHeight: LEESIN_Q_MISSILE_SIDE_SHEET.frameHeight,
    })
  }
}

export function applyLeeSinAuthenticVfxFilters(scene: Phaser.Scene) {
  for (const key of Object.values(LEESIN_SPELL_PARTICLE_VFX)) {
    if (!scene.textures.exists(key)) continue
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
  for (const baked of LEESIN_BAKED_SPELL_SPRITES) {
    if (!scene.textures.exists(baked.key)) continue
    scene.textures.get(baked.key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
  if (scene.textures.exists(LEESIN_Q_MISSILE_SIDE_SHEET.key)) {
    scene.textures.get(LEESIN_Q_MISSILE_SIDE_SHEET.key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
}
