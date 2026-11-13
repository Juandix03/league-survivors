import * as Phaser from 'phaser'
import type { ArenaEnemy } from '../enemies/enemyFactory'
import { PLAYER_RADIUS, WORLD_HEIGHT, WORLD_WIDTH } from '../constants'
import type { PlayerCombatStats } from '../playerStats'
import {
  createInitialLuxAbilityLevels,
  effectiveLuxAbilityLevel,
  isLuxAbilityUnlocked,
  resolveLuxEStats,
  resolveLuxQStats,
  LUX_R_BEAM_TRAVEL_MS,
  resolveLuxRStats,
  resolveLuxWStats,
  type LuxAbilityLevels,
} from './luxAbilityState'
import {
  LUX_BASIC_ATTACK,
  resolveLuxAttackIntervalMs,
  resolveLuxBasicAttackRange,
  resolveLuxDirectDamage,
  resolveLuxProjectileSpeed,
} from './luxBasicAttack'
import { luxMuzzlePoint, luxWaveReturnTarget } from './luxMuzzle'
import type { LuxSpellSlot } from '../champions/luxSpellAnim'
import {
  playLuxShieldApplyPulse,
  setLuxPrismaticWavePhase,
  spawnLuxWCastBurst,
} from '../vfx/lux/luxPrismaticWaveVisual'
import {
  createLuxEKugelMissileVisual,
  createLuxSingularityZoneVisual,
  spawnLuxEDetonateBurst,
  spawnLuxEKugelLandPulse,
  spawnLuxEKugelTrail,
  tickLuxEKugelMissileVisual,
  updateLuxSingularityZoneVisual,
  type LuxSingularityZoneVisual,
} from '../vfx/lux/luxEKugelVisual'
import { createLuxFinalSparkVisual, type LuxFinalSparkVisual } from '../vfx/lux/luxFinalSparkVisual'
import {
  createLuxPrismaticShieldOnPlayer,
  createLuxProjectileVisual,
  spawnLuxImpact,
  spawnLuxQCastFlash,
  spawnLuxQTrailSegment,
  spawnLuxWCastFlash,
  spawnLuxWTrailSegment,
  tickLuxPrismaticShield,
  tickLuxQProjectileVisual,
  tickLuxWProjectileVisual,
  type LuxProjectileVisual,
} from '../vfx/lux/luxSpellVisuals'
import type { LuxPrismaticShieldVisual } from '../vfx/lux/luxPrismaticWaveVisual'

type Enemy = ArenaEnemy

type LuxBolt = {
  visual: LuxProjectileVisual
  vx: number
  vy: number
  damage: number
  hitRadius: number
  remainingMs: number
  kind: 'ba' | 'q' | 'w'
  lastTrailAt: number
  /** W atraviesa; cada enemigo solo recibe daño una vez. */
  waveHit?: Set<number>
  wPhase?: 'out' | 'return'
  wTravelPx?: number
  wMaxTravelPx?: number
  wShieldDurationMs?: number
  wAgeMs?: number
}

type LuxZone = {
  zone: LuxSingularityZoneVisual
  x: number
  y: number
  radius: number
  lingerMs: number
  lingerTotalMs: number
  exploded: boolean
  damage: number
}

type LuxEMissile = {
  visual: ReturnType<typeof createLuxEKugelMissileVisual>
  tx: number
  ty: number
  speed: number
  radius: number
  lingerMs: number
  damage: number
  lastTrailAt: number
}

type LuxBarrier = {
  visual: Phaser.GameObjects.Container
  shield: LuxPrismaticShieldVisual
  remainingMs: number
}

type LuxBeam = {
  visual: LuxFinalSparkVisual
  x: number
  y: number
  nx: number
  ny: number
  range: number
  width: number
  damage: number
  chargeMs: number
  initialChargeMs: number
  fireTravelMs: number
  fadeMs: number
  pulseMs: number
  fired: boolean
  damageApplied: boolean
}

export type LuxArenaHost = {
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
  playSpellCastAnimation?: (slot: LuxSpellSlot, nx: number, ny: number) => void
}

export class LuxArenaSystems {
  abilities: LuxAbilityLevels = createInitialLuxAbilityLevels()

  private bolts: LuxBolt[] = []
  private zones: LuxZone[] = []
  private eMissiles: LuxEMissile[] = []
  private barriers: LuxBarrier[] = []
  private beam: LuxBeam | null = null
  private nextShotAt = 0
  private host: LuxArenaHost

  constructor(host: LuxArenaHost) {
    this.host = host
  }

  reset(time: number) {
    this.abilities = createInitialLuxAbilityLevels()
    this.clearAll()
    this.nextShotAt = time + 400
  }

  clearAll() {
    for (const b of this.bolts) b.visual.root.destroy()
    this.bolts = []
    for (const z of this.zones) z.zone.root.destroy()
    this.zones = []
    for (const m of this.eMissiles) m.visual.root.destroy()
    this.eMissiles = []
    for (const w of this.barriers) w.visual.destroy()
    this.barriers = []
    if (this.beam) this.beam.visual.root.destroy()
    this.beam = null
  }

  getAbilities() {
    return this.abilities
  }

  setAbilities(levels: LuxAbilityLevels) {
    this.abilities = levels
  }

  isMovementLocked() {
    return false
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

  autoAttack(time: number) {
    if (time < this.nextShotAt) return
    const player = this.host.getPlayer()
    if (!player) return
    const stats = this.host.getCombatStats()
    const range = resolveLuxBasicAttackRange(stats)
    const idx = this.host.findNearestEnemyIndex(range)
    if (idx < 0) return
    const { nx, ny } = this.resolveAim()
    this.fireBolt(player.x, player.y, nx, ny, resolveLuxDirectDamage(stats), 'ba', player.y + 2)
    this.nextShotAt = time + resolveLuxAttackIntervalMs(stats)
  }

  /** E posada en el suelo — recast con 3 / E para detonar. */
  isLuxEDetonateReady() {
    return this.getActiveE() !== null
  }

  update(time: number, delta: number) {
    this.updateBolts(time, delta)
    this.updateEMissiles(time, delta)
    this.updateZones(delta)
    this.updateBarriers(delta)
    this.updateBeam(delta)
  }

  private getActiveE(): LuxZone | null {
    for (const z of this.zones) {
      if (!z.exploded) return z
    }
    return null
  }

  private resolveEAimPoint(stats: { range: number }) {
    const player = this.host.getPlayer()
    if (!player) return null
    const pointer = this.host.scene.input.activePointer
    const world = this.host.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
    let dx = world.x - player.x
    let dy = world.y - player.y
    let dist = Math.hypot(dx, dy)
    const maxR = stats.range
    const minR = PLAYER_RADIUS + 28

    if (dist < 1) {
      const { nx, ny } = this.resolveAim()
      dx = nx * minR
      dy = ny * minR
      dist = minR
    } else if (dist > maxR) {
      const s = maxR / dist
      dx *= s
      dy *= s
    } else if (dist < minR) {
      const s = minR / dist
      dx *= s
      dy *= s
    }

    const ex = Phaser.Math.Clamp(
      player.x + dx,
      PLAYER_RADIUS,
      WORLD_WIDTH - PLAYER_RADIUS,
    )
    const ey = Phaser.Math.Clamp(
      player.y + dy,
      PLAYER_RADIUS,
      WORLD_HEIGHT - PLAYER_RADIUS,
    )
    return { ex, ey }
  }

  private resolveAim() {
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

  private fireBolt(
    x: number,
    y: number,
    nx: number,
    ny: number,
    damage: number,
    kind: 'ba' | 'q' | 'w',
    depth: number,
    proj?: { speed: number; range: number; hitRadius: number },
    wPhase: 'out' | 'return' = 'out',
  ) {
    const stats = this.host.getCombatStats()
    const speed =
      kind === 'ba'
        ? resolveLuxProjectileSpeed(stats)
        : (proj?.speed ?? (kind === 'q' ? resolveLuxQStats(1)?.speed : resolveLuxWStats(1)?.waveSpeed) ?? 380)
    const muzzle =
      kind === 'ba' || kind === 'q' || kind === 'w'
        ? luxMuzzlePoint(x, y, nx, ny, kind)
        : { x, y }
    const vis = createLuxProjectileVisual(this.host.scene, muzzle.x, muzzle.y, depth, kind, wPhase)
    if (!vis) return
    const angle = Math.atan2(ny, nx)
    vis.root.setRotation(angle)
    const hitRadius =
      kind === 'ba' ? LUX_BASIC_ATTACK.hitRadius : (proj?.hitRadius ?? (kind === 'q' ? 22 : 28))
    const range = kind === 'ba' ? undefined : (proj?.range ?? (kind === 'q' ? 420 : 340))
    const lifetimeMs =
      kind === 'ba'
        ? LUX_BASIC_ATTACK.lifetimeMs
        : kind === 'w'
          ? 60_000
          : Math.ceil(((range ?? 400) / speed) * 1000) + 80
    this.bolts.push({
      visual: vis,
      vx: nx * speed,
      vy: ny * speed,
      damage,
      hitRadius,
      remainingMs: lifetimeMs,
      kind,
      lastTrailAt: 0,
      waveHit: kind === 'w' ? new Set<number>() : undefined,
      wPhase: kind === 'w' ? wPhase : undefined,
      wTravelPx: kind === 'w' ? 0 : undefined,
      wMaxTravelPx: kind === 'w' && proj?.range ? proj.range : undefined,
      wShieldDurationMs:
        kind === 'w' ? resolveLuxWStats(effectiveLuxAbilityLevel(this.abilities.w))?.durationMs : undefined,
      wAgeMs: kind === 'w' ? 0 : undefined,
    })
    if (kind === 'q') {
      spawnLuxQCastFlash(this.host.scene, muzzle.x, muzzle.y, angle, depth)
    }
    if (kind === 'w') {
      if (wPhase === 'out') {
        spawnLuxWCastFlash(this.host.scene, muzzle.x, muzzle.y, angle, depth)
      }
    }
  }

  private updateBolts(time: number, delta: number) {
    const enemies = this.host.getEnemies()
    for (let i = this.bolts.length - 1; i >= 0; i -= 1) {
      const bolt = this.bolts[i]
      if (bolt.kind !== 'w') {
        bolt.remainingMs -= delta
      } else if (bolt.wAgeMs !== undefined) {
        bolt.wAgeMs += delta
      }
      const v = bolt.visual.root
      v.x += (bolt.vx * delta) / 1000
      v.y += (bolt.vy * delta) / 1000
      v.setDepth(v.y + 2)
      const flyAngle = Math.atan2(bolt.vy, bolt.vx)
      if (bolt.kind === 'q') {
        tickLuxQProjectileVisual(bolt.visual, delta)
        if (time - bolt.lastTrailAt > 88) {
          bolt.lastTrailAt = time
          spawnLuxQTrailSegment(this.host.scene, v.x, v.y, flyAngle, v.y)
        }
      }
      if (bolt.kind === 'w') {
        tickLuxWProjectileVisual(bolt.visual, delta)
        const step = (Math.hypot(bolt.vx, bolt.vy) * delta) / 1000
        if (bolt.wTravelPx !== undefined) {
          bolt.wTravelPx += step
        }
        if (
          bolt.wPhase === 'out' &&
          bolt.wMaxTravelPx !== undefined &&
          bolt.wTravelPx !== undefined &&
          bolt.wTravelPx >= bolt.wMaxTravelPx
        ) {
          this.beginLuxWaveReturn(bolt, v)
        }

        if (bolt.wPhase === 'return') {
          const player = this.host.getPlayer()
          if (player) {
            const tgt = luxWaveReturnTarget(player.x, player.y)
            const dx = tgt.x - v.x
            const dy = tgt.y - v.y
            const l = Math.hypot(dx, dy) || 1
            const spd = 420
            bolt.vx = (dx / l) * spd
            bolt.vy = (dy / l) * spd
            if (l < PLAYER_RADIUS + 26) {
              this.grantLuxSelfShield(bolt.wShieldDurationMs ?? 2000, player.y + 6)
              playLuxShieldApplyPulse(this.host.scene, tgt.x, tgt.y, player.y + 6)
              v.destroy()
              this.bolts.splice(i, 1)
              continue
            }
          }
        }

        const wFlyAngle = Math.atan2(bolt.vy, bolt.vx)
        if (bolt.visual.alignToVelocity) {
          bolt.visual.root.setRotation(wFlyAngle)
        }

        const trailEvery = bolt.wPhase === 'return' ? 42 : 72
        if (time - bolt.lastTrailAt > trailEvery) {
          bolt.lastTrailAt = time
          spawnLuxWTrailSegment(
            this.host.scene,
            v.x,
            v.y,
            wFlyAngle,
            v.y,
            bolt.wPhase === 'return',
          )
        }
      }
      const outOfWorld =
        v.x < 0 || v.y < 0 || v.x > WORLD_WIDTH || v.y > WORLD_HEIGHT
      if (bolt.kind === 'w') {
        if (outOfWorld && bolt.wPhase === 'out') {
          this.beginLuxWaveReturn(bolt, v)
          v.x = Phaser.Math.Clamp(v.x, 8, WORLD_WIDTH - 8)
          v.y = Phaser.Math.Clamp(v.y, 8, WORLD_HEIGHT - 8)
        }
        if ((bolt.wAgeMs ?? 0) > 14_000) {
          v.destroy()
          this.bolts.splice(i, 1)
          continue
        }
      } else if (bolt.remainingMs <= 0 || outOfWorld) {
        v.destroy()
        this.bolts.splice(i, 1)
        continue
      }
      for (let j = 0; j < enemies.length; j += 1) {
        const e = enemies[j]
        const d = Phaser.Math.Distance.Between(v.x, v.y, e.visual.x, e.visual.y)
        if (d <= bolt.hitRadius + e.radius) {
          if (bolt.kind === 'w') {
            if (bolt.waveHit?.has(j)) continue
            bolt.waveHit?.add(j)
          }
          this.host.damageEnemyAt(j, bolt.damage)
          spawnLuxImpact(
            this.host.scene,
            e.visual.x,
            e.visual.y,
            e.visual.y,
            bolt.kind === 'w' ? 'other' : bolt.kind,
          )
          if (bolt.kind !== 'w') {
            v.destroy()
            this.bolts.splice(i, 1)
            break
          }
        }
      }
    }
  }

  private tryCastQ(time: number) {
    if (!isLuxAbilityUnlocked(this.abilities.q)) return
    const stats = resolveLuxQStats(effectiveLuxAbilityLevel(this.abilities.q))
    if (!stats || !this.host.isAbilityReady('q', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.resolveAim()
    this.host.playSpellCastAnimation?.('q', nx, ny)
    this.fireBolt(player.x, player.y, nx, ny, stats.damage, 'q', player.y + 2, stats)
    this.host.startAbilityCooldown('q', time, stats.cooldownMs)
  }

  private tryCastW(time: number) {
    if (!isLuxAbilityUnlocked(this.abilities.w)) return
    const stats = resolveLuxWStats(effectiveLuxAbilityLevel(this.abilities.w))
    if (!stats || !this.host.isAbilityReady('w', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.resolveAim()
    this.host.playSpellCastAnimation?.('w', nx, ny)
    this.fireBolt(player.x, player.y, nx, ny, stats.waveDamage, 'w', player.y + 2, {
      speed: stats.waveSpeed,
      range: stats.waveRange,
      hitRadius: stats.waveHitRadius,
    })
    this.host.startAbilityCooldown('w', time, stats.cooldownMs)
  }

  private beginLuxWaveReturn(bolt: LuxBolt, v: Phaser.GameObjects.Container) {
    if (bolt.wPhase === 'return') return
    const player = this.host.getPlayer()
    if (!player || !bolt.visual.wWave) return
    bolt.wPhase = 'return'
    setLuxPrismaticWavePhase(bolt.visual.wWave, 'return')
    bolt.wTravelPx = 0
    bolt.waveHit = new Set<number>()
    const tgt = luxWaveReturnTarget(player.x, player.y)
    const dx = tgt.x - v.x
    const dy = tgt.y - v.y
    const l = Math.hypot(dx, dy) || 1
    const spd = Math.hypot(bolt.vx, bolt.vy) || 400
    bolt.vx = (dx / l) * spd
    bolt.vy = (dy / l) * spd
    bolt.wMaxTravelPx = l * 1.25
    spawnLuxWCastBurst(this.host.scene, v.x, v.y, Math.atan2(bolt.vy, bolt.vx), v.y + 2)
  }

  /** Escudo en Lux cuando la onda vuelve (Prismatic Barrier — sin aliados). */
  private grantLuxSelfShield(durationMs: number, depth: number) {
    const player = this.host.getPlayer()
    if (!player) return
    if (this.barriers.length > 0) {
      this.barriers[0].remainingMs = Math.max(this.barriers[0].remainingMs, durationMs)
      return
    }
    const shieldVis = createLuxPrismaticShieldOnPlayer(
      this.host.scene,
      player.x,
      player.y,
      depth,
    )
    shieldVis.root.setScale(0.88)
    shieldVis.root.setAlpha(0)
    this.host.scene.tweens.add({
      targets: shieldVis.root,
      scale: 1,
      alpha: 1,
      duration: 220,
      ease: 'Sine.Out',
    })
    this.barriers.push({
      visual: shieldVis.root,
      shield: shieldVis.shield,
      remainingMs: durationMs,
    })
  }

  private detonateZone(z: LuxZone, index: number) {
    if (z.exploded) return
    z.exploded = true
    spawnLuxEDetonateBurst(this.host.scene, z.x, z.y, z.y + 2, z.radius)
    const enemies = this.host.getEnemies()
    for (let j = 0; j < enemies.length; j += 1) {
      const e = enemies[j]
      const d = Phaser.Math.Distance.Between(z.x, z.y, e.visual.x, e.visual.y)
      if (d <= z.radius + e.radius) {
        this.host.damageEnemyAt(j, z.damage)
        spawnLuxImpact(this.host.scene, e.visual.x, e.visual.y, e.visual.y)
      }
    }
    spawnLuxImpact(this.host.scene, z.x, z.y, z.y + 2)
    z.zone.root.destroy()
    this.zones.splice(index, 1)
  }

  private landLuxEZone(
    tx: number,
    ty: number,
    depth: number,
    damage: number,
    radius: number,
    lingerMs: number,
  ) {
    spawnLuxEKugelLandPulse(this.host.scene, tx, ty, depth)
    const zoneVis = createLuxSingularityZoneVisual(this.host.scene, tx, ty, depth, radius)
    this.zones.push({
      zone: zoneVis,
      x: tx,
      y: ty,
      radius,
      lingerMs,
      lingerTotalMs: lingerMs,
      exploded: false,
      damage,
    })
  }

  private updateEMissiles(time: number, delta: number) {
    for (let i = this.eMissiles.length - 1; i >= 0; i -= 1) {
      const m = this.eMissiles[i]
      const root = m.visual.root
      tickLuxEKugelMissileVisual(m.visual, delta)
      const dx = m.tx - root.x
      const dy = m.ty - root.y
      const dist = Math.hypot(dx, dy)
      const step = (m.speed * delta) / 1000
      if (dist <= step || dist < 6) {
        root.setPosition(m.tx, m.ty)
        this.landLuxEZone(m.tx, m.ty, m.ty, m.damage, m.radius, m.lingerMs)
        root.destroy()
        this.eMissiles.splice(i, 1)
        continue
      }
      const ux = dx / dist
      const uy = dy / dist
      root.x += ux * step
      root.y += uy * step
      root.setDepth(root.y + 3)
      if (time - m.lastTrailAt > 48) {
        m.lastTrailAt = time
        spawnLuxEKugelTrail(this.host.scene, root.x, root.y, root.y)
      }
    }
  }

  private tryCastE(time: number) {
    if (!isLuxAbilityUnlocked(this.abilities.e)) return
    const stats = resolveLuxEStats(effectiveLuxAbilityLevel(this.abilities.e))
    if (!stats) return

    const active = this.getActiveE()
    if (active) {
      const idx = this.zones.indexOf(active)
      if (idx >= 0) this.detonateZone(active, idx)
      return
    }
    if (this.eMissiles.length > 0) return
    if (!this.host.isAbilityReady('e', time)) return

    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.resolveAim()
    this.host.playSpellCastAnimation?.('e', nx, ny)
    const aim = this.resolveEAimPoint(stats)
    if (!aim) return
    const { ex, ey } = aim
    const muzzle = luxMuzzlePoint(player.x, player.y, nx, ny, 'e')
    const vis = createLuxEKugelMissileVisual(
      this.host.scene,
      muzzle.x,
      muzzle.y,
      player.y + 2,
    )
    this.eMissiles.push({
      visual: vis,
      tx: ex,
      ty: ey,
      speed: stats.missileSpeed,
      radius: stats.radius,
      lingerMs: stats.lingerMs,
      damage: stats.damage,
      lastTrailAt: 0,
    })
    this.host.startAbilityCooldown('e', time, stats.cooldownMs)
  }

  private tryCastR(time: number) {
    if (!isLuxAbilityUnlocked(this.abilities.r)) return
    const stats = resolveLuxRStats(effectiveLuxAbilityLevel(this.abilities.r))
    if (!stats || !this.host.isAbilityReady('r', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    if (this.beam) {
      this.beam.visual.root.destroy()
      this.beam = null
    }
    const { nx, ny } = this.resolveAim()
    this.host.playSpellCastAnimation?.('r', nx, ny)
    const angle = Math.atan2(ny, nx)
    const muzzle = luxMuzzlePoint(player.x, player.y, nx, ny, 'r')
    const vis = createLuxFinalSparkVisual(
      this.host.scene,
      muzzle.x,
      muzzle.y,
      angle,
      player.y + 4,
      stats.range,
      stats.width,
    )
    this.beam = {
      visual: vis,
      x: muzzle.x,
      y: muzzle.y,
      nx,
      ny,
      range: stats.range,
      width: stats.width,
      damage: stats.damage,
      chargeMs: stats.chargeMs,
      initialChargeMs: stats.chargeMs,
      fireTravelMs: 0,
      fadeMs: 720,
      pulseMs: 0,
      fired: false,
      damageApplied: false,
    }
    this.host.startAbilityCooldown('r', time, stats.cooldownMs)
  }

  private updateZones(delta: number) {
    for (let i = this.zones.length - 1; i >= 0; i -= 1) {
      const z = this.zones[i]
      if (z.exploded) continue
      z.lingerMs -= delta
      const ratio =
        z.lingerTotalMs > 0 ? Phaser.Math.Clamp(z.lingerMs / z.lingerTotalMs, 0, 1) : 0
      updateLuxSingularityZoneVisual(
        this.host.scene,
        z.zone,
        z.x,
        z.y,
        z.y + 2,
        z.radius,
        ratio,
        delta,
      )
      z.zone.root.setDepth(z.y + 2)
      if (z.lingerMs <= 0) {
        this.detonateZone(z, i)
      }
    }
  }

  private updateBarriers(delta: number) {
    const player = this.host.getPlayer()
    for (let i = this.barriers.length - 1; i >= 0; i -= 1) {
      const b = this.barriers[i]
      b.remainingMs -= delta
      if (player?.active) {
        b.visual.setPosition(player.x, player.y - 14)
        b.visual.setDepth(player.y + 6)
        tickLuxPrismaticShield(b.shield, delta)
      }
      if (b.remainingMs <= 0) {
        b.visual.destroy()
        this.barriers.splice(i, 1)
      }
    }
  }

  private applyLuxRBeamDamage(beam: LuxBeam) {
    const enemies = this.host.getEnemies()
    for (let j = 0; j < enemies.length; j += 1) {
      const e = enemies[j]
      const dx = e.visual.x - beam.x
      const dy = e.visual.y - beam.y
      const along = dx * beam.nx + dy * beam.ny
      if (along < 0 || along > beam.range + e.radius) continue
      const perp = Math.abs(-dy * beam.nx + dx * beam.ny)
      if (perp <= beam.width + e.radius) {
        this.host.damageEnemyAt(j, beam.damage)
        spawnLuxImpact(this.host.scene, e.visual.x, e.visual.y, e.visual.y, 'other')
      }
    }
  }

  private updateBeam(delta: number) {
    if (!this.beam) return
    const beam = this.beam
    beam.pulseMs += delta
    const pulse = 0.5 + 0.5 * Math.sin(beam.pulseMs * 0.014)

    if (beam.chargeMs > 0) {
      beam.chargeMs -= delta
      const chargeRatio =
        beam.initialChargeMs > 0
          ? 1 - Phaser.Math.Clamp(beam.chargeMs / beam.initialChargeMs, 0, 1)
          : 1
      beam.visual.update({
        phase: 'charge',
        chargeRatio,
        fireRatio: 0,
        pulse,
        range: beam.range,
        width: beam.width,
        deltaMs: delta,
      })
      return
    }

    if (!beam.fired) {
      beam.fired = true
      beam.fireTravelMs = LUX_R_BEAM_TRAVEL_MS
    }

    let fireRatio = 1
    if (beam.fireTravelMs > 0) {
      beam.fireTravelMs -= delta
      fireRatio = 1 - Phaser.Math.Clamp(beam.fireTravelMs / LUX_R_BEAM_TRAVEL_MS, 0, 1)
    }

    beam.visual.update({
      phase: 'fire',
      chargeRatio: 1,
      fireRatio,
      pulse,
      range: beam.range,
      width: beam.width,
      deltaMs: delta,
    })

    if (!beam.damageApplied && beam.fireTravelMs <= 0) {
      beam.damageApplied = true
      this.applyLuxRBeamDamage(beam)
      beam.visual.flashTip()
    }

    beam.fadeMs -= delta
    if (beam.fadeMs <= 0) {
      beam.visual.root.destroy()
      this.beam = null
    }
  }
}
