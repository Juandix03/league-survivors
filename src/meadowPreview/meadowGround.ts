import * as Phaser from 'phaser'
import {
  type MeadowGroundLayers as ArenaLayers,
  spawnArenaMeadowGround,
  spawnArenaMeadowGroundPainted,
  syncArenaMeadowParallax,
} from '../game/arena/meadowGround'
import { ARENA_MEADOW_REGISTRY_KEY } from '../game/arena/meadowConfig'
import { WORLD_HEIGHT, WORLD_WIDTH } from '../game/constants'
import { rebakeGrassTextures } from '../game/textures'
import type { MeadowGroundMode } from './meadowPreviewConstants'

export type MeadowGroundLayers = {
  mode: MeadowGroundMode
  destroy: () => void
}

const FLAT_FILL = 0x6f9e52

function destroyRegistryLayers(scene: Phaser.Scene) {
  const layers = scene.registry.get(ARENA_MEADOW_REGISTRY_KEY) as ArenaLayers | undefined
  layers?.destroy()
  scene.registry.remove(ARENA_MEADOW_REGISTRY_KEY)
}

function createPainted(scene: Phaser.Scene): MeadowGroundLayers {
  spawnArenaMeadowGroundPainted(scene)
  return {
    mode: 'painted',
    destroy: () => destroyRegistryLayers(scene),
  }
}

export function createMeadowGround(scene: Phaser.Scene, mode: MeadowGroundMode): MeadowGroundLayers {
  destroyRegistryLayers(scene)

  if (mode === 'flat') {
    const rect = scene.add
      .rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, FLAT_FILL, 1)
      .setOrigin(0.5, 0.5)
      .setDepth(0)
    return {
      mode: 'flat',
      destroy: () => rect.destroy(),
    }
  }

  if (mode === 'procedural') {
    rebakeGrassTextures(scene)
    spawnArenaMeadowGround(scene)
    return {
      mode: 'procedural',
      destroy: () => destroyRegistryLayers(scene),
    }
  }

  return createPainted(scene)
}

export function syncMeadowGroundParallax(
  scene: Phaser.Scene,
  mode: MeadowGroundMode,
  scrollX: number,
  scrollY: number,
) {
  if (mode === 'flat') {
    return
  }
  if (mode === 'procedural' || mode === 'painted') {
    syncArenaMeadowParallax(scene, scrollX, scrollY)
  }
}
