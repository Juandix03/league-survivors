import * as Phaser from 'phaser'
import {
  createChampionAnimations,
  createChampionPlayerSprite,
  loadActiveChampionAssets,
  syncChampionAnimation,
} from '../game/champions/championAssets'
import { JINX_ANIMS } from '../game/champions/jinx'
import { PLAYER_SPEED, TEXTURE, WORLD_HEIGHT, WORLD_WIDTH } from '../game/constants'
import { spawnArenaEnemy, syncEnemyHpBar, type ArenaEnemy } from '../game/enemies/enemyFactory'
import { bakeArenaTextures } from '../game/textures'
import {
  createMeadowGround,
  syncMeadowGroundParallax,
  type MeadowGroundLayers,
} from './meadowGround'
import {
  MEADOW_PAINTED_KEY_A,
  MEADOW_PAINTED_KEY_B,
  MEADOW_PAINTED_URL_A,
  MEADOW_PAINTED_URL_B,
} from '../game/arena/meadowConfig'
import {
  MEADOW_PREVIEW_REGISTRY_GROUND,
  type MeadowGroundMode,
} from './meadowPreviewConstants'
import { scatterMeadowEdgeDecor } from './scatterEdgeDecor'

type MoveKeys = {
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
}

export class MeadowPreviewScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: MoveKeys
  private enemies: ArenaEnemy[] = []
  private demoProjectiles: Phaser.GameObjects.Image[] = []
  private decorSprites: Phaser.GameObjects.Image[] = []
  private groundLayers: MeadowGroundLayers | undefined
  private groundMode: MeadowGroundMode = 'procedural'
  private playerAnimKey = JINX_ANIMS.idle

  constructor() {
    super({ key: 'MeadowPreviewScene' })
  }

  preload() {
    loadActiveChampionAssets(this)
    this.load.image(MEADOW_PAINTED_KEY_A, MEADOW_PAINTED_URL_A)
    this.load.image(MEADOW_PAINTED_KEY_B, MEADOW_PAINTED_URL_B)
  }

  create() {
    bakeArenaTextures(this)
    createChampionAnimations(this)

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    const initial = this.registry.get(MEADOW_PREVIEW_REGISTRY_GROUND) as MeadowGroundMode | undefined
    if (initial === 'flat' || initial === 'procedural' || initial === 'painted') {
      this.groundMode = initial
    }
    this.applyGroundMode(this.groundMode)

    this.drawWorldBorder()
    this.decorSprites = scatterMeadowEdgeDecor(this)

    this.player = createChampionPlayerSprite(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2)
    this.player.setDepth(this.player.y)
    this.spawnDemoEntities()
    this.setupCamera()
    this.setupInput()
  }

  setGroundMode(mode: MeadowGroundMode) {
    if (mode === this.groundMode) {
      return
    }
    this.applyGroundMode(mode)
  }

  getGroundMode(): MeadowGroundMode {
    return this.groundMode
  }

  private applyGroundMode(mode: MeadowGroundMode) {
    this.groundLayers?.destroy()
    this.groundMode = mode
    this.registry.set(MEADOW_PREVIEW_REGISTRY_GROUND, mode)
    this.groundLayers = createMeadowGround(this, mode)
    const showDecor = mode !== 'flat'
    for (const s of this.decorSprites) {
      s.setVisible(showDecor)
    }
  }

  private drawWorldBorder() {
    const g = this.add.graphics()
    g.lineStyle(4, 0x2d4a22, 0.85)
    g.strokeRect(2, 2, WORLD_WIDTH - 4, WORLD_HEIGHT - 4)
    g.setDepth(9000)
  }

  private spawnDemoEntities() {
    const spots: { x: number; y: number; id: 'basic' | 'fast' | 'tank' }[] = [
      { x: WORLD_WIDTH / 2 - 160, y: WORLD_HEIGHT / 2 - 100, id: 'basic' },
      { x: WORLD_WIDTH / 2 + 180, y: WORLD_HEIGHT / 2 - 60, id: 'fast' },
      { x: WORLD_WIDTH / 2 - 200, y: WORLD_HEIGHT / 2 + 120, id: 'tank' },
      { x: WORLD_WIDTH / 2 + 140, y: WORLD_HEIGHT / 2 + 150, id: 'basic' },
    ]

    for (const spot of spots) {
      const enemy = spawnArenaEnemy(this, spot.x, spot.y, spot.id)
      enemy.health = Math.round(enemy.maxHealth * (0.4 + Math.random() * 0.45))
      syncEnemyHpBar(enemy)
      enemy.visual.setDepth(spot.y)
      this.enemies.push(enemy)
    }

    const projectileKeys = [TEXTURE.powPowBolt, TEXTURE.fishbonesRocket, TEXTURE.zapBolt] as const
    for (let i = 0; i < projectileKeys.length; i++) {
      const img = this.add.image(
        WORLD_WIDTH / 2 - 60 + i * 55,
        WORLD_HEIGHT / 2 - 30,
        projectileKeys[i],
      )
      img.setDepth(WORLD_HEIGHT / 2)
      this.demoProjectiles.push(img)
    }
  }

  private setupCamera() {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.centerOn(this.player.x, this.player.y)
    this.cameras.main.setZoom(1)
  }

  private setupInput() {
    const keyboard = this.input.keyboard
    if (!keyboard) {
      return
    }
    this.cursors = keyboard.createCursorKeys()
    this.wasd = keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
    }) as MoveKeys
  }

  update() {
    this.movePlayer()
    this.player.setDepth(this.player.y)
    for (const enemy of this.enemies) {
      enemy.visual.setDepth(enemy.visual.y)
    }
    this.animateDemoProjectiles()
    syncMeadowGroundParallax(
      this,
      this.groundMode,
      this.cameras.main.scrollX,
      this.cameras.main.scrollY,
    )
  }

  private movePlayer() {
    let vx = 0
    let vy = 0
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      vx -= 1
    }
    if (this.cursors.right.isDown || this.wasd.right.isDown) {
      vx += 1
    }
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      vy -= 1
    }
    if (this.cursors.down.isDown || this.wasd.down.isDown) {
      vy += 1
    }

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy) || 1
      vx = (vx / len) * PLAYER_SPEED
      vy = (vy / len) * PLAYER_SPEED
    }

    this.player.setVelocity(vx, vy)
    this.playerAnimKey = syncChampionAnimation(
      this.player,
      vx,
      vy,
      this.playerAnimKey,
    )
  }

  private animateDemoProjectiles() {
    const t = this.time.now / 1000
    this.demoProjectiles.forEach((p, i) => {
      p.x += Math.cos(t * 2 + i) * 0.55
      p.y += Math.sin(t * 2.3 + i * 0.6) * 0.45
      p.setDepth(p.y)
    })
  }
}
