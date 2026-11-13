import * as Phaser from 'phaser'
import { MeadowPreviewScene } from './MeadowPreviewScene'
import type { MeadowGroundMode } from './meadowPreviewConstants'

export type MeadowPreviewHandle = {
  destroy: () => void
  setGroundMode: (mode: MeadowGroundMode) => void
  getGroundMode: () => MeadowGroundMode
}

export function createMeadowPreviewGame(parent: HTMLElement): MeadowPreviewHandle {
  parent.replaceChildren()

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#7aab4a',
    banner: false,
    audio: { noAudio: true },
    render: { antialias: true, powerPreference: 'high-performance' },
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
    scene: [MeadowPreviewScene],
  })

  return {
    destroy() {
      game.destroy(true)
    },
    setGroundMode(mode) {
      const scene = game.scene.getScene('MeadowPreviewScene') as MeadowPreviewScene | null
      scene?.setGroundMode(mode)
    },
    getGroundMode() {
      const scene = game.scene.getScene('MeadowPreviewScene') as MeadowPreviewScene | null
      return scene?.getGroundMode() ?? 'procedural'
    },
  }
}
