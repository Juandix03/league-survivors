import * as Phaser from 'phaser'
import { spawnArenaMeadowGround, syncArenaMeadowParallax } from './meadowGround'

/**
 * Suelo de arena: pasto procedural en dos capas (tileable, sin mapa repetido).
 */
export function spawnArenaGroundBase(scene: Phaser.Scene) {
  spawnArenaMeadowGround(scene)
}

export function syncArenaGroundParallax(scene: Phaser.Scene, scrollX: number, scrollY: number) {
  syncArenaMeadowParallax(scene, scrollX, scrollY)
}
