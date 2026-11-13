import * as Phaser from 'phaser'
import { BeastGrassPreviewScene } from './BeastGrassPreviewScene'

export type BeastPreviewHandle = {
  destroy: () => void
  setTerrainMode: (mode: 'beast' | 'flat') => void
  getTerrainMode: () => 'beast' | 'flat'
}

export function createBeastPreviewGame(parent: HTMLElement): BeastPreviewHandle {
  parent.replaceChildren()

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#7aab4a',
    banner: false,
    audio: { noAudio: true },
    render: {
      antialias: true,
      powerPreference: 'high-performance',
    },
    fps: { smoothStep: false },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: '100%',
      height: '100%',
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [BeastGrassPreviewScene],
  })

  return {
    destroy() {
      game.destroy(true)
    },
    setTerrainMode(mode) {
      const scene = game.scene.getScene('BeastGrassPreviewScene') as BeastGrassPreviewScene | null
      scene?.setTerrainMode(mode)
    },
    getTerrainMode() {
      const scene = game.scene.getScene('BeastGrassPreviewScene') as BeastGrassPreviewScene | null
      return scene?.getTerrainMode() ?? 'beast'
    },
  }
}
