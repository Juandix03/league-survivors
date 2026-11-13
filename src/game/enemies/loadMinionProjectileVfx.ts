import * as Phaser from 'phaser'
import {
  MINION_PROJECTILE_VFX_LOAD_LIST,
  type MinionProjectileVfxSet,
} from './minionProjectileVfxConfig'

export function loadMinionProjectileVfxAssets(scene: Phaser.Scene) {
  for (const set of MINION_PROJECTILE_VFX_LOAD_LIST) {
    if (!scene.textures.exists(set.bodyKey)) {
      scene.load.image(set.bodyKey, set.bodyUrl)
    }
  }
}

export function applyMinionProjectileVfxFilters(scene: Phaser.Scene) {
  for (const set of MINION_PROJECTILE_VFX_LOAD_LIST) {
    if (scene.textures.exists(set.bodyKey)) {
      scene.textures.get(set.bodyKey).setFilter(Phaser.Textures.FilterMode.LINEAR)
    }
  }
}

export function hasMinionProjectileVfx(
  scene: Phaser.Scene,
  set: MinionProjectileVfxSet,
): boolean {
  return scene.textures.exists(set.bodyKey)
}
