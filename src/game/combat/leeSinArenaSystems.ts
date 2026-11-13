import * as Phaser from 'phaser'
import type { ArenaEnemy } from '../enemies/enemyFactory'
import { PLAYER_RADIUS, WORLD_HEIGHT, WORLD_WIDTH } from '../constants'
import type { PlayerCombatStats } from '../playerStats'
import {
  createInitialLeeSinAbilityLevels,
  effectiveLeeSinAbilityLevel,
  isLeeSinAbilityUnlocked,
  resolveLeeSinEStats,
  resolveLeeSinQStats,
  resolveLeeSinRStats,
  resolveLeeSinWStats,
  type LeeSinAbilityLevels,
} from './leeSinAbilityState'
import {
  LEESIN_BASIC_ATTACK,
  resolveLeeSinAttackIntervalMs,
  resolveLeeSinBasicAttackRange,
  resolveLeeSinDirectDamage,
} from './leeSinBasicAttack'
import type { LeeSinSpellSlot } from '../champions/leeSinSpellAnim'
import {
  attachLeeSinQMark,
  createLeeSinQMissileVisual,
  spawnLeeSinBaHit,
  spawnLeeSinECripple,
  spawnLeeSinETempest,
  spawnLeeSinQCastShock,
  spawnLeeSinRKick,
  spawnLeeSinWShield,
  updateLeeSinQMissileVisual,
  type LeeSinQMarkHandle,
  type LeeSinQMissileVisual,
} from '../vfx/leesin/leeSinSpellVisuals'

type Enemy = ArenaEnemy

type QBolt = {
  visual: LeeSinQMissileVisual
  x: number
  y: number
  nx: number
  ny: number
  speed: number
  range: number
  traveled: number
  damage: number
  hitRadius: number
}

type QMark = {
  enemyIndex: number
  remainingMs: number
  markMs: number
  visual: LeeSinQMarkHandle
}

type QDash = {
  startX: number
  startY: number
  endX: number
  endY: number
  elapsedMs: number
  durationMs: number
  damage: number
  targetIndex: number
  nx: number
  ny: number
}

type RDash = {
  startX: number
  startY: number
  endX: number
  endY: number
  elapsedMs: number
  durationMs: number
  targetIndex: number
  nx: number
  ny: number
  stats: NonNullable<ReturnType<typeof resolveLeeSinRStats>>
}

export type LeeSinArenaHost = {
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
  playSpellCastAnimation?: (slot: LeeSinSpellSlot, nx: number, ny: number) => void
  applyEnemySlow?: (enemy: Enemy, time: number, durationMs: number, mult: number) => void
}

export class LeeSinArenaSystems {
  abilities: LeeSinAbilityLevels = createInitialLeeSinAbilityLevels()

  private qBolts: QBolt[] = []

  private qMark: QMark | null = null

  private qDash: QDash | null = null

  private rDash: RDash | null = null

  private eCrippleRemainingMs = 0

  private nextShotAt = 0

  private host: LeeSinArenaHost

  constructor(host: LeeSinArenaHost) {
    this.host = host
  }

  reset(time: number) {
    this.abilities = createInitialLeeSinAbilityLevels()
    this.clearAll()
    this.nextShotAt = time + 400
  }

  clearAll() {
    for (const b of this.qBolts) b.visual.root.destroy()
    this.qBolts = []
    if (this.qMark) {
      this.qMark.visual.destroy()
      this.qMark = null
    }
    this.qDash = null
    this.rDash = null
    this.eCrippleRemainingMs = 0
  }

  getAbilities() {
    return this.abilities
  }

  setAbilities(levels: LeeSinAbilityLevels) {
    this.abilities = levels
  }

  isQRecastReady() {
    return this.qMark !== null && this.qMark.remainingMs > 0
  }

  isECrippleReady() {
    return this.eCrippleRemainingMs > 0
  }

  isMovementLocked() {
    return this.qDash !== null || this.rDash !== null
  }

  handleHotkeys(time: number) {
    const scene = this.host.scene as Phaser.Scene & { upgradePause?: boolean; gameOver?: boolean }
    if (scene.upgradePause || scene.gameOver) return
    const keys = this.host.getAbilityHotkeys()
    if (!keys) return
    if (Phaser.Input.Keyboard.JustDown(keys.q)) this.tryCastQ(time)
    if (Phaser.Input.Keyboard.JustDown(keys.w)) this.tryCastW(time)
    if (Phaser.Input.Keyboard.JustDown(keys.e)) this.tryCastE(time)
    if (Phaser.Input.Keyboard.JustDown(keys.r)) this.tryCastR(time)
  }

  private castAnim(slot: LeeSinSpellSlot, nx: number, ny: number) {
    this.host.playSpellCastAnimation?.(slot, nx, ny)
  }

  private resolveAim() {
    const move = this.host.readMoveVector()
    let nx = move.x
    let ny = move.y
    if (Math.hypot(nx, ny) < 0.15) {
      const idx = this.host.findNearestEnemyIndex(520)
      if (idx >= 0) {
        const player = this.host.getPlayer()
        const e = this.host.getEnemies()[idx]
        if (player) {
          const dx = e.visual.x - player.x
          const dy = e.visual.y - player.y
          const d = Math.hypot(dx, dy) || 1
          nx = dx / d
          ny = dy / d
        }
      } else {
        nx = 1
        ny = 0
      }
    }
    const d = Math.hypot(nx, ny) || 1
    return { nx: nx / d, ny: ny / d }
  }

  autoAttack(time: number) {
    if (time < this.nextShotAt || this.qDash || this.rDash) return
    const player = this.host.getPlayer()
    if (!player) return
    const stats = this.host.getCombatStats()
    const range = resolveLeeSinBasicAttackRange(stats)
    const idx = this.host.findNearestEnemyIndex(range)
    if (idx < 0) return
    const target = this.host.getEnemies()[idx]
    const dx = target.visual.x - player.x
    const dy = target.visual.y - player.y
    const dist = Math.hypot(dx, dy) || 1
    const nx = dx / dist
    const ny = dy / dist
    const lunge = Math.min(LEESIN_BASIC_ATTACK.lungePx, dist - target.radius - PLAYER_RADIUS)
    player.x += nx * lunge
    player.y += ny * lunge
    this.host.damageEnemyAt(idx, resolveLeeSinDirectDamage(stats))
    spawnLeeSinBaHit(this.host.scene, target.visual.x, target.visual.y, target.visual.y)
    this.nextShotAt = time + resolveLeeSinAttackIntervalMs(stats)
  }

  update(time: number, delta: number) {
    this.updateQ(delta)
    this.updateQDash(delta)
    this.updateRDash(time, delta)
    if (this.qMark) {
      this.qMark.remainingMs -= delta
      const e = this.host.getEnemies()[this.qMark.enemyIndex]
      if (!e?.visual.active) {
        this.qMark.visual.destroy()
        this.qMark = null
      } else {
        this.qMark.visual.setPosition(e.visual.x, e.visual.y)
        if (this.qMark.remainingMs <= 0) {
          this.qMark.visual.destroy()
          this.qMark = null
        }
      }
    }
    if (this.eCrippleRemainingMs > 0) {
      this.eCrippleRemainingMs -= delta
      if (this.eCrippleRemainingMs <= 0) this.eCrippleRemainingMs = 0
    }
  }

  private tryCastQ(time: number) {
    if (!isLeeSinAbilityUnlocked(this.abilities.q)) return
    const stats = resolveLeeSinQStats(effectiveLeeSinAbilityLevel(this.abilities.q))
    if (!stats) return

    if (this.qMark && this.qMark.remainingMs > 0) {
      const player = this.host.getPlayer()
      const target = this.host.getEnemies()[this.qMark.enemyIndex]
      if (player && target) {
        const dx = target.visual.x - player.x
        const dy = target.visual.y - player.y
        const d = Math.hypot(dx, dy) || 1
        this.castAnim('q', dx / d, dy / d)
      }
      this.beginQDash(stats)
      return
    }

    if (!this.host.isAbilityReady('q', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.resolveAim()
    const angle = Math.atan2(ny, nx)
    spawnLeeSinQCastShock(this.host.scene, player.x + nx * 28, player.y + ny * 28, angle, player.y + 2)
    this.castAnim('q', nx, ny)
    const vis = createLeeSinQMissileVisual(
      this.host.scene,
      player.x + nx * 36,
      player.y + ny * 36,
      angle,
      player.y + 2,
    )
    this.qBolts.push({
      visual: vis,
      x: player.x + nx * 36,
      y: player.y + ny * 36,
      nx,
      ny,
      speed: stats.speed,
      range: stats.range,
      traveled: 0,
      damage: stats.damage,
      hitRadius: stats.hitRadius,
    })
    this.host.startAbilityCooldown('q', time, stats.cooldownMs)
  }

  private beginQDash(_stats: NonNullable<ReturnType<typeof resolveLeeSinQStats>>) {
    if (!this.qMark) return
    const player = this.host.getPlayer()
    if (!player) return
    const enemies = this.host.getEnemies()
    const target = enemies[this.qMark.enemyIndex]
    if (!target?.visual.active) {
      this.qMark.visual.destroy()
      this.qMark = null
      return
    }
    const dx = target.visual.x - player.x
    const dy = target.visual.y - player.y
    const d = Math.hypot(dx, dy) || 1
    this.qDash = {
      startX: player.x,
      startY: player.y,
      endX: target.visual.x,
      endY: target.visual.y,
      elapsedMs: 0,
      durationMs: _stats.dashMs,
      damage: _stats.damage * 1.15,
      targetIndex: this.qMark.enemyIndex,
      nx: dx / d,
      ny: dy / d,
    }
    this.qMark.visual.destroy()
    this.qMark = null
  }

  private updateQ(delta: number) {
    for (let i = this.qBolts.length - 1; i >= 0; i -= 1) {
      const b = this.qBolts[i]
      const step = (b.speed * delta) / 1000
      b.x += b.nx * step
      b.y += b.ny * step
      b.traveled += step
      updateLeeSinQMissileVisual(
        b.visual,
        b.x,
        b.y,
        Math.atan2(b.ny, b.nx),
        b.y,
        delta,
      )
      if (b.traveled >= b.range) {
        b.visual.root.destroy()
        this.qBolts.splice(i, 1)
        continue
      }
      const enemies = this.host.getEnemies()
      for (let j = 0; j < enemies.length; j += 1) {
        const e = enemies[j]
        const dx = e.visual.x - b.x
        const dy = e.visual.y - b.y
        if (dx * dx + dy * dy <= (b.hitRadius + e.radius) ** 2) {
          this.host.damageEnemyAt(j, b.damage)
          if (this.qMark) this.qMark.visual.destroy()
          const markMs =
            resolveLeeSinQStats(effectiveLeeSinAbilityLevel(this.abilities.q))?.markMs ?? 3000
          const markVis = attachLeeSinQMark(
            this.host.scene,
            e.visual.x,
            e.visual.y,
            e.visual.y,
            markMs,
          )
          this.qMark = {
            enemyIndex: j,
            remainingMs: markMs,
            markMs,
            visual: markVis,
          }
          b.visual.root.destroy()
          this.qBolts.splice(i, 1)
          break
        }
      }
    }

  }

  private updateQDash(delta: number) {
    const dash = this.qDash
    if (!dash) return
    const player = this.host.getPlayer()
    if (!player) {
      this.qDash = null
      return
    }
    dash.elapsedMs += delta
    const t = Phaser.Math.Clamp(dash.elapsedMs / dash.durationMs, 0, 1)
    player.x = Phaser.Math.Linear(dash.startX, dash.endX, t)
    player.y = Phaser.Math.Linear(dash.startY, dash.endY, t)
    player.setDepth(player.y)
    if (t >= 1) {
      this.host.damageEnemyAt(dash.targetIndex, dash.damage)
      const e = this.host.getEnemies()[dash.targetIndex]
      if (e) spawnLeeSinBaHit(this.host.scene, e.visual.x, e.visual.y, e.visual.y)
      this.qDash = null
    }
  }

  private updateRDash(time: number, delta: number) {
    const dash = this.rDash
    if (!dash) return
    const player = this.host.getPlayer()
    if (!player) {
      this.rDash = null
      return
    }
    dash.elapsedMs += delta
    const t = Phaser.Math.Clamp(dash.elapsedMs / dash.durationMs, 0, 1)
    player.x = Phaser.Math.Linear(dash.startX, dash.endX, t)
    player.y = Phaser.Math.Linear(dash.startY, dash.endY, t)
    player.setDepth(player.y)
    if (t >= 1) {
      this.finishRKick(time, dash)
      this.rDash = null
    }
  }

  private finishRKick(time: number, dash: RDash) {
    const stats = dash.stats
    const idx = dash.targetIndex
    const target = this.host.getEnemies()[idx]
    if (!target?.visual.active) return
    const angle = Math.atan2(dash.ny, dash.nx)
    spawnLeeSinRKick(this.host.scene, target.visual.x, target.visual.y, angle, target.visual.y)
    this.host.damageEnemyAt(idx, stats.damage)
    const kb = stats.knockback
    target.visual.x = Phaser.Math.Clamp(target.visual.x + dash.nx * kb, 40, WORLD_WIDTH - 40)
    target.visual.y = Phaser.Math.Clamp(target.visual.y + dash.ny * kb, 40, WORLD_HEIGHT - 40)
    for (let j = 0; j < this.host.getEnemies().length; j += 1) {
      if (j === idx) continue
      const e = this.host.getEnemies()[j]
      const along = (e.visual.x - target.visual.x) * dash.nx + (e.visual.y - target.visual.y) * dash.ny
      const perp = Math.abs(-(e.visual.y - target.visual.y) * dash.nx + (e.visual.x - target.visual.x) * dash.ny)
      if (along > 0 && along < kb && perp < 48 + e.radius) {
        this.host.damageEnemyAt(j, stats.damage * 0.55)
      }
    }
    this.host.startAbilityCooldown('r', time, stats.cooldownMs)
  }

  private tryCastW(time: number) {
    if (!isLeeSinAbilityUnlocked(this.abilities.w)) return
    const stats = resolveLeeSinWStats(effectiveLeeSinAbilityLevel(this.abilities.w))
    if (!stats || !this.host.isAbilityReady('w', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.resolveAim()
    this.castAnim('w', nx, ny)
    spawnLeeSinWShield(this.host.scene, player.x, player.y, player.y + 4, stats.shieldMs)
    this.host.startAbilityCooldown('w', time, stats.cooldownMs)
  }

  private tryCastE(time: number) {
    if (!isLeeSinAbilityUnlocked(this.abilities.e)) return
    const stats = resolveLeeSinEStats(effectiveLeeSinAbilityLevel(this.abilities.e))
    if (!stats) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.resolveAim()
    this.castAnim('e', nx, ny)

    if (this.eCrippleRemainingMs > 0) {
      spawnLeeSinECripple(this.host.scene, player.x, player.y, player.y + 2, stats.radius)
      const enemies = this.host.getEnemies()
      for (let j = 0; j < enemies.length; j += 1) {
        const e = enemies[j]
        const dx = e.visual.x - player.x
        const dy = e.visual.y - player.y
        if (dx * dx + dy * dy <= (stats.radius + e.radius) ** 2) {
          this.host.damageEnemyAt(j, stats.crippleDamage)
          this.host.applyEnemySlow?.(e, time, stats.crippleSlowMs, stats.crippleSlowMult)
        }
      }
      this.eCrippleRemainingMs = 0
      return
    }

    if (!this.host.isAbilityReady('e', time)) return
    spawnLeeSinETempest(this.host.scene, player.x, player.y, player.y + 2, stats.radius)
    const enemies = this.host.getEnemies()
    for (let j = 0; j < enemies.length; j += 1) {
      const e = enemies[j]
      const dx = e.visual.x - player.x
      const dy = e.visual.y - player.y
      if (dx * dx + dy * dy <= (stats.radius + e.radius) ** 2) {
        this.host.damageEnemyAt(j, stats.damage)
      }
    }
    this.eCrippleRemainingMs = stats.crippleWindowMs
    this.host.startAbilityCooldown('e', time, stats.cooldownMs)
  }

  private tryCastR(time: number) {
    if (!isLeeSinAbilityUnlocked(this.abilities.r)) return
    const stats = resolveLeeSinRStats(effectiveLeeSinAbilityLevel(this.abilities.r))
    if (!stats || !this.host.isAbilityReady('r', time)) return
    if (this.rDash) return
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
    this.castAnim('r', nx, ny)
    const dashMs = Math.min(220, Math.max(120, dist * 0.45))
    this.rDash = {
      startX: player.x,
      startY: player.y,
      endX: target.visual.x - nx * (target.radius + PLAYER_RADIUS + 4),
      endY: target.visual.y - ny * (target.radius + PLAYER_RADIUS + 4),
      elapsedMs: 0,
      durationMs: dashMs,
      targetIndex: idx,
      nx,
      ny,
      stats,
    }
  }
}
