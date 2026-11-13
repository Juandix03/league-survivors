import * as Phaser from 'phaser'
import { AHRI_SPELL_VFX, AHRI_SPELL_VFX_FILES } from './ahriSpellVfxConfig'
import { AHRI_VFX, AHRI_VFX_FILES } from './ahriVfxConfig'

export function loadAhriVfxAssets(scene: Phaser.Scene) {
  for (const key of Object.keys(AHRI_VFX) as (keyof typeof AHRI_VFX)[]) {
    const textureKey = AHRI_VFX[key]
    if (scene.textures.exists(textureKey)) continue
    scene.load.image(textureKey, AHRI_VFX_FILES[key])
  }
  for (const key of Object.keys(AHRI_SPELL_VFX) as (keyof typeof AHRI_SPELL_VFX)[]) {
    const textureKey = AHRI_SPELL_VFX[key]
    if (scene.textures.exists(textureKey)) continue
    scene.load.image(textureKey, AHRI_SPELL_VFX_FILES[key])
  }
}

export function applyAhriVfxTextureFilters(scene: Phaser.Scene) {
  for (const key of [...Object.values(AHRI_VFX), ...Object.values(AHRI_SPELL_VFX)]) {
    if (!scene.textures.exists(key)) continue
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
}

export function ahriVfxTextureKey(
  scene: Phaser.Scene,
  preferred: string,
  fallback: string,
): string {
  if (scene.textures.exists(preferred)) return preferred
  return fallback
}
