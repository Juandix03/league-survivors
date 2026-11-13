import * as Phaser from 'phaser'
import type { ArenaEnemy } from '../enemies/enemyFactory'
import { PLAYER_RADIUS, WORLD_HEIGHT, WORLD_WIDTH } from '../constants'
import { BASE_PROJECTILE_DAMAGE, type PlayerCombatStats } from '../playerStats'
import {
  createInitialYasuoAbilityLevels,
  effectiveYasuoAbilityLevel,
  isYasuoAbilityUnlocked,
  resolveYasuoEStats,
  resolveYasuoQStats,
  resolveYasuoQSwingTiming,
  resolveYasuoRStats,
  resolveYasuoWStats,
  type YasuoAbilityLevels,
} from './yasuoAbilityState'
import {
  YASUO_BASIC_ATTACK,
  resolveYasuoAttackIntervalMs,
  resolveYasuoBasicAttackRange,
  resolveYasuoDirectDamage,
} from './yasuoBasicAttack'
import {
  createYasuoMeleeSwing,
  yasuoMeleeSwingTotalMs,
  type YasuoMeleeSwing,
} from './yasuoMeleeSwing'
import {
  createYasuoWindWallVisual,
  spawnYasuoWindWallCast,
  spawnYasuoBasicImpactVisual,
  spawnYasuoEDashBurst,
  spawnYasuoEDashTrail,
  spawnYasuoLastBreathVisual,
  spawnYasuoMeleeWindup,
  spawnYasuoSteelTempestSlash,
  spawnYasuoSteelTempestThrust,
} from '../vfx/yasuo/yasuoSpellVisuals'

type Enemy = ArenaEnemy

type YasuoWall = {
  visual: Phaser.GameObjects.Container
  remainingMs: number
  x: number
  y: number
  nx: number
  ny: number
  halfLength: number
  halfThickness: number
}

type YasuoEDash = {
  startX: number
  startY: number
  endX: number
  endY: number
  nx: number
  ny: number
  elapsedMs: number
  durationMs: number
  damage: number
  targetIndex: number
  trailAccumMs: number
}

export type YasuoArenaHost = {
  scene: Phaser.Scene
  getPlayer: () => Phaser.Physics.Arcade.Sprite | null
  getEnemies: () => Enemy[]
  getCombatStats: () => PlayerCombatStats
  getElapsedMs: (time: number) => number
  isAbilityReady: (slot: 'q' | 'w' | 'e' | 'r', time: number) => boolean
  startAbilityCooldown: (slot: 'q' | 'w' | 'e' | 'r', time: number, ms: number) => void
  findNearestEnemyIndex: (range?: number) => number
  damageEnemyAt: (index: number, damage: number) => void
  readMoveVector: () => { x: number; y: number }
  getAbilityHotkeys: () =>
    | Record<'q' | 'w' | 'e' | 'r', Phaser.Input.Keyboard.Key>
    | undefined
  playBasicAttackAnimation: (nx: number, ny: number) => void
  playSteelTempestAnimation: (nx: number, ny: number) => void
}

export class YasuoArenaSystems {
  abilities: YasuoAbilityLevels = createInitialYasuoAbilityLevels()

  private walls: YasuoWall[] = []

  private meleeSwing: YasuoMeleeSwing | null = null

  private eDash: YasuoEDash | null = null

  private nextShotAt = 0

  private host: YasuoArenaHost

  constructor(host: YasuoArenaHost) {
    this.host = host
  }

  reset(time: number) {
    this.abilities = createInitialYasuoAbilityLevels()
    this.clearAll()
    this.nextShotAt = time + 400
  }

  clearAll() {
    for (const w of this.walls) w.visual.destroy()
    this.walls = []
    this.meleeSwing = null
    this.eDash = null
  }

  getAbilities() {
    return this.abilities
  }

  setAbilities(levels: YasuoAbilityLevels) {
    this.abilities = levels
  }

  handleHotkeys(time: number) {
    const scene = this.host.scene as Phaser.Scene & {
      upgradePause?: boolean
      gameOver?: boolean
    }
    if (scene.upgradePause || scene.gameOver) return
    const keys = this.host.getAbilityHotkeys()
    if (!keys) return
    if (Phaser.Input.Keyboard.JustDown(keys.q)) this.tryCastQ(time)
    if (Phaser.Input.Keyboard.JustDown(keys.w)) this.tryCastW(time)
    if (Phaser.Input.Keyboard.JustDown(keys.e)) this.tryCastE(time)
    if (Phaser.Input.Keyboard.JustDown(keys.r)) this.tryCastR(time)
  }

  autoAttack(time: number) {
    if (time < this.nextShotAt || this.eDash || this.meleeSwing) return
    const player = this.host.getPlayer()
    if (!player) return
    const stats = this.host.getCombatStats()
    const range = resolveYasuoBasicAttackRange(stats)
    const idx = this.host.findNearestEnemyIndex(range)
    if (idx < 0) return

    const target = this.host.getEnemies()[idx]
    const dx = target.visual.x - player.x
    const dy = target.visual.y - player.y
    const dist = Math.hypot(dx, dy) || 1
    if (!this.beginBasicMelee(player.x, player.y, dx / dist, dy / dist)) return
    this.nextShotAt = time + resolveYasuoAttackIntervalMs(stats)
  }

  update(_time: number, delta: number) {
    this.updateMeleeSwing(delta)
    this.updateWalls(delta)
    this.updateEDash(delta)
  }

  isDashing() {
    return this.eDash !== null
  }

  isMeleeAttacking() {
    return this.meleeSwing !== null
  }

  /** Solo el dash E bloquea movimiento (los cortes no teletransportan al jugador). */
  isMovementLocked() {
    return this.eDash !== null
  }

  /** Dirección del dash E (animación mientras `isDashing()`). */
  getDashFacing(): { nx: number; ny: number } | null {
    if (!this.eDash) return null
    return { nx: this.eDash.nx, ny: this.eDash.ny }
  }

  getMeleeFacing(): { nx: number; ny: number } | null {
    if (!this.meleeSwing) return null
    return { nx: this.meleeSwing.nx, ny: this.meleeSwing.ny }
  }

  /** Muro de viento (W) — bloquea proyectiles enemigos en la franja. */
  blocksProjectileAt(x: number, y: number): boolean {
    for (const w of this.walls) {
      const dx = x - w.x
      const dy = y - w.y
      const tangentX = -w.ny
      const tangentY = w.nx
      const along = dx * tangentX + dy * tangentY
      const perp = dx * w.nx + dy * w.ny
      if (Math.abs(along) <= w.halfLength && Math.abs(perp) <= w.halfThickness) {
        return true
      }
    }
    return false
  }

  private beginBasicMelee(px: number, py: number, nx: number, ny: number): boolean {
    if (this.meleeSwing || this.eDash) return false
    const ba = YASUO_BASIC_ATTACK
    this.meleeSwing = createYasuoMeleeSwing(
      'basic',
      px,
      py,
      nx,
      ny,
      ba.lungePx,
      ba.windupMs,
      ba.lungeMs,
      ba.recoverMs,
    )
    this.host.playBasicAttackAnimation(nx, ny)
    spawnYasuoMeleeWindup(
      this.host.scene,
      px,
      py,
      Math.atan2(ny, nx),
      py + 2,
    )
    return true
  }

  private beginQMelee(px: number, py: number, nx: number, ny: number, qLevel: number): boolean {
    if (this.meleeSwing || this.eDash) return false
    const timing = resolveYasuoQSwingTiming(qLevel)
    this.meleeSwing = createYasuoMeleeSwing(
      'q',
      px,
      py,
      nx,
      ny,
      timing.lungePx,
      timing.windupMs,
      timing.lungeMs,
      timing.recoverMs,
    )
    this.host.playSteelTempestAnimation(nx, ny)
    return true
  }

  private updateMeleeSwing(delta: number) {
    const swing = this.meleeSwing
    if (!swing) return
    const player = this.host.getPlayer()
    if (!player) {
      this.meleeSwing = null
      return
    }

    swing.elapsedMs += delta
    const total = yasuoMeleeSwingTotalMs(swing)

    if (!swing.hitApplied && swing.elapsedMs >= swing.strikeAtMs) {
      swing.hitApplied = true
      this.applyMeleeStrike(swing, player.x, player.y)
    }

    if (swing.elapsedMs >= total) {
      this.meleeSwing = null
    }
  }

  private applyMeleeStrike(swing: YasuoMeleeSwing, px: number, py: number) {
    const angle = Math.atan2(swing.ny, swing.nx)
    const depth = py + 2
    const dmgScale = this.host.getCombatStats().projectileDamage / BASE_PROJECTILE_DAMAGE

    if (swing.kind === 'basic') {
      const ba = YASUO_BASIC_ATTACK
      spawnYasuoSteelTempestSlash(
        this.host.scene,
        px,
        py,
        angle,
        depth,
        ba.slashRange,
        0.82,
      )
      const damage = resolveYasuoDirectDamage(this.host.getCombatStats())
      const hits = this.enemiesInSteelTempest(
        px,
        py,
        swing.nx,
        swing.ny,
        ba.slashOrigin,
        ba.slashRange,
        ba.slashWidth / 2,
      )
      for (const j of hits) {
        const e = this.host.getEnemies()[j]
        spawnYasuoBasicImpactVisual(this.host.scene, e.visual.x, e.visual.y, e.visual.y)
        this.host.damageEnemyAt(j, damage)
      }
      return
    }

    const qLevel = effectiveYasuoAbilityLevel(this.abilities.q)
    const stats = resolveYasuoQStats(qLevel)
    if (!stats) return
    spawnYasuoSteelTempestThrust(
      this.host.scene,
      px,
      py,
      angle,
      depth,
      stats.rangeOrigin,
      stats.range,
    )
    const damage = stats.damage * dmgScale
    const hits = this.enemiesInSteelTempest(
      px,
      py,
      swing.nx,
      swing.ny,
      stats.rangeOrigin,
      stats.range,
      stats.width / 2,
    )
    for (const j of hits) {
      const e = this.host.getEnemies()[j]
      spawnYasuoBasicImpactVisual(this.host.scene, e.visual.x, e.visual.y, e.visual.y)
      this.host.damageEnemyAt(j, damage)
    }
  }

  private resolveAim(): { nx: number; ny: number } {
    const player = this.host.getPlayer()
    if (!player) return { nx: 1, ny: 0 }
    const pointer = this.host.scene.input.activePointer
    const world = this.host.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
    let dx = world.x - player.x
    let dy = world.y - player.y
    if (Math.abs(dx) + Math.abs(dy) > 12) {
      const l = Math.hypot(dx, dy) || 1
      return { nx: dx / l, ny: dy / l }
    }
    const move = this.host.readMoveVector()
    if (Math.abs(move.x) + Math.abs(move.y) > 1) {
      const l = Math.hypot(move.x, move.y) || 1
      return { nx: move.x / l, ny: move.y / l }
    }
    const idx = this.host.findNearestEnemyIndex(500)
    if (idx >= 0) {
      const t = this.host.getEnemies()[idx]
      dx = t.visual.x - player.x
      dy = t.visual.y - player.y
      const l = Math.hypot(dx, dy) || 1
      return { nx: dx / l, ny: dy / l }
    }
    return { nx: 1, ny: 0 }
  }

  /** Enemigos dentro del rectángulo del espadazo (hacia `nx, ny`). */
  private enemiesInSteelTempest(
    px: number,
    py: number,
    nx: number,
    ny: number,
    rangeOrigin: number,
    range: number,
    halfWidth: number,
  ): number[] {
    const hits: number[] = []
    const rangeEnd = rangeOrigin + range
    const enemies = this.host.getEnemies()
    for (let j = 0; j < enemies.length; j += 1) {
      const e = enemies[j]
      const dx = e.visual.x - px
      const dy = e.visual.y - py
      const along = dx * nx + dy * ny
      if (along < rangeOrigin - e.radius || along > rangeEnd + e.radius) continue
      const perp = Math.abs(-dy * nx + dx * ny)
      if (perp <= halfWidth + e.radius) {
        hits.push(j)
      }
    }
    return hits
  }

  private tryCastQ(time: number) {
    if (!isYasuoAbilityUnlocked(this.abilities.q)) return
    if (this.eDash || this.meleeSwing) return
    const qLevel = effectiveYasuoAbilityLevel(this.abilities.q)
    const stats = resolveYasuoQStats(qLevel)
    if (!stats || !this.host.isAbilityReady('q', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.resolveAim()
    if (!this.beginQMelee(player.x, player.y, nx, ny, qLevel)) return
    this.host.startAbilityCooldown('q', time, stats.cooldownMs)
  }

  private tryCastW(time: number) {
    if (!isYasuoAbilityUnlocked(this.abilities.w)) return
    const stats = resolveYasuoWStats(effectiveYasuoAbilityLevel(this.abilities.w))
    if (!stats || !this.host.isAbilityReady('w', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.resolveAim()
    const angle = Math.atan2(ny, nx)
    const px = player.x + nx * 44
    const py = player.y + ny * 44
    const wallAngle = angle + Math.PI / 2
    spawnYasuoWindWallCast(this.host.scene, player.x, player.y, angle, player.y + 2)
    const vis = createYasuoWindWallVisual(
      this.host.scene,
      px,
      py,
      wallAngle,
      py + 1,
      stats.length,
      stats.thickness,
    )
    if (!vis) return
    this.walls.push({
      visual: vis.root,
      remainingMs: stats.durationMs,
      x: px,
      y: py,
      nx: Math.cos(wallAngle),
      ny: Math.sin(wallAngle),
      halfLength: stats.length / 2,
      halfThickness: stats.thickness / 2,
    })
    this.host.startAbilityCooldown('w', time, stats.cooldownMs)
  }

  private updateWalls(delta: number) {
    for (let i = this.walls.length - 1; i >= 0; i -= 1) {
      const w = this.walls[i]
      w.remainingMs -= delta
      if (w.remainingMs <= 0) {
        w.visual.destroy()
        this.walls.splice(i, 1)
      }
    }
  }

  private tryCastE(time: number) {
    if (!isYasuoAbilityUnlocked(this.abilities.e)) return
    if (this.eDash || this.meleeSwing) return
    const stats = resolveYasuoEStats(effectiveYasuoAbilityLevel(this.abilities.e))
    if (!stats || !this.host.isAbilityReady('e', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const idx = this.host.findNearestEnemyIndex(stats.range)
    if (idx < 0) return
    const target = this.host.getEnemies()[idx]
    const dx = target.visual.x - player.x
    const dy = target.visual.y - player.y
    const dist = Math.hypot(dx, dy) || 1
    const nx = dx / dist
    const ny = dy / dist
    const endX = Phaser.Math.Clamp(target.visual.x, PLAYER_RADIUS, WORLD_WIDTH - PLAYER_RADIUS)
    const endY = Phaser.Math.Clamp(target.visual.y, PLAYER_RADIUS, WORLD_HEIGHT - PLAYER_RADIUS)
    spawnYasuoEDashBurst(this.host.scene, player.x, player.y, Math.atan2(ny, nx), player.y + 2)
    const dmgScale = this.host.getCombatStats().projectileDamage / BASE_PROJECTILE_DAMAGE
    this.eDash = {
      startX: player.x,
      startY: player.y,
      endX,
      endY,
      nx,
      ny,
      elapsedMs: 0,
      durationMs: stats.dashDurationMs,
      damage: stats.damage * dmgScale,
      targetIndex: idx,
      trailAccumMs: 0,
    }
    this.host.startAbilityCooldown('e', time, stats.cooldownMs)
  }

  private updateEDash(delta: number) {
    const dash = this.eDash
    if (!dash) return
    const player = this.host.getPlayer()
    if (!player) {
      this.eDash = null
      return
    }
    dash.elapsedMs += delta
    dash.trailAccumMs += delta
    if (dash.trailAccumMs >= 48) {
      dash.trailAccumMs = 0
      spawnYasuoEDashTrail(
        this.host.scene,
        player.x,
        player.y,
        Math.atan2(dash.ny, dash.nx),
        player.y + 1,
      )
    }
    const t = Math.min(1, dash.elapsedMs / dash.durationMs)
    const eased = Phaser.Math.Easing.Cubic.Out(t)
    player.setPosition(
      Phaser.Math.Linear(dash.startX, dash.endX, eased),
      Phaser.Math.Linear(dash.startY, dash.endY, eased),
    )
    player.setDepth(player.y)
    if (t >= 1) {
      if (dash.targetIndex < this.host.getEnemies().length) {
        this.host.damageEnemyAt(dash.targetIndex, dash.damage)
        const e = this.host.getEnemies()[dash.targetIndex]
        spawnYasuoBasicImpactVisual(this.host.scene, e.visual.x, e.visual.y, e.visual.y)
      }
      this.eDash = null
    }
  }

  private tryCastR(time: number) {
    if (!isYasuoAbilityUnlocked(this.abilities.r)) return
    const stats = resolveYasuoRStats(effectiveYasuoAbilityLevel(this.abilities.r))
    if (!stats || !this.host.isAbilityReady('r', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const dmgScale = this.host.getCombatStats().projectileDamage / BASE_PROJECTILE_DAMAGE
    const damage = stats.damage * dmgScale
    let hitAny = false
    for (let j = this.host.getEnemies().length - 1; j >= 0; j -= 1) {
      const e = this.host.getEnemies()[j]
      const dx = e.visual.x - player.x
      const dy = e.visual.y - player.y
      if (dx * dx + dy * dy <= (stats.radius + e.radius) ** 2) {
        this.host.damageEnemyAt(j, damage)
        hitAny = true
      }
    }
    if (!hitAny) return
    spawnYasuoLastBreathVisual(this.host.scene, player.x, player.y, player.y)
    this.host.startAbilityCooldown('r', time, stats.cooldownMs)
  }
}
