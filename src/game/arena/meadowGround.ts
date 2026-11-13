import * as Phaser from 'phaser'
import { TEXTURE, WORLD_HEIGHT, WORLD_WIDTH } from '../constants'
import { GRASS_TILE, rebakeGrassTextures } from '../textures'
import {
  ARENA_MEADOW_REGISTRY_KEY,
  MEADOW_LAYER2_TILE_OFFSET_X,
  MEADOW_LAYER2_TILE_OFFSET_Y,
  MEADOW_PAINTED_KEY_A,
  MEADOW_PAINTED_KEY_B,
} from './meadowConfig'

export type MeadowGroundLayers = {
  primary: Phaser.GameObjects.TileSprite
  secondary: Phaser.GameObjects.TileSprite
  destroy: () => void
}

function createDualTileGround(
  scene: Phaser.Scene,
  keyA: string,
  keyB: string,
  secondaryAlpha: number,
): MeadowGroundLayers {
  const primary = scene.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, keyA)
  primary.setOrigin(0, 0)
  primary.setDepth(0)
  primary.setScrollFactor(1)
  primary.setTilePosition(0, 0)

  const secondary = scene.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, keyB)
  secondary.setOrigin(0, 0)
  secondary.setDepth(0)
  secondary.setScrollFactor(1)
  secondary.setAlpha(secondaryAlpha)
  secondary.setBlendMode(Phaser.BlendModes.MULTIPLY)
  secondary.setTilePosition(MEADOW_LAYER2_TILE_OFFSET_X, MEADOW_LAYER2_TILE_OFFSET_Y)

  for (const key of [keyA, keyB]) {
    if (scene.textures.exists(key)) {
      scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
    }
  }

  return {
    primary,
    secondary,
    destroy() {
      primary.destroy()
      secondary.destroy()
    },
  }
}

/**
 * Pasto tileable procedural (192 px) — mismo lenguaje visual que arbustos baked.
 * El CC0 “hand-painted” es foto 1024²; a escala 1:1 parece césped real y achica al personaje.
 * Usar painted solo en meadow-preview con tileScale reducido.
 */
export function spawnArenaMeadowGround(scene: Phaser.Scene) {
  rebakeGrassTextures(scene)
  const layers = createDualTileGround(scene, TEXTURE.grass, TEXTURE.grassAlt, 0.32)
  scene.registry.set(ARENA_MEADOW_REGISTRY_KEY, layers)
}

/** Preview opcional: textura PamNawi escalada a ~192 px mundo por repetición. */
export function spawnArenaMeadowGroundPainted(
  scene: Phaser.Scene,
  tileWorldSize: number = GRASS_TILE,
) {
  if (
    !scene.textures.exists(MEADOW_PAINTED_KEY_A) ||
    !scene.textures.exists(MEADOW_PAINTED_KEY_B)
  ) {
    spawnArenaMeadowGround(scene)
    return
  }
  const tex = scene.textures.get(MEADOW_PAINTED_KEY_A)
  const tileScale = tileWorldSize / tex.getSourceImage().width
  const layers = createDualTileGround(scene, MEADOW_PAINTED_KEY_A, MEADOW_PAINTED_KEY_B, 0.28)
  layers.primary.setTileScale(tileScale, tileScale)
  layers.secondary.setTileScale(tileScale, tileScale)
  scene.registry.set(ARENA_MEADOW_REGISTRY_KEY, layers)
}

/** Intencionalmente vacío: mover tilePosition con el scroll hace que decor/XP “patine” vs el suelo. */
export function syncArenaMeadowParallax(_scene: Phaser.Scene, _scrollX: number, _scrollY: number) {
  /* no-op */
}
