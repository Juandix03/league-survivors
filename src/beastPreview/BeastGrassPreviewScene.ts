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
import { createBeastPreviewFlatGround } from './beastFlatGround'
import {
  BEAST_TEXTURE_KEY,
  BEAST_TILESET_URL,
} from './beastPreviewConstants'
import { createBeastTilemapLayers, type BeastTilemapLayers } from './beastTilemapLayer'

type MoveKeys = {
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
}

export type BeastTerrainMode = 'beast' | 'flat'

export const BEAST_PREVIEW_REGISTRY_TERRAIN = 'beastPreviewTerrainMode'

export class BeastGrassPreviewScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: MoveKeys
  private enemies: ArenaEnemy[] = []
  private demoProjectiles: Phaser.GameObjects.Image[] = []
  private beastLayers: BeastTilemapLayers | undefined
  private flatGround!: Phaser.GameObjects.Rectangle
  private terrainMode: BeastTerrainMode = 'beast'
  private playerAnimKey = JINX_ANIMS.idle

  constructor() {
    super({ key: 'BeastGrassPreviewScene' })
  }

  preload() {
    loadActiveChampionAssets(this)
    this.load.image(BEAST_TEXTURE_KEY, BEAST_TILESET_URL)
  }

  create() {
    bakeArenaTextures(this)
    createChampionAnimations(this)

    if (this.textures.exists(BEAST_TEXTURE_KEY)) {
      this.textures.get(BEAST_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    }

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.flatGround = createBeastPreviewFlatGround(this)
    this.flatGround.setVisible(false)

    this.beastLayers = createBeastTilemapLayers(this)

    this.drawWorldBorder()

    this.player = createChampionPlayerSprite(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2)
    this.player.setDepth(this.player.y)
    this.spawnDemoEntities()
    this.setupCamera()
    this.setupInput()

    const initial = this.registry.get(BEAST_PREVIEW_REGISTRY_TERRAIN) as BeastTerrainMode | undefined
    if (initial === 'flat' || initial === 'beast') {
      this.setTerrainMode(initial)
    }
  }

  setTerrainMode(mode: BeastTerrainMode) {
    this.terrainMode = mode
    this.registry.set(BEAST_PREVIEW_REGISTRY_TERRAIN, mode)
    const showBeast = mode === 'beast'
    this.beastLayers?.ground.setVisible(showBeast)
    this.beastLayers?.decor.setVisible(showBeast)
    this.flatGround.setVisible(!showBeast)
  }

  getTerrainMode(): BeastTerrainMode {
    return this.terrainMode
  }

  private drawWorldBorder() {
    const g = this.add.graphics()
    g.lineStyle(4, 0x2d4a22, 0.85)
    g.strokeRect(2, 2, WORLD_WIDTH - 4, WORLD_HEIGHT - 4)
    g.setDepth(9000)
  }

  private spawnDemoEntities() {
    const spots: { x: number; y: number; id: 'basic' | 'fast' | 'tank' }[] = [
      { x: WORLD_WIDTH / 2 - 180, y: WORLD_HEIGHT / 2 - 120, id: 'basic' },
      { x: WORLD_WIDTH / 2 + 200, y: WORLD_HEIGHT / 2 - 80, id: 'fast' },
      { x: WORLD_WIDTH / 2 - 220, y: WORLD_HEIGHT / 2 + 140, id: 'tank' },
      { x: WORLD_WIDTH / 2 + 160, y: WORLD_HEIGHT / 2 + 180, id: 'basic' },
      { x: WORLD_WIDTH / 2 + 40, y: WORLD_HEIGHT / 2 - 200, id: 'fast' },
    ]

    for (const spot of spots) {
      const enemy = spawnArenaEnemy(this, spot.x, spot.y, spot.id)
      enemy.health = Math.round(enemy.maxHealth * (0.35 + Math.random() * 0.55))
      syncEnemyHpBar(enemy)
      enemy.visual.setDepth(spot.y)
      this.enemies.push(enemy)
    }

    const projectileKeys = [TEXTURE.powPowBolt, TEXTURE.fishbonesRocket, TEXTURE.zapBolt] as const
    for (let i = 0; i < projectileKeys.length; i++) {
      const img = this.add.image(
        WORLD_WIDTH / 2 - 80 + i * 70,
        WORLD_HEIGHT / 2 - 40,
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
    this.syncEnemyDepths()
    this.animateDemoProjectiles()
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

  private syncEnemyDepths() {
    for (const enemy of this.enemies) {
      enemy.visual.setDepth(enemy.visual.y)
    }
  }

  private animateDemoProjectiles() {
    const t = this.time.now / 1000
    this.demoProjectiles.forEach((p, i) => {
      p.x += Math.cos(t * 2 + i) * 0.6
      p.y += Math.sin(t * 2.4 + i * 0.7) * 0.5
      p.setDepth(p.y)
    })
  }
}
