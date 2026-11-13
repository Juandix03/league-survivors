import * as Phaser from 'phaser'
import { MF_ANIM, MF_W_STARS_SHEET } from './missFortuneAtlases'
import { MF_SPELL_VFX } from './missFortuneAuthenticSpellVfx'

const ADD = Phaser.BlendModes.ADD
const SCREEN = Phaser.BlendModes.SCREEN

function pick(scene: Phaser.Scene, ...keys: string[]) {
  for (const k of keys) {
    if (scene.textures.exists(k)) return k
  }
  return null
}

export function attachMfStrutBuff(
  scene: Phaser.Scene,
  follow: Phaser.GameObjects.Sprite,
  durationMs: number,
) {
  const buffKey = pick(scene, MF_SPELL_VFX.wBuff)
  const aura = buffKey ? scene.add.image(follow.x, follow.y, buffKey) : null
  if (aura) {
    aura.setDepth(follow.depth - 2)
    aura.setDisplaySize(44, 44)
    aura.setAlpha(0.55)
    aura.setBlendMode(SCREEN)
    scene.tweens.add({
      targets: aura,
      alpha: { from: 0.4, to: 0.65 },
      duration: 420,
      yoyo: true,
      repeat: Math.ceil(durationMs / 420),
    })
  }

  let stars: Phaser.GameObjects.Sprite | null = null
  if (scene.textures.exists(MF_W_STARS_SHEET.key) && scene.anims.exists(MF_ANIM.wStars)) {
    stars = scene.add.sprite(follow.x, follow.y - 8, MF_W_STARS_SHEET.key)
    stars.setDepth(follow.depth + 1)
    stars.setDisplaySize(52, 52)
    stars.setAlpha(0.7)
    stars.setBlendMode(ADD)
    stars.play(MF_ANIM.wStars)
  }

  const heartKey = pick(scene, MF_SPELL_VFX.wHeart)
  const heart = heartKey ? scene.add.image(follow.x, follow.y - 18, heartKey) : null
  if (heart) {
    heart.setDepth(follow.depth + 2)
    heart.setDisplaySize(22, 22)
    heart.setAlpha(0.75)
    heart.setBlendMode(ADD)
    scene.tweens.add({
      targets: heart,
      y: follow.y - 28,
      alpha: { from: 0.85, to: 0.2 },
      duration: 900,
      yoyo: true,
      repeat: Math.ceil(durationMs / 900),
    })
  }

  const tick = scene.time.addEvent({
    delay: 16,
    loop: true,
    callback: () => {
      if (!follow.active) {
        cleanup()
        return
      }
      aura?.setPosition(follow.x, follow.y)
      stars?.setPosition(follow.x, follow.y - 8)
      if (heart?.active) heart.x = follow.x
    },
  })

  const endTimer = scene.time.delayedCall(durationMs, cleanup)

  function cleanup() {
    tick.destroy()
    endTimer.destroy()
    aura?.destroy()
    stars?.destroy()
    heart?.destroy()
  }

  return cleanup
}
