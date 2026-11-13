import * as Phaser from 'phaser'
import {
  YASUO_SPELL_PARTICLE_FILES,
  YASUO_SPELL_PARTICLE_VFX,
} from './yasuoAuthenticSpellVfx'

export function loadYasuoAuthenticVfx(scene: Phaser.Scene) {
  for (const key of Object.keys(YASUO_SPELL_PARTICLE_VFX) as (keyof typeof YASUO_SPELL_PARTICLE_VFX)[]) {
    const textureKey = YASUO_SPELL_PARTICLE_VFX[key]
    if (scene.textures.exists(textureKey)) continue
    scene.load.image(textureKey, YASUO_SPELL_PARTICLE_FILES[key])
  }
}

export function applyYasuoAuthenticVfxFilters(scene: Phaser.Scene) {
  for (const key of Object.values(YASUO_SPELL_PARTICLE_VFX)) {
    if (!scene.textures.exists(key)) continue
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
}
