import { WORLD_HEIGHT, WORLD_WIDTH } from '../game/constants'

/** Beast tiles are 16×16 px; ×4 → 64 px mundo (≈ altura visual de Jinx). */
export const BEAST_TILE_PX = 16
export const BEAST_TILE_SCALE = 4
export const BEAST_TILE_WORLD = BEAST_TILE_PX * BEAST_TILE_SCALE

export const BEAST_MAP_TILES_W = Math.floor(WORLD_WIDTH / BEAST_TILE_WORLD)
export const BEAST_MAP_TILES_H = Math.floor(WORLD_HEIGHT / BEAST_TILE_WORLD)

export const BEAST_TEXTURE_KEY = 'beast-grass-tiles'
export const BEAST_TILESET_URL =
  '/assets/arena/beast-preview/overworld_tileset_grass.png'

export { WORLD_HEIGHT, WORLD_WIDTH }
