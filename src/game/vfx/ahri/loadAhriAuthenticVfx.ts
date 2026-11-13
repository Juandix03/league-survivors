import * as Phaser from 'phaser'
import {
  AHRI_SPELL_PARTICLE_FILES,
  AHRI_SPELL_PARTICLE_VFX,
} from './ahriAuthenticSpellVfx'
import { AHRI_BAKED_PROJECTILE_SPRITES } from './ahriProjectileSprites'

export function loadAhriAuthenticVfx(scene: Phaser.Scene) {
  for (const spec of AHRI_BAKED_PROJECTILE_SPRITES) {
    if (!scene.textures.exists(spec.key)) {
      scene.load.image(spec.key, spec.url)
    }
  }
  for (const key of Object.keys(AHRI_SPELL_PARTICLE_VFX) as (keyof typeof AHRI_SPELL_PARTICLE_VFX)[]) {
    const textureKey = AHRI_SPELL_PARTICLE_VFX[key]
    if (scene.textures.exists(textureKey)) continue
    scene.load.image(textureKey, AHRI_SPELL_PARTICLE_FILES[key])
  }
}

export function applyAhriAuthenticVfxFilters(scene: Phaser.Scene) {
  const keys = [
    ...AHRI_BAKED_PROJECTILE_SPRITES.map((s) => s.key),
    ...Object.values(AHRI_SPELL_PARTICLE_VFX),
  ]
  for (const key of keys) {
    if (!scene.textures.exists(key)) continue
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
}

export function hasAhriBakedBaSprite(scene: Phaser.Scene): boolean {
  return scene.textures.exists(AHRI_BAKED_PROJECTILE_SPRITES[0].key)
}
