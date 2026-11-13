import templates from './beastMapTemplates.json'
import { BEAST_MAP_TILES_H, BEAST_MAP_TILES_W } from './beastPreviewConstants'

type Template = {
  ground: number[][]
  decor: number[][]
  w: number
  h: number
}

function pickTemplate(mapX: number, mapY: number): Template {
  const block = Math.floor(mapX / 21) + Math.floor(mapY / 21)
  return block % 2 === 0 ? templates.map1 : templates.map2
}

/** Tiled CSV gids (firstgid=1) → índice 0-based para Phaser; 0 = vacío. */
function gidToIndex(gid: number): number {
  if (gid <= 0) {
    return -1
  }
  return gid - 1
}

export function buildBeastPreviewTileData(): {
  ground: number[][]
  decor: number[][]
} {
  const ground: number[][] = []
  const decor: number[][] = []

  for (let y = 0; y < BEAST_MAP_TILES_H; y++) {
    const groundRow: number[] = []
    const decorRow: number[] = []
    for (let x = 0; x < BEAST_MAP_TILES_W; x++) {
      const t = pickTemplate(x, y)
      const sx = x % t.w
      const sy = y % t.h
      groundRow.push(gidToIndex(t.ground[sy][sx]))
      decorRow.push(gidToIndex(t.decor[sy]?.[sx] ?? 0))
    }
    ground.push(groundRow)
    decor.push(decorRow)
  }

  return { ground, decor }
}
