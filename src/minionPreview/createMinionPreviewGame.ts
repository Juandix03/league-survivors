import * as Phaser from 'phaser'
import { MinionPreviewScene } from './MinionPreviewScene'
import { parseMinionArtMode, type MinionPreviewArtMode } from './minionPreviewArtMode'
import type { BakedAnimRow } from './bakedMinionAssets'

export type MinionPreviewHandle = {
  destroy: () => void
  setArtMode: (mode: MinionPreviewArtMode) => void
  getArtMode: () => MinionPreviewArtMode
  setBakedAnimRow: (row: BakedAnimRow) => void
  getBakedAnimRow: () => BakedAnimRow
  getBakedSheetCount: () => number
}

export function createMinionPreviewGame(parent: HTMLElement): MinionPreviewHandle {
  parent.replaceChildren()
  const initialArt = parseMinionArtMode(window.location.search)

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#3a3a44',
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
    scene: [MinionPreviewScene],
  })

  function getScene() {
    return game.scene.getScene('MinionPreviewScene') as MinionPreviewScene | null
  }

  return {
    destroy() {
      game.destroy(true)
    },
    setArtMode(mode) {
      getScene()?.setArtMode(mode)
    },
    getArtMode() {
      return getScene()?.getArtMode() ?? initialArt
    },
    setBakedAnimRow(row) {
      getScene()?.setBakedAnimRow(row)
    },
    getBakedAnimRow() {
      return getScene()?.getBakedAnimRow() ?? 'idle'
    },
    getBakedSheetCount() {
      return getScene()?.getBakedSheetCount() ?? 0
    },
  }
}
