import * as Phaser from 'phaser'
import { scatterArenaEdgeDecor } from './scatterEdgeDecor'

export const ARENA_SCATTER_DECOR_ENABLED = true

export function populateArenaDecor(scene: Phaser.Scene) {
  if (!ARENA_SCATTER_DECOR_ENABLED) {
    return
  }
  scatterArenaEdgeDecor(scene)
}
