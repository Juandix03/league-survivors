import * as Phaser from 'phaser'
import { AHRI_SPELL_PARTICLE_VFX } from './ahri/ahriAuthenticSpellVfx'
import { spawnAhriBasicImpactVisual } from './ahri/ahriSpellVisuals'

/** Impacto genérico Ahri (BA/Q/R) — chispas auténticas o fallback mínimo. */
export function spawnAhriBasicImpact(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
) {
  if (scene.textures.exists(AHRI_SPELL_PARTICLE_VFX.baHitSparks)) {
    spawnAhriBasicImpactVisual(scene, x, y, depth)
    return
  }

  const ring = scene.add.circle(x, y, 10, 0xe879f9, 0.55)
  ring.setStrokeStyle(2, 0xa855f7, 0.9)
  ring.setDepth(depth + 1)
  ring.setBlendMode(Phaser.BlendModes.ADD)
  scene.tweens.add({
    targets: ring,
    alpha: 0,
    scale: 1.6,
    duration: 140,
    onComplete: () => ring.destroy(),
  })
}
