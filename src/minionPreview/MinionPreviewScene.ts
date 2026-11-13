import * as Phaser from 'phaser'
import {
  createChampionAnimations,
  createChampionPlayerSprite,
  loadActiveChampionAssets,
  syncChampionAnimation,
} from '../game/champions/championAssets'
import { JINX_ANIMS } from '../game/champions/jinx'
import { PLAYER_SPEED, WORLD_HEIGHT, WORLD_WIDTH } from '../game/constants'
import { spawnArenaMeadowGround } from '../game/arena/meadowGround'
import { rebakeGrassTextures } from '../game/textures'
import type { MinionPreviewKind } from './minionPreviewConstants'
import {
  BAKED_GRID_KINDS,
  MINION_PREVIEW_LABELS,
} from './minionPreviewConstants'
import { rebakeInspiredMinionTextures } from './inspiredMinionTextures'
import {
  spawnPreviewMinion,
  syncPreviewMinionHpBar,
  playPreviewMinionBakedAnim,
  type PreviewMinion,
} from './spawnPreviewMinion'
import {
  MINION_PREVIEW_REGISTRY_ART,
  parseMinionArtMode,
  type MinionPreviewArtMode,
} from './minionPreviewArtMode'
import { loadRiotMinionSquareTextures } from './riotMinionAssets'
import {
  createBakedMinionAnimations,
  loadBakedMinionSheets,
  bakedSheetsLoadedCount,
  type BakedAnimRow,
} from './bakedMinionAssets'

type MoveKeys = {
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
}

const LINEUP: MinionPreviewKind[] = [
  'orderMelee',
  'orderRanged',
  'orderSiege',
  'orderSuper',
  'chaosMelee',
  'chaosRanged',
  'chaosSiege',
  'chaosSuper',
]

export class MinionPreviewScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: MoveKeys
  private minions: PreviewMinion[] = []
  private labelTexts: Phaser.GameObjects.Text[] = []
  private bakedPanel?: Phaser.GameObjects.Rectangle
  private playerAnimKey = JINX_ANIMS.idle
  private artMode: MinionPreviewArtMode = 'riot'
  private playerX = WORLD_WIDTH / 2
  private playerY = WORLD_HEIGHT / 2
  private bakedAnimRow: BakedAnimRow = 'idle'

  constructor() {
    super({ key: 'MinionPreviewScene' })
  }

  init(data: { artMode?: MinionPreviewArtMode; bakedAnimRow?: BakedAnimRow }) {
    const fromRegistry = this.registry.get(MINION_PREVIEW_REGISTRY_ART) as
      | MinionPreviewArtMode
      | undefined
    this.artMode =
      data.artMode ?? fromRegistry ?? parseMinionArtMode(window.location.search)
    this.registry.set(MINION_PREVIEW_REGISTRY_ART, this.artMode)
    if (data.bakedAnimRow) {
      this.bakedAnimRow = data.bakedAnimRow
    }
  }

  preload() {
    loadActiveChampionAssets(this)
    loadRiotMinionSquareTextures(this, true)
    loadBakedMinionSheets(this)
  }

  create() {
    if (this.artMode === 'baked') {
      this.cameras.main.setBackgroundColor('#3a3a44')
      this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0x3a3a44)
    } else {
      rebakeGrassTextures(this)
      rebakeInspiredMinionTextures(this)
      spawnArenaMeadowGround(this)
    }

    createChampionAnimations(this)
    createBakedMinionAnimations(this)

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    const cx = WORLD_WIDTH / 2
    const cy = WORLD_HEIGHT / 2

    if (this.artMode === 'baked') {
      this.spawnBakedGallery(cx, cy - 60)
      this.playerX = cx
      this.playerY = cy + 320
    } else {
      this.playerX = cx
      this.playerY = cy
    }

    this.player = createChampionPlayerSprite(this, this.playerX, this.playerY)
    this.player.setDepth(this.player.y)

    if (this.artMode !== 'baked') {
      this.rebuildMinions(cx, cy)
    }

    this.setupCamera()
    this.setupInput()
  }

  getArtMode(): MinionPreviewArtMode {
    return this.artMode
  }

  getBakedAnimRow(): BakedAnimRow {
    return this.bakedAnimRow
  }

  setArtMode(mode: MinionPreviewArtMode) {
    if (mode === this.artMode) {
      return
    }
    this.playerX = this.player.x
    this.playerY = this.player.y
    this.scene.restart({ artMode: mode, bakedAnimRow: this.bakedAnimRow })
  }

  setBakedAnimRow(row: BakedAnimRow) {
    this.bakedAnimRow = row
    for (const m of this.minions) {
      playPreviewMinionBakedAnim(m, row)
    }
  }

  getBakedSheetCount(): number {
    return bakedSheetsLoadedCount(this)
  }

  private clearMinions() {
    for (const m of this.minions) {
      m.visual.destroy()
    }
    for (const t of this.labelTexts) {
      t.destroy()
    }
    this.labelTexts = []
    this.bakedPanel?.destroy()
    this.bakedPanel = undefined
    this.minions = []
  }

  private rebuildMinions(cx: number, cy: number) {
    this.clearMinions()
    this.spawnLineup(cx, cy)
    this.spawnSwarm(cx, cy)
  }

  private spawnBakedGallery(cx: number, cy: number) {
    this.clearMinions()

    const cellW = 220
    const cellH = 200
    const cols = BAKED_GRID_KINDS[0].length
    const rows = BAKED_GRID_KINDS.length
    const gridW = cols * cellW
    const gridH = rows * cellH + 48
    const originX = cx - gridW / 2 + cellW / 2
    const originY = cy - gridH / 2 + cellH / 2 + 24

    this.bakedPanel = this.add.rectangle(cx, cy, gridW + 48, gridH + 40, 0x2c2c36, 0.92)
    this.bakedPanel.setStrokeStyle(2, 0x52525e, 0.9)
    this.bakedPanel.setDepth(0)

    const colTitles = ['Melee', 'Ranged', 'Siege', 'Super']
    colTitles.forEach((title, col) => {
      this.add
        .text(originX + col * cellW, originY - cellH / 2 - 8, title, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          color: '#94a3b8',
        })
        .setOrigin(0.5, 1)
        .setDepth(20)
    })

    BAKED_GRID_KINDS.forEach((rowKinds, row) => {
      const rowTeam = row === 0 ? 'Order (azul)' : 'Chaos (rojo)'
      const rowColor = row === 0 ? '#93c5fd' : '#fca5a5'
      this.add
        .text(originX - cellW / 2 - 8, originY + row * cellH, rowTeam, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '13px',
          color: rowColor,
        })
        .setOrigin(1, 0.5)
        .setDepth(20)

      rowKinds.forEach((kind, col) => {
        const x = originX + col * cellW
        const y = originY + row * cellH
        const info = MINION_PREVIEW_LABELS[kind]
        const teamColor = info.team === 'Order' ? '#93c5fd' : '#fca5a5'

        const minion = spawnPreviewMinion(
          this,
          x,
          y + 12,
          kind,
          0.85,
          'baked',
          this.bakedAnimRow,
        )
        minion.visual.setDepth(y + 1)
        this.minions.push(minion)

        const label = this.add
          .text(x, y - cellH / 2 + 28, `${info.title} · ${info.team}`, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            color: teamColor,
            align: 'center',
          })
          .setOrigin(0.5, 0.5)
          .setDepth(20)
        this.labelTexts.push(label)

        const sub = this.add
          .text(x, y - cellH / 2 + 46, info.role, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: '#cbd5e1',
            align: 'center',
          })
          .setOrigin(0.5, 0.5)
          .setDepth(20)
        this.labelTexts.push(sub)
      })
    })

    this.add
      .text(cx, cy + gridH / 2 + 8, 'WASD / flechas: mover a Jinx (referencia de escala)', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#94a3b8',
      })
      .setOrigin(0.5, 0)
      .setDepth(20)
  }

  private spawnLineup(cx: number, cy: number) {
    const radius = 320
    LINEUP.forEach((kind, i) => {
      const angle = (i / LINEUP.length) * Math.PI * 2 - Math.PI / 2
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius
      const hp = 0.35 + (i % 5) * 0.12
      this.minions.push(spawnPreviewMinion(this, x, y, kind, hp, this.artMode))
    })
  }

  private spawnSwarm(cx: number, cy: number) {
    const kinds: MinionPreviewKind[] = [
      'chaosMelee',
      'chaosMelee',
      'chaosRanged',
      'orderMelee',
      'orderSiege',
      'chaosSuper',
    ]
    kinds.forEach((kind, i) => {
      const x = cx - 140 + (i % 3) * 95 + (i % 2) * 12
      const y = cy + 120 + Math.floor(i / 3) * 70
      this.minions.push(
        spawnPreviewMinion(this, x, y, kind, 0.55 + (i % 4) * 0.1, this.artMode),
      )
    })
  }

  private setupCamera() {
    const cam = this.cameras.main
    cam.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    if (this.artMode === 'baked') {
      cam.stopFollow()
      cam.centerOn(WORLD_WIDTH / 2, WORLD_HEIGHT / 2 - 40)
      cam.setZoom(1)
    } else {
      cam.startFollow(this.player, true, 0.12, 0.12)
      cam.setZoom(1)
    }
  }

  private setupInput() {
    if (!this.input.keyboard) {
      return
    }
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0, 0)

    let vx = 0
    let vy = 0
    if (this.cursors.left?.isDown || this.wasd.left.isDown) vx -= 1
    if (this.cursors.right?.isDown || this.wasd.right.isDown) vx += 1
    if (this.cursors.up?.isDown || this.wasd.up.isDown) vy -= 1
    if (this.cursors.down?.isDown || this.wasd.down.isDown) vy += 1

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy) || 1
      body.setVelocity((vx / len) * PLAYER_SPEED, (vy / len) * PLAYER_SPEED)
      this.playerAnimKey = syncChampionAnimation(this.player, vx, vy, this.playerAnimKey)
    } else if (this.player.anims.currentAnim?.key !== JINX_ANIMS.idle) {
      this.player.play(JINX_ANIMS.idle, true)
      this.playerAnimKey = JINX_ANIMS.idle
    }

    this.player.setDepth(this.player.y)

    for (const m of this.minions) {
      m.visual.setDepth(m.visual.y)
    }

    const pulse = 0.65 + Math.sin(this.time.now / 900) * 0.15
    for (let i = 0; i < this.minions.length; i += 1) {
      syncPreviewMinionHpBar(this.minions[i], pulse - (i % 3) * 0.08)
    }
  }
}
