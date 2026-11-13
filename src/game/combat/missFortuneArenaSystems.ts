import * as Phaser from 'phaser'
import type { ArenaEnemy } from '../enemies/enemyFactory'
import { WORLD_HEIGHT, WORLD_WIDTH } from '../constants'
import type { PlayerCombatStats } from '../playerStats'
import {
  createInitialMissFortuneAbilityLevels,
  effectiveMissFortuneAbilityLevel,
  isMissFortuneAbilityUnlocked,
  resolveMissFortuneEStats,
  resolveMissFortuneQStats,
  resolveMissFortuneRStats,
  resolveMissFortuneWStats,
  type MissFortuneAbilityLevels,
} from './missFortuneAbilityState'
import {
  MF_BASIC_ATTACK,
  resolveMissFortuneAttackIntervalMs,
  resolveMissFortuneBasicAttackRange,
  resolveMissFortuneDirectDamage,
  resolveMissFortuneProjectileSpeed,
} from './missFortuneBasicAttack'
import {
  attachMfStrutBuff,
  createMfBulletVisual,
  createMfMakeItRainZone,
  createMfBulletTimeCone,
  spawnMfBasicAttackCast,
  spawnMfDoubleUpCast,
  spawnMfEHit,
  spawnMfQImpact,
  tickMfBulletTrail,
  updateMfBulletVisual,
  updateMfRBulletVisual,
  type MfBulletVisual,
} from '../vfx/missfortune/missFortuneSpellVisuals'

type Enemy = ArenaEnemy

type Bullet = {
  visual: MfBulletVisual
  x: number
  y: number
  nx: number
  ny: number
  speed: number
  damage: number
  hitRadius: number
  traveled: number
  maxRange: number
  pierceMark?: number
  kind: 'ba' | 'q' | 'r'
  trailMs?: number
}

type RainZone = {
  x: number
  y: number
  radius: number
  remainingMs: number
  tickMs: number
  damage: number
  teardown?: () => void
}

type RChannel = {
  elapsedMs: number
  durationMs: number
  wavesLeft: number
  waveIntervalMs: number
  waveAccum: number
  nx: number
  ny: number
  damage: number
  range: number
  halfAngle: number
  cone: ReturnType<typeof createMfBulletTimeCone>
}

export type MissFortuneArenaHost = {
  scene: Phaser.Scene
  getPlayer: () => Phaser.Physics.Arcade.Sprite | null
  getEnemies: () => Enemy[]
  getCombatStats: () => PlayerCombatStats
  isAbilityReady: (slot: 'q' | 'w' | 'e' | 'r', time: number) => boolean
  startAbilityCooldown: (slot: 'q' | 'w' | 'e' | 'r', time: number, ms: number) => void
  findNearestEnemyIndex: (range?: number) => number
  damageEnemyAt: (index: number, damage: number) => void
  readMoveVector: () => { x: number; y: number }
  getAbilityHotkeys: () =>
    | Record<'q' | 'w' | 'e' | 'r', Phaser.Input.Keyboard.Key>
    | undefined
  applyMoveSpeedMult?: (mult: number, durationMs: number) => void
  applyAttackSpeedMult?: (mult: number, durationMs: number) => void
  playSpellCastAnimation?: (slot: 'q' | 'w' | 'e' | 'r', nx: number, ny: number) => void
}

export class MissFortuneArenaSystems {
  abilities: MissFortuneAbilityLevels = createInitialMissFortuneAbilityLevels()

  private bullets: Bullet[] = []

  private rains: RainZone[] = []

  private rChannel: RChannel | null = null

  private nextShotAt = 0

  private wBuffEnd = 0

  private host: MissFortuneArenaHost

  constructor(host: MissFortuneArenaHost) {
    this.host = host
  }

  reset(time: number) {
    this.abilities = createInitialMissFortuneAbilityLevels()
    this.clearAll()
    this.nextShotAt = time + 300
    this.wBuffEnd = 0
  }

  clearAll() {
    for (const b of this.bullets) b.visual.root.destroy()
    this.bullets = []
    for (const z of this.rains) z.teardown?.()
    this.rains = []
    this.rChannel?.cone.destroy()
    this.rChannel = null
  }

  getAbilities() {
    return this.abilities
  }

  setAbilities(levels: MissFortuneAbilityLevels) {
    this.abilities = levels
  }

  isChannelingR() {
    return this.rChannel !== null
  }

  isMovementLocked() {
    return this.rChannel !== null
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

  private aim() {
    const move = this.host.readMoveVector()
    let nx = move.x
    let ny = move.y
    if (Math.hypot(nx, ny) < 0.12) {
      const idx = this.host.findNearestEnemyIndex(560)
      if (idx >= 0) {
        const p = this.host.getPlayer()
        const e = this.host.getEnemies()[idx]
        if (p) {
          const dx = e.visual.x - p.x
          const dy = e.visual.y - p.y
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

  private fireBullet(
    x: number,
    y: number,
    nx: number,
    ny: number,
    damage: number,
    speed: number,
    range: number,
    kind: Bullet['kind'],
    heavy = false,
  ) {
    const angle = Math.atan2(ny, nx)
    const mx = x + nx * 18
    const my = y + ny * 18
    if (kind === 'q') {
      spawnMfDoubleUpCast(this.host.scene, x + nx * 14, y + ny * 14, angle, y + 2)
    } else if (kind === 'ba') {
      spawnMfBasicAttackCast(this.host.scene, x + nx * 14, y + ny * 14, angle, y + 2)
    }
    const vis = createMfBulletVisual(this.host.scene, mx, my, angle, y + 2, heavy, kind)
    this.bullets.push({
      visual: vis,
      x: x + nx * 18,
      y: y + ny * 18,
      nx,
      ny,
      speed,
      damage,
      hitRadius: kind === 'ba' ? MF_BASIC_ATTACK.hitRadius : 16,
      traveled: 0,
      maxRange: range,
      kind,
      trailMs: kind === 'ba' ? 0 : undefined,
    })
  }

  autoAttack(time: number) {
    if (time < this.nextShotAt || this.rChannel) return
    const player = this.host.getPlayer()
    if (!player) return
    const stats = this.host.getCombatStats()
    const range = resolveMissFortuneBasicAttackRange(stats)
    const idx = this.host.findNearestEnemyIndex(range)
    if (idx < 0) return
    const target = this.host.getEnemies()[idx]
    const dx = target.visual.x - player.x
    const dy = target.visual.y - player.y
    const d = Math.hypot(dx, dy) || 1
    const nx = dx / d
    const ny = dy / d
    const interval = resolveMissFortuneAttackIntervalMs(stats)
    const wMult = time < this.wBuffEnd ? 0.82 : 1
    this.fireBullet(
      player.x,
      player.y,
      nx,
      ny,
      resolveMissFortuneDirectDamage(stats),
      resolveMissFortuneProjectileSpeed(stats),
      range,
      'ba',
    )
    this.nextShotAt = time + interval * wMult
  }

  update(_time: number, delta: number) {
    this.updateBullets(delta)
    this.updateRain(delta)
    this.updateRChannel(delta)
  }

  private updateBullets(delta: number) {
    for (let i = this.bullets.length - 1; i >= 0; i -= 1) {
      const b = this.bullets[i]
      const step = (b.speed * delta) / 1000
      b.x += b.nx * step
      b.y += b.ny * step
      b.traveled += step
      if (b.kind === 'r') {
        updateMfRBulletVisual(b.visual, b.x, b.y, b.nx, b.ny)
      } else {
        updateMfBulletVisual(b.visual, b.x, b.y, b.nx, b.ny)
        if (b.kind === 'ba') {
          b.trailMs = (b.trailMs ?? 0) + delta
          if (b.trailMs >= 48) {
            b.trailMs = 0
            tickMfBulletTrail(
              this.host.scene,
              b.x - b.nx * 8,
              b.y - b.ny * 8,
              Math.atan2(b.ny, b.nx),
              b.y,
            )
          }
        }
      }
      if (b.traveled >= b.maxRange) {
        b.visual.root.destroy()
        this.bullets.splice(i, 1)
        continue
      }
      const enemies = this.host.getEnemies()
      for (let j = 0; j < enemies.length; j += 1) {
        if (b.pierceMark === j) continue
        const e = enemies[j]
        const dx = e.visual.x - b.x
        const dy = e.visual.y - b.y
        if (dx * dx + dy * dy <= (b.hitRadius + e.radius) ** 2) {
          this.host.damageEnemyAt(j, b.damage)
          if (b.kind === 'q') {
            spawnMfQImpact(
              this.host.scene,
              e.visual.x,
              e.visual.y,
              e.visual.y,
              b.pierceMark !== undefined,
            )
          }
          if (b.kind === 'q' && b.pierceMark === undefined) {
            const bounce = this.findBounceTarget(j, b.x, b.y, resolveMissFortuneQStats(
              effectiveMissFortuneAbilityLevel(this.abilities.q),
            )?.bounceRange ?? 400)
            if (bounce >= 0) {
              const t = enemies[bounce]
              const dx2 = t.visual.x - b.x
              const dy2 = t.visual.y - b.y
              const d2 = Math.hypot(dx2, dy2) || 1
              b.nx = dx2 / d2
              b.ny = dy2 / d2
              b.pierceMark = j
              b.traveled = 0
              b.maxRange = 380
              b.damage *= 1.1
              continue
            }
          }
          b.visual.root.destroy()
          this.bullets.splice(i, 1)
          break
        }
      }
    }
  }

  private findBounceTarget(fromIndex: number, x: number, y: number, range: number) {
    let best = -1
    let bestD = range * range
    const enemies = this.host.getEnemies()
    for (let j = 0; j < enemies.length; j += 1) {
      if (j === fromIndex) continue
      const dx = enemies[j].visual.x - x
      const dy = enemies[j].visual.y - y
      const d2 = dx * dx + dy * dy
      if (d2 < bestD) {
        bestD = d2
        best = j
      }
    }
    return best
  }

  private updateRain(delta: number) {
    for (let i = this.rains.length - 1; i >= 0; i -= 1) {
      const z = this.rains[i]
      z.remainingMs -= delta
      z.tickMs -= delta
      if (z.tickMs <= 0) {
        z.tickMs = 320
        const enemies = this.host.getEnemies()
        for (let j = 0; j < enemies.length; j += 1) {
          const e = enemies[j]
          const dx = e.visual.x - z.x
          const dy = e.visual.y - z.y
          if (dx * dx + dy * dy <= (z.radius + e.radius) ** 2) {
            this.host.damageEnemyAt(j, z.damage * 0.35)
            spawnMfEHit(this.host.scene, e.visual.x, e.visual.y, e.visual.y)
          }
        }
      }
      if (z.remainingMs <= 0) {
        z.teardown?.()
        this.rains.splice(i, 1)
      }
    }
  }

  private updateRChannel(delta: number) {
    const ch = this.rChannel
    if (!ch) return
    ch.elapsedMs += delta
    ch.waveAccum += delta
    const player = this.host.getPlayer()
    if (!player) {
      ch.cone.destroy()
      this.rChannel = null
      return
    }
    ch.cone.sync(player.x, player.y, ch.nx, ch.ny)
    while (ch.waveAccum >= ch.waveIntervalMs && ch.wavesLeft > 0) {
      ch.waveAccum -= ch.waveIntervalMs
      ch.wavesLeft -= 1
      const base = Math.atan2(ch.ny, ch.nx)
      const bulletsPerWave = 11
      for (let row = 0; row < 2; row += 1) {
        const origin = 16 + row * 10
        for (let i = 0; i < bulletsPerWave; i += 1) {
          const t = bulletsPerWave <= 1 ? 0 : (i / (bulletsPerWave - 1)) * 2 - 1
          const a = base + t * ch.halfAngle * 0.98
          const falloff = 1 - Math.abs(t) * 0.08
          this.fireBullet(
            player.x + ch.nx * origin,
            player.y + ch.ny * origin,
            Math.cos(a),
            Math.sin(a),
            ch.damage * falloff,
            1050 + Math.random() * 120,
            ch.range,
            'r',
            true,
          )
        }
      }
    }
    if (ch.elapsedMs >= ch.durationMs || ch.wavesLeft <= 0) {
      ch.cone.destroy()
      this.rChannel = null
    }
  }

  private tryCastQ(time: number) {
    if (!isMissFortuneAbilityUnlocked(this.abilities.q)) return
    const stats = resolveMissFortuneQStats(effectiveMissFortuneAbilityLevel(this.abilities.q))
    if (!stats || !this.host.isAbilityReady('q', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const idx = this.host.findNearestEnemyIndex(stats.range)
    if (idx < 0) return
    const target = this.host.getEnemies()[idx]
    const dx = target.visual.x - player.x
    const dy = target.visual.y - player.y
    const d = Math.hypot(dx, dy) || 1
    const nx = dx / d
    const ny = dy / d
    this.host.playSpellCastAnimation?.('q', nx, ny)
    this.fireBullet(player.x, player.y, nx, ny, stats.damage, stats.speed, stats.range, 'q')
    this.host.startAbilityCooldown('q', time, stats.cooldownMs)
  }

  private tryCastW(time: number) {
    if (!isMissFortuneAbilityUnlocked(this.abilities.w)) return
    const stats = resolveMissFortuneWStats(effectiveMissFortuneAbilityLevel(this.abilities.w))
    if (!stats || !this.host.isAbilityReady('w', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.aim()
    this.host.playSpellCastAnimation?.('w', nx, ny)
    attachMfStrutBuff(this.host.scene, player, stats.durationMs)
    this.wBuffEnd = time + stats.durationMs
    this.host.applyMoveSpeedMult?.(stats.moveMult, stats.durationMs)
    this.host.applyAttackSpeedMult?.(stats.attackSpeedMult, stats.durationMs)
    this.host.startAbilityCooldown('w', time, stats.cooldownMs)
  }

  private tryCastE(time: number) {
    if (!isMissFortuneAbilityUnlocked(this.abilities.e)) return
    const stats = resolveMissFortuneEStats(effectiveMissFortuneAbilityLevel(this.abilities.e))
    if (!stats || !this.host.isAbilityReady('e', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.aim()
    const dist = Math.min(stats.range, 280)
    const ex = Phaser.Math.Clamp(player.x + nx * dist, 40, WORLD_WIDTH - 40)
    const ey = Phaser.Math.Clamp(player.y + ny * dist, 40, WORLD_HEIGHT - 40)
    this.host.playSpellCastAnimation?.('e', nx, ny)
    const rainFx = createMfMakeItRainZone(
      this.host.scene,
      ex,
      ey,
      ey,
      stats.radius,
      stats.durationMs,
    )
    this.rains.push({
      x: ex,
      y: ey,
      radius: stats.radius,
      remainingMs: stats.durationMs,
      tickMs: 0,
      damage: stats.damage,
      teardown: () => rainFx.destroy(),
    })
    const enemies = this.host.getEnemies()
    for (let j = 0; j < enemies.length; j += 1) {
      const e = enemies[j]
      const dx = e.visual.x - ex
      const dy = e.visual.y - ey
      if (dx * dx + dy * dy <= (stats.radius + e.radius) ** 2) {
        this.host.damageEnemyAt(j, stats.damage)
        spawnMfEHit(this.host.scene, e.visual.x, e.visual.y, e.visual.y)
      }
    }
    this.host.startAbilityCooldown('e', time, stats.cooldownMs)
  }

  private tryCastR(time: number) {
    if (!isMissFortuneAbilityUnlocked(this.abilities.r)) return
    const stats = resolveMissFortuneRStats(effectiveMissFortuneAbilityLevel(this.abilities.r))
    if (!stats || !this.host.isAbilityReady('r', time)) return
    if (this.rChannel) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.aim()
    this.host.playSpellCastAnimation?.('r', nx, ny)
    const cone = createMfBulletTimeCone(
      this.host.scene,
      player.x,
      player.y,
      nx,
      ny,
      stats.coneRange,
      stats.coneHalfAngle,
      player.y,
    )
    this.rChannel = {
      elapsedMs: 0,
      durationMs: stats.channelMs,
      wavesLeft: stats.waves,
      waveIntervalMs: stats.waveIntervalMs,
      waveAccum: 0,
      nx,
      ny,
      damage: stats.damagePerWave,
      range: stats.coneRange,
      halfAngle: stats.coneHalfAngle,
      cone,
    }
    this.host.startAbilityCooldown('r', time, stats.cooldownMs)
  }
}
