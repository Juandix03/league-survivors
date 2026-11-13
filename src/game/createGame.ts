import * as Phaser from 'phaser'
import { REGISTRY_CHOOSE_UPGRADE } from './gameBridge'
import type { HudListener } from './hud'
import { createHudPublisher } from './hudPublisher'
import { ArenaScene } from './scenes/ArenaScene'
import type { ChampionId } from './champions/types'
import { setSessionChampionId } from './champions/registry'
import type { UpgradeId } from './upgrades'

export type GameHandle = {
  destroy: () => void
  chooseUpgrade: (id: UpgradeId) => void
}

export function createGame(
  parent: HTMLElement,
  onHud: HudListener,
  championId: ChampionId,
): GameHandle {
  parent.replaceChildren()
  setSessionChampionId(championId)

  const publishHud = createHudPublisher(onHud)

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#7aab4a',
    banner: false,
    audio: {
      noAudio: true,
    },
    render: {
      antialias: false,
      powerPreference: 'high-performance',
      roundPixels: true,
    },
    fps: {
      // El suavizado de delta fija ~16,67 ms por frame aunque el frame real tarde más
      // (p. ej. al cargar texturas), ralentizando jugador y enemigos hasta estabilizar FPS.
      smoothStep: false,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: '100%',
      height: '100%',
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    callbacks: {
      preBoot: (bootGame) => {
        bootGame.registry.set('onHud', publishHud)
      },
    },
    scene: [ArenaScene],
  })

  return {
    destroy() {
      setSessionChampionId(null)
      game.destroy(true)
    },
    chooseUpgrade(id: UpgradeId) {
      const handler = game.registry.get(REGISTRY_CHOOSE_UPGRADE) as
        | ((upgradeId: UpgradeId) => void)
        | undefined
      handler?.(id)
    },
  }
}
