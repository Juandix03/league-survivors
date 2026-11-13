import type * as Phaser from 'phaser'

export type MfBulletTimeConeVisual = {
  sync: (px: number, py: number, nx: number, ny: number) => void
  destroy: () => void
}

/** Sin overlay de cono (solo balas/cometas en juego). */
export function createMfBulletTimeCone(
  _scene: Phaser.Scene,
  _px: number,
  _py: number,
  _nx: number,
  _ny: number,
  _range: number,
  _halfAngle: number,
  _depth: number,
): MfBulletTimeConeVisual {
  return {
    sync() {},
    destroy() {},
  }
}
