import type * as Phaser from 'phaser'
import {
  EZREAL_ANIM,
  EZREAL_BA_BOLT_SHEET,
  EZREAL_Q_BOLT_SHEET,
} from './ezrealBakedSprites'

export function createEzrealAuthenticAnims(scene: Phaser.Scene) {
  if (scene.textures.exists(EZREAL_BA_BOLT_SHEET.key) && !scene.anims.exists(EZREAL_ANIM.baBolt)) {
    scene.anims.create({
      key: EZREAL_ANIM.baBolt,
      frames: scene.anims.generateFrameNumbers(EZREAL_BA_BOLT_SHEET.key, {
        start: 0,
        end: EZREAL_BA_BOLT_SHEET.frameCount - 1,
      }),
      frameRate: 16,
      repeat: -1,
    })
  }
  if (scene.textures.exists(EZREAL_Q_BOLT_SHEET.key) && !scene.anims.exists(EZREAL_ANIM.qBolt)) {
    scene.anims.create({
      key: EZREAL_ANIM.qBolt,
      frames: scene.anims.generateFrameNumbers(EZREAL_Q_BOLT_SHEET.key, {
        start: 0,
        end: EZREAL_Q_BOLT_SHEET.frameCount - 1,
      }),
      frameRate: 22,
      repeat: -1,
    })
  }
}
