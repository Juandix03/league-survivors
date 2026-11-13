import * as Phaser from 'phaser'
import {
  JINX_R_PROJECTILE_SPRITE,
  JINX_SPELL_VFX,
  JINX_SPELL_VFX_FILES,
} from './jinxSpellVfxConfig'
import { loadJinxWProjectileSprite } from './jinxWProjectileVisual'

function loadJinxRProjectileSprite(scene: Phaser.Scene) {
  const { key, url } = JINX_R_PROJECTILE_SPRITE
  if (!scene.textures.exists(key)) {
    scene.load.image(key, url)
  }
}

export function loadJinxSpellVfxAssets(scene: Phaser.Scene) {
  loadJinxWProjectileSprite(scene)
  loadJinxRProjectileSprite(scene)
  for (const key of Object.keys(JINX_SPELL_VFX) as (keyof typeof JINX_SPELL_VFX)[]) {
    const textureKey = JINX_SPELL_VFX[key]
    const url = JINX_SPELL_VFX_FILES[key]
    if (!scene.textures.exists(textureKey)) {
      scene.load.image(textureKey, url)
    }
  }
}

export function applyJinxSpellVfxFilters(scene: Phaser.Scene) {
  for (const key of Object.values(JINX_SPELL_VFX)) {
    if (scene.textures.exists(key)) {
      scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
    }
  }
  if (hasJinxRProjectileSprite(scene)) {
    scene.textures.get(JINX_R_PROJECTILE_SPRITE.key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
}

export function hasJinxSpellTexture(
  scene: Phaser.Scene,
  key: keyof typeof JINX_SPELL_VFX,
): boolean {
  return scene.textures.exists(JINX_SPELL_VFX[key])
}

export function hasJinxRProjectileSprite(scene: Phaser.Scene): boolean {
  return scene.textures.exists(JINX_R_PROJECTILE_SPRITE.key)
}
