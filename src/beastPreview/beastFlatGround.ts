import * as Phaser from 'phaser'
import { WORLD_HEIGHT, WORLD_WIDTH } from './beastPreviewConstants'

const ARENA_GROUND_FILL = 0x6f9e52

/** Mismo relleno plano que `spawnArenaGroundBase` (arena actual). */
export function createBeastPreviewFlatGround(scene: Phaser.Scene) {
  return scene.add
    .rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, ARENA_GROUND_FILL, 1)
    .setOrigin(0.5, 0.5)
    .setDepth(0)
}
