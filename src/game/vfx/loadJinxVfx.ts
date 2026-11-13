import * as Phaser from 'phaser'
import { JINX_VFX, JINX_VFX_FILES } from './jinxVfxConfig'
import { registerJinxVfxFrames } from './jinxVfxFrames'

export function loadJinxVfxAssets(scene: Phaser.Scene) {
  for (const key of Object.keys(JINX_VFX) as (keyof typeof JINX_VFX)[]) {
    const textureKey = JINX_VFX[key]
    const url = JINX_VFX_FILES[key]
    if (scene.textures.exists(textureKey)) {
      continue
    }
    scene.load.image(textureKey, url)
  }
}

export function applyJinxVfxTextureFilters(scene: Phaser.Scene) {
  for (const key of Object.values(JINX_VFX)) {
    if (!scene.textures.exists(key)) {
      continue
    }
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
  registerJinxVfxFrames(scene)
}
