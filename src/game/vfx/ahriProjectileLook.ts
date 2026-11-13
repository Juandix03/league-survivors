import * as Phaser from 'phaser'

/** Bola espiritual (auto): pequeña, azul-blanca, sin tint forzado. */
export function styleAhriBasicProjectile(image: Phaser.GameObjects.Image) {
  image.setScale(0.95)
  image.clearTint()
  image.setAlpha(0.94)
  image.setBlendMode(Phaser.BlendModes.NORMAL)
}
