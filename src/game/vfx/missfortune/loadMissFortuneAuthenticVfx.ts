import * as Phaser from 'phaser'
import { MF_ATLAS_SHEETS } from './missFortuneAtlases'
import { MF_SPELL_FILES, MF_SPELL_VFX } from './missFortuneAuthenticSpellVfx'
import { loadMfMakeItRainAssets } from './mfMakeItRainVisual'
import { loadMfRBulletAssets } from './mfRBulletVisual'

function isAtlasSourceKey(key: keyof typeof MF_SPELL_VFX) {
  return MF_ATLAS_SHEETS.some((s) => s.fileKey === key)
}

export function loadMissFortuneAuthenticVfx(scene: Phaser.Scene) {
  loadMfMakeItRainAssets(scene)
  loadMfRBulletAssets(scene)
  for (const sheet of MF_ATLAS_SHEETS) {
    if (scene.textures.exists(sheet.key)) continue
    scene.load.spritesheet(sheet.key, MF_SPELL_FILES[sheet.fileKey], {
      frameWidth: sheet.frameWidth,
      frameHeight: sheet.frameHeight,
    })
  }

  for (const key of Object.keys(MF_SPELL_VFX) as (keyof typeof MF_SPELL_VFX)[]) {
    if (isAtlasSourceKey(key)) continue
    if (key === 'eRainStreak') continue
    const textureKey = MF_SPELL_VFX[key]
    if (scene.textures.exists(textureKey)) continue
    scene.load.image(textureKey, MF_SPELL_FILES[key])
  }
}

export function applyMissFortuneAuthenticVfxFilters(scene: Phaser.Scene) {
  for (const key of Object.values(MF_SPELL_VFX)) {
    if (!scene.textures.exists(key)) continue
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
  for (const sheet of MF_ATLAS_SHEETS) {
    if (!scene.textures.exists(sheet.key)) continue
    scene.textures.get(sheet.key).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
}
