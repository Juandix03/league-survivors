import * as Phaser from 'phaser'
import { LEESIN_Q_MISSILE_SIDE_ANIM, LEESIN_Q_MISSILE_SIDE_SHEET } from './leeSinBakedSpellSprites'

export function createLeeSinAuthenticAnims(scene: Phaser.Scene) {
  if (
    scene.textures.exists(LEESIN_Q_MISSILE_SIDE_SHEET.key) &&
    !scene.anims.exists(LEESIN_Q_MISSILE_SIDE_ANIM)
  ) {
    scene.anims.create({
      key: LEESIN_Q_MISSILE_SIDE_ANIM,
      frames: scene.anims.generateFrameNumbers(LEESIN_Q_MISSILE_SIDE_SHEET.key, {
        start: 0,
        end: 7,
      }),
      frameRate: 22,
      repeat: -1,
    })
  }
}
