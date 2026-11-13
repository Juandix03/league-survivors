import * as Phaser from 'phaser'
import {
  BEAST_MAP_TILES_H,
  BEAST_MAP_TILES_W,
  BEAST_TEXTURE_KEY,
  BEAST_TILE_PX,
  BEAST_TILE_SCALE,
} from './beastPreviewConstants'
import { buildBeastPreviewTileData } from './buildBeastPreviewLayers'

export type BeastTilemapLayers = {
  ground: Phaser.Tilemaps.TilemapLayer
  decor: Phaser.Tilemaps.TilemapLayer
  destroy: () => void
}

export function createBeastTilemapLayers(scene: Phaser.Scene): BeastTilemapLayers {
  const { ground, decor } = buildBeastPreviewTileData()

  const map = scene.make.tilemap({
    tileWidth: BEAST_TILE_PX,
    tileHeight: BEAST_TILE_PX,
    width: BEAST_MAP_TILES_W,
    height: BEAST_MAP_TILES_H,
  })

  const tileset = map.addTilesetImage('grass_biome', BEAST_TEXTURE_KEY, BEAST_TILE_PX, BEAST_TILE_PX)
  if (!tileset) {
    throw new Error('Beast tileset failed to bind')
  }

  const groundLayer = map.createBlankLayer('ground', tileset, 0, 0, BEAST_MAP_TILES_W, BEAST_MAP_TILES_H)
  const decorLayer = map.createBlankLayer('decor', tileset, 0, 0, BEAST_MAP_TILES_W, BEAST_MAP_TILES_H)
  if (!groundLayer || !decorLayer) {
    throw new Error('Beast tilemap layers failed')
  }

  for (let y = 0; y < BEAST_MAP_TILES_H; y++) {
    for (let x = 0; x < BEAST_MAP_TILES_W; x++) {
      const g = ground[y][x]
      if (g >= 0) {
        groundLayer.putTileAt(g, x, y)
      }
      const d = decor[y][x]
      if (d >= 0) {
        decorLayer.putTileAt(d, x, y)
      }
    }
  }

  groundLayer.setScale(BEAST_TILE_SCALE)
  decorLayer.setScale(BEAST_TILE_SCALE)
  groundLayer.setDepth(0)
  decorLayer.setDepth(5)

  return {
    ground: groundLayer,
    decor: decorLayer,
    destroy() {
      groundLayer.destroy()
      decorLayer.destroy()
      map.destroy()
    },
  }
}
