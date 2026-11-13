import * as Phaser from 'phaser'
import {
  LUX_Q_BINDING_ANIM,
  LUX_Q_BINDING_SHEET,
  LUX_Q_BINDING_TOP_ANIM,
  LUX_Q_BINDING_TOP_SHEET,
  LUX_E_KUGEL_TOP_ANIM,
  LUX_E_KUGEL_TOP_SHEET,
  LUX_R_BEAM_TOP_ANIM,
  LUX_R_BEAM_TOP_SHEET,
  LUX_W_WAVE_TOP_ANIM,
  LUX_W_WAVE_TOP_SHEET,
} from './luxBakedSpellSprites'

export function createLuxAuthenticAnims(scene: Phaser.Scene) {
  if (scene.textures.exists(LUX_Q_BINDING_SHEET.key) && !scene.anims.exists(LUX_Q_BINDING_ANIM)) {
    scene.anims.create({
      key: LUX_Q_BINDING_ANIM,
      frames: scene.anims.generateFrameNumbers(LUX_Q_BINDING_SHEET.key, {
        start: 0,
        end: 7,
      }),
      frameRate: 20,
      repeat: -1,
    })
  }
  if (
    scene.textures.exists(LUX_Q_BINDING_TOP_SHEET.key) &&
    !scene.anims.exists(LUX_Q_BINDING_TOP_ANIM)
  ) {
    scene.anims.create({
      key: LUX_Q_BINDING_TOP_ANIM,
      frames: scene.anims.generateFrameNumbers(LUX_Q_BINDING_TOP_SHEET.key, {
        start: 0,
        end: 7,
      }),
      frameRate: 18,
      repeat: -1,
    })
  }
  if (
    scene.textures.exists(LUX_W_WAVE_TOP_SHEET.key) &&
    !scene.anims.exists(LUX_W_WAVE_TOP_ANIM)
  ) {
    scene.anims.create({
      key: LUX_W_WAVE_TOP_ANIM,
      frames: scene.anims.generateFrameNumbers(LUX_W_WAVE_TOP_SHEET.key, {
        start: 0,
        end: 7,
      }),
      frameRate: 16,
      repeat: -1,
    })
  }
  if (
    scene.textures.exists(LUX_E_KUGEL_TOP_SHEET.key) &&
    !scene.anims.exists(LUX_E_KUGEL_TOP_ANIM)
  ) {
    scene.anims.create({
      key: LUX_E_KUGEL_TOP_ANIM,
      frames: scene.anims.generateFrameNumbers(LUX_E_KUGEL_TOP_SHEET.key, {
        start: 0,
        end: 7,
      }),
      frameRate: 18,
      repeat: -1,
    })
  }
  if (
    scene.textures.exists(LUX_R_BEAM_TOP_SHEET.key) &&
    !scene.anims.exists(LUX_R_BEAM_TOP_ANIM)
  ) {
    scene.anims.create({
      key: LUX_R_BEAM_TOP_ANIM,
      frames: scene.anims.generateFrameNumbers(LUX_R_BEAM_TOP_SHEET.key, {
        start: 0,
        end: 7,
      }),
      frameRate: 22,
      repeat: -1,
    })
  }
}
