import * as Phaser from 'phaser'
import { TEXTURE } from '../constants'
import { AHRI_SPELL_VFX } from './ahriSpellVfxConfig'

const OUTER_GLOW_SCALE = 0.11
const CORE_SCALE = 0.52

/** Orbe Q legible: núcleo horneado + halo suave del asset de LoL. */
export function createAhriQOrbVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y)
  root.setDepth(depth)

  if (scene.textures.exists(AHRI_SPELL_VFX.qOrbBackground)) {
    const glow = scene.add.image(0, 0, AHRI_SPELL_VFX.qOrbBackground)
    glow.setScale(OUTER_GLOW_SCALE)
    glow.setAlpha(0.42)
    glow.setTint(0x60a5fa)
    glow.setBlendMode(Phaser.BlendModes.ADD)
    root.add(glow)
  }

  const core = scene.add.image(0, 0, TEXTURE.ahriQOrb)
  core.setScale(CORE_SCALE)
  core.setBlendMode(Phaser.BlendModes.NORMAL)
  root.add(core)

  return root
}

/** Fase de vuelta: tinte verdusco (daño verdadero en LoL). */
export function applyAhriQOrbReturnLook(root: Phaser.GameObjects.Container) {
  root.each((child: Phaser.GameObjects.GameObject) => {
    if (child instanceof Phaser.GameObjects.Image) {
      child.setTint(0x86efac)
      child.setAlpha(0.95)
    }
  })
}
