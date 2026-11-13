import * as Phaser from 'phaser'
import type { ArenaEnemy } from '../enemies/enemyFactory'
import { PLAYER_RADIUS, WORLD_HEIGHT, WORLD_WIDTH } from '../constants'
import type { PlayerCombatStats } from '../playerStats'
import {
  createInitialEzrealAbilityLevels,
  effectiveEzrealAbilityLevel,
  isEzrealAbilityUnlocked,
  resolveEzrealEStats,
  resolveEzrealQStats,
  resolveEzrealRStats,
  resolveEzrealWStats,
  type EzrealAbilityLevels,
} from './ezrealAbilityState'
import {
  EZREAL_BASIC_ATTACK,
  resolveEzrealAttackIntervalMs,
  resolveEzrealBasicAttackRange,
  resolveEzrealDirectDamage,
  resolveEzrealProjectileSpeed,
} from './ezrealBasicAttack'
import {
  EZREAL_Q_SPAWN_TUCK,
  EZREAL_W_SPAWN_TUCK,
  ezrealAbilityEmitPoints,
} from './ezrealMuzzle'
import {
  createEzrealBoltVisual,
  createArcaneShiftMissileVisual,
  spawnEzrealArcaneShiftCast,
  spawnEzrealArcaneShiftMissileHit,
  spawnEzrealBasicCast,
  attachEzrealEssenceMark,
  spawnEzrealEssenceFluxCast,
  spawnEzrealEssenceFluxDissipate,
  spawnEzrealEssenceMarkDetonate,
  spawnEzrealImpact,
  EZREAL_BOLT_RELEASE_MS,
  EZREAL_Q_RELEASE_MS,
  EZREAL_W_RELEASE_MS,
  spawnEzrealMysticCast,
  EZREAL_R_RELEASE_MS,
  spawnEzrealTrueshotCast,
  spawnEzrealTrueshotDissipate,
  updateEzrealBoltVisual,
  type EzrealBoltVisual,
} from '../vfx/ezreal/ezrealSpellVisuals'

type Enemy = ArenaEnemy

type Bolt = {
  visual: EzrealBoltVisual
  x: number
  y: number
  nx: number
  ny: number
  speed: number
  damage: number
  hitRadius: number
  traveled: number
  maxRange: number
  kind: 'ba' | 'q' | 'w' | 'r' | 'e'
  pierceLeft: number
  hitSet?: Set<number>
  homingEnemyIndex?: number
  wMark?: {
    markMs: number
    markBonus: number
  }
  rBeamWidth?: number
  spawnX: number
  spawnY: number
}

type WMark = {
  enemyIndex: number
  untilMs: number
  bonus: number
  gfx?: Phaser.GameObjects.Container | null
}

type EzrealArenaHost = {
  scene: Phaser.Scene
  getPlayer: () => Phaser.Physics.Arcade.Sprite | null
  getEnemies: () => Enemy[]
  getCombatStats: () => PlayerCombatStats
  getCombatMs: () => number
  isAbilityReady: (slot: 'q' | 'w' | 'e' | 'r', time: number) => boolean
  startAbilityCooldown: (slot: 'q' | 'w' | 'e' | 'r', time: number, ms: number) => void
  findNearestEnemyIndex: (range?: number) => number
  damageEnemyAt: (index: number, damage: number) => void
  readMoveVector: () => { x: number; y: number }
  repositionPlayer: (x: number, y: number) => void
  getAbilityHotkeys: () =>
    | Record<'q' | 'w' | 'e' | 'r', Phaser.Input.Keyboard.Key>
    | undefined
  playSpellCastAnimation?: (slot: 'q' | 'w' | 'e' | 'r', nx: number, ny: number) => void
  playBasicAttackAnimation?: (nx: number, ny: number) => void
}

export class EzrealArenaSystems {
  abilities: EzrealAbilityLevels = createInitialEzrealAbilityLevels()

  private bolts: Bolt[] = []
  private marks: WMark[] = []
  private nextShotAt = 0
  private host: EzrealArenaHost

  constructor(host: EzrealArenaHost) {
    this.host = host
  }

  private destroyBolt(b: Bolt) {
    b.visual.root.destroy()
  }

  /** Donde se dibuja el proyectil (gameplay + offset de guante). */
  private boltVisualPos(b: Bolt) {
    return {
      x: b.x + (b.visual.visualDx ?? 0),
      y: b.y + (b.visual.visualDy ?? 0),
    }
  }

  reset(time: number) {
    this.abilities = createInitialEzrealAbilityLevels()
    this.clearAll()
    this.nextShotAt = time + 280
  }

  clearAll() {
    for (const b of this.bolts) this.destroyBolt(b)
    this.bolts = []
    for (const m of this.marks) m.gfx?.destroy()
    this.marks = []
  }

  getAbilities() {
    return this.abilities
  }

  setAbilities(levels: EzrealAbilityLevels) {
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

  private aim() {
    const player = this.host.getPlayer()
    const pointer = this.host.scene.input.activePointer
    const cam = this.host.scene.cameras.main
    if (player && cam) {
      const world = cam.getWorldPoint(pointer.x, pointer.y)
      const pdx = world.x - player.x
      const pdy = world.y - player.y
      if (Math.hypot(pdx, pdy) > 14) {
        const l = Math.hypot(pdx, pdy) || 1
        return { nx: pdx / l, ny: pdy / l }
      }
    }
    const move = this.host.readMoveVector()
    let nx = move.x
    let ny = move.y
    if (Math.hypot(nx, ny) < 0.12) {
      const idx = this.host.findNearestEnemyIndex(560)
      if (idx >= 0 && player) {
        const e = this.host.getEnemies()[idx]
        const dx = e.visual.x - player.x
        const dy = e.visual.y - player.y
        const d = Math.hypot(dx, dy) || 1
        nx = dx / d
        ny = dy / d
      } else {
        nx = 1
        ny = 0
      }
    }
    const d = Math.hypot(nx, ny) || 1
    return { nx: nx / d, ny: ny / d }
  }

  /** Arcane Shift — dirección del movimiento (WASD); si estás quieto, ratón. */
  private resolveBlinkFromMovement(blinkDistance: number) {
    const player = this.host.getPlayer()
    if (!player) return null
    const move = this.host.readMoveVector()
    let nx = move.x
    let ny = move.y
    if (Math.hypot(nx, ny) < 0.12) {
      const aim = this.aim()
      nx = aim.nx
      ny = aim.ny
    } else {
      const d = Math.hypot(nx, ny) || 1
      nx /= d
      ny /= d
    }
    const travel = blinkDistance
    const tx = Phaser.Math.Clamp(
      player.x + nx * travel,
      PLAYER_RADIUS + 24,
      WORLD_WIDTH - PLAYER_RADIUS - 24,
    )
    const ty = Phaser.Math.Clamp(
      player.y + ny * travel,
      PLAYER_RADIUS + 24,
      WORLD_HEIGHT - PLAYER_RADIUS - 24,
    )
    return { ox: player.x, oy: player.y, tx, ty, nx, ny }
  }

  /** Prioriza enemigo en rango; si no hay, apunta con ratón / movimiento / default (como E y R). */
  /** Distancia máxima en esta dirección antes del borde jugable. */
  private travelLimitToWorld(x: number, y: number, nx: number, ny: number, maxDist: number) {
    const margin = PLAYER_RADIUS + 24
    let limit = maxDist
    if (nx > 1e-6) limit = Math.min(limit, (WORLD_WIDTH - margin - x) / nx)
    else if (nx < -1e-6) limit = Math.min(limit, (margin - x) / nx)
    if (ny > 1e-6) limit = Math.min(limit, (WORLD_HEIGHT - margin - y) / ny)
    else if (ny < -1e-6) limit = Math.min(limit, (margin - y) / ny)
    return Math.max(0, limit)
  }

  private resolveSkillAim(skillRange: number) {
    const player = this.host.getPlayer()
    if (!player) return null
    const idx = this.host.findNearestEnemyIndex(skillRange)
    if (idx >= 0) {
      const target = this.host.getEnemies()[idx]
      const dx = target.visual.x - player.x
      const dy = target.visual.y - player.y
      const dist = Math.hypot(dx, dy) || 1
      return { nx: dx / dist, ny: dy / dist, distToTarget: dist }
    }
    const { nx, ny } = this.aim()
    return { nx, ny, distToTarget: skillRange }
  }

  private fireBolt(
    x: number,
    y: number,
    nx: number,
    ny: number,
    damage: number,
    speed: number,
    range: number,
    kind: Bolt['kind'],
    pierceLeft = 0,
    wMark?: Bolt['wMark'],
    rBeamWidth?: number,
  ) {
    const angle = Math.atan2(ny, nx)
    const muzzleKind = kind === 'ba' || kind === 'q' || kind === 'w' || kind === 'r' ? kind : 'ba'
    const tuck =
      kind === 'q' ? EZREAL_Q_SPAWN_TUCK : kind === 'w' ? EZREAL_W_SPAWN_TUCK : 0
    const emit = ezrealAbilityEmitPoints(x, y, nx, ny, muzzleKind, tuck)
    const mx = emit.ground.x
    const my = emit.ground.y
    const spawnLead = emit.spawnLead
    const { x: vfxX, y: vfxY } = emit.vfx
    let maxTravel = Math.max(72, range - spawnLead)
    if (kind === 'r') {
      maxTravel = Math.min(maxTravel, this.travelLimitToWorld(mx, my, nx, ny, maxTravel))
    }
    if (kind === 'q') {
      spawnEzrealMysticCast(this.host.scene, vfxX, vfxY, angle, y + 2)
    } else if (kind === 'r') {
      spawnEzrealTrueshotCast(this.host.scene, vfxX, vfxY, angle, y + 2)
    } else if (kind === 'w') {
      spawnEzrealEssenceFluxCast(this.host.scene, vfxX, vfxY, angle, y + 2)
    } else {
      spawnEzrealBasicCast(this.host.scene, vfxX, vfxY, angle, y + 2)
    }
    const beamW = rBeamWidth ?? 48
    const vis = createEzrealBoltVisual(
      this.host.scene,
      mx,
      my,
      angle,
      y + 2,
      muzzleKind,
      beamW,
    )
    vis.visualDx = emit.off.dx
    vis.visualDy = emit.off.dy
    this.bolts.push({
      visual: vis,
      x: mx,
      y: my,
      nx,
      ny,
      speed,
      damage,
      hitRadius:
        kind === 'ba'
          ? EZREAL_BASIC_ATTACK.hitRadius
          : kind === 'r'
            ? Math.round(beamW * 0.42)
            : kind === 'w'
              ? (resolveEzrealWStats(effectiveEzrealAbilityLevel(this.abilities.w))?.hitRadius ?? 18)
              : 14,
      traveled: 0,
      maxRange: maxTravel,
      kind,
      pierceLeft: kind === 'w' ? 999 : pierceLeft,
      hitSet: kind === 'w' || pierceLeft > 0 ? new Set() : undefined,
      wMark: kind === 'w' ? wMark : undefined,
      rBeamWidth: kind === 'r' ? beamW : undefined,
      spawnX: mx,
      spawnY: my,
    })
  }

  private applyEssenceMarkOnEnemy(enemyIndex: number, markMs: number, markBonus: number, time: number) {
    const until = time + markMs
    this.marks = this.marks.filter((m) => {
      if (m.enemyIndex === enemyIndex) {
        m.gfx?.destroy()
        return false
      }
      return true
    })
    const enemy = this.host.getEnemies()[enemyIndex]
    if (!enemy) return
    const gfx = attachEzrealEssenceMark(this.host.scene, enemy.visual)
    this.marks.push({
      enemyIndex,
      untilMs: until,
      bonus: markBonus,
      gfx,
    })
  }

  autoAttack(time: number) {
    if (time < this.nextShotAt || this.isMovementLocked()) return
    const player = this.host.getPlayer()
    if (!player) return
    const stats = this.host.getCombatStats()
    const range = resolveEzrealBasicAttackRange(stats)
    const idx = this.host.findNearestEnemyIndex(range)
    if (idx < 0) return
    const target = this.host.getEnemies()[idx]
    const dx = target.visual.x - player.x
    const dy = target.visual.y - player.y
    const d = Math.hypot(dx, dy) || 1
    const nx = dx / d
    const ny = dy / d
    this.host.playBasicAttackAnimation?.(nx, ny)
    const releaseMs = EZREAL_BOLT_RELEASE_MS
    const boltSpeed = resolveEzrealProjectileSpeed(stats)
    this.host.scene.time.delayedCall(releaseMs, () => {
      const p = this.host.getPlayer()
      if (!p) return
      const j = this.host.findNearestEnemyIndex(range)
      if (j < 0) return
      const t = this.host.getEnemies()[j]
      const tx = t.visual.x - p.x
      const ty = t.visual.y - p.y
      const dist = Math.hypot(tx, ty) || 1
      const fnx = tx / dist
      const fny = ty / dist
      const boltDamage = resolveEzrealDirectDamage(this.host.getCombatStats())
      this.fireBolt(p.x, p.y, fnx, fny, boltDamage, boltSpeed, range, 'ba')
    })
    this.nextShotAt = time + resolveEzrealAttackIntervalMs(stats)
  }

  private activeMark(index: number) {
    const now = this.host.getCombatMs()
    return this.marks.find((m) => m.enemyIndex === index && m.untilMs > now)
  }

  private damageWithMarkBonus(index: number, base: number) {
    const mark = this.activeMark(index)
    return mark ? base * (1 + mark.bonus) : base
  }

  /** Consume la marca y detona — una sola vez por golpe. */
  private spawnArcaneShiftMissiles(x: number, y: number, stats: NonNullable<ReturnType<typeof resolveEzrealEStats>>) {
    const enemies = this.host.getEnemies()
    const ranked: { idx: number; d: number }[] = []
    for (let j = 0; j < enemies.length; j += 1) {
      const e = enemies[j]
      const d = Math.hypot(e.visual.x - x, e.visual.y - y)
      if (d <= stats.missileRange) ranked.push({ idx: j, d })
    }
    if (ranked.length === 0) return
    ranked.sort((a, b) => a.d - b.d)
    for (const { idx } of ranked.slice(0, stats.missileCount)) {
      const e = enemies[idx]
      const dx = e.visual.x - x
      const dy = e.visual.y - y
      const dist = Math.hypot(dx, dy) || 1
      const nx = dx / dist
      const ny = dy / dist
      const emit = ezrealAbilityEmitPoints(x, y, nx, ny, 'e')
      const mx = emit.ground.x
      const my = emit.ground.y
      const vis = createArcaneShiftMissileVisual(
        this.host.scene,
        mx,
        my,
        Math.atan2(ny, nx),
        y + 2,
      )
      vis.visualDx = emit.off.dx
      vis.visualDy = emit.off.dy
      this.bolts.push({
        visual: vis,
        x: mx,
        y: my,
        nx,
        ny,
        speed: stats.missileSpeed,
        damage: stats.damage,
        hitRadius: stats.missileHitRadius,
        traveled: 0,
        maxRange: stats.missileRange + 120,
        kind: 'e',
        pierceLeft: 0,
        homingEnemyIndex: idx,
        spawnX: mx,
        spawnY: my,
      })
    }
  }

  private procEssenceMarkOnHit(index: number, x: number, y: number) {
    const mark = this.activeMark(index)
    if (!mark) return false
    mark.gfx?.destroy()
    this.marks = this.marks.filter((m) => m !== mark)
    spawnEzrealEssenceMarkDetonate(this.host.scene, x, y, y)
    return true
  }

  update(_time: number, delta: number) {
    this.updateBolts(delta)
    const now = this.host.getCombatMs()
    this.marks = this.marks.filter((m) => {
      if (m.untilMs <= now) {
        m.gfx?.destroy()
        return false
      }
      return true
    })
  }

  private updateBolts(delta: number) {
    for (let i = this.bolts.length - 1; i >= 0; i -= 1) {
      const b = this.bolts[i]
      const enemies = this.host.getEnemies()
      if (b.kind === 'e' && b.homingEnemyIndex !== undefined) {
        const target = enemies[b.homingEnemyIndex]
        if (!target) {
          this.destroyBolt(b)
          this.bolts.splice(i, 1)
          continue
        }
        const dx = target.visual.x - b.x
        const dy = target.visual.y - b.y
        const dist = Math.hypot(dx, dy) || 1
        const wantNx = dx / dist
        const wantNy = dy / dist
        const turn = Math.min(1, 7.5 * (delta / 1000))
        b.nx += (wantNx - b.nx) * turn
        b.ny += (wantNy - b.ny) * turn
        const len = Math.hypot(b.nx, b.ny) || 1
        b.nx /= len
        b.ny /= len
        b.visual.root.setRotation(Math.atan2(b.ny, b.nx))
      }
      let step = (b.speed * delta) / 1000
      const remain = b.maxRange - b.traveled
      if (step > remain) step = remain
      b.x += b.nx * step
      b.y += b.ny * step
      b.traveled += step

      if (b.traveled >= b.maxRange - 0.5) {
        b.traveled = b.maxRange
        b.x = b.spawnX + b.nx * b.maxRange
        b.y = b.spawnY + b.ny * b.maxRange
      }

      updateEzrealBoltVisual(b.visual, b.x, b.y)

      if (b.traveled >= b.maxRange) {
        if (b.kind === 'w') {
          spawnEzrealEssenceFluxDissipate(this.host.scene, b.x, b.y, b.y)
        } else if (b.kind === 'r') {
          const end = this.boltVisualPos(b)
          spawnEzrealTrueshotDissipate(
            this.host.scene,
            end.x,
            end.y,
            b.nx,
            b.ny,
            end.y,
            b.rBeamWidth ?? 48,
          )
        }
        this.destroyBolt(b)
        this.bolts.splice(i, 1)
        continue
      }

      for (let j = 0; j < enemies.length; j += 1) {
        if (b.kind === 'e' && b.homingEnemyIndex !== undefined && j !== b.homingEnemyIndex) continue
        if (b.hitSet?.has(j)) continue
        const e = enemies[j]
        const dx = e.visual.x - b.x
        const dy = e.visual.y - b.y
        if (dx * dx + dy * dy <= (b.hitRadius + e.radius) ** 2) {
          if (b.kind === 'w' && b.wMark) {
            b.hitSet?.add(j)
            this.applyEssenceMarkOnEnemy(
              j,
              b.wMark.markMs,
              b.wMark.markBonus,
              this.host.getCombatMs(),
            )
            continue
          }
          const dmg = this.damageWithMarkBonus(j, b.damage)
          this.host.damageEnemyAt(j, dmg)
          this.procEssenceMarkOnHit(j, e.visual.x, e.visual.y)
          if (b.kind === 'e') {
            spawnEzrealArcaneShiftMissileHit(this.host.scene, e.visual.x, e.visual.y, e.visual.y)
          } else {
            spawnEzrealImpact(
              this.host.scene,
              e.visual.x,
              e.visual.y,
              e.visual.y,
              b.kind === 'r',
              b.kind === 'ba',
              b.kind === 'q',
            )
          }
          if (b.pierceLeft > 0) {
            b.hitSet?.add(j)
            b.pierceLeft -= 1
            if (b.pierceLeft <= 0) {
              if (b.kind === 'r') {
                const end = this.boltVisualPos(b)
                spawnEzrealTrueshotDissipate(
                  this.host.scene,
                  end.x,
                  end.y,
                  b.nx,
                  b.ny,
                  end.y,
                  b.rBeamWidth ?? 48,
                )
              }
              this.destroyBolt(b)
              this.bolts.splice(i, 1)
            }
            break
          }
          this.destroyBolt(b)
          this.bolts.splice(i, 1)
          break
        }
      }
    }
  }

  private tryCastQ(time: number) {
    if (!isEzrealAbilityUnlocked(this.abilities.q)) return
    const stats = resolveEzrealQStats(effectiveEzrealAbilityLevel(this.abilities.q))
    if (!stats || !this.host.isAbilityReady('q', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const aim = this.resolveSkillAim(stats.range)
    if (!aim) return
    const { nx, ny } = aim
    this.host.playSpellCastAnimation?.('q', nx, ny)
    this.host.startAbilityCooldown('q', time, stats.cooldownMs)
    const range = stats.range
    const speed = stats.speed
    const pierce = stats.pierce
    const castNx = nx
    const castNy = ny
    this.host.scene.time.delayedCall(EZREAL_Q_RELEASE_MS, () => {
      const p = this.host.getPlayer()
      if (!p) return
      const aimNow = this.resolveSkillAim(range)
      if (!aimNow) {
        this.fireBolt(p.x, p.y, castNx, castNy, stats.damage, speed, range, 'q', pierce)
        return
      }
      const { nx: fnx, ny: fny } = aimNow
      this.fireBolt(p.x, p.y, fnx, fny, stats.damage, speed, range, 'q', pierce)
    })
  }

  private tryCastW(time: number) {
    if (!isEzrealAbilityUnlocked(this.abilities.w)) return
    const stats = resolveEzrealWStats(effectiveEzrealAbilityLevel(this.abilities.w))
    if (!stats || !this.host.isAbilityReady('w', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const aim = this.resolveSkillAim(stats.range)
    if (!aim) return
    const { nx, ny } = aim
    const castNx = nx
    const castNy = ny
    this.host.playSpellCastAnimation?.('w', nx, ny)
    this.host.startAbilityCooldown('w', time, stats.cooldownMs)
    const range = stats.range
    this.host.scene.time.delayedCall(EZREAL_W_RELEASE_MS, () => {
      const p = this.host.getPlayer()
      if (!p) return
      const aimNow = this.resolveSkillAim(range)
      let fnx = castNx
      let fny = castNy
      let travel = range
      if (aimNow) {
        fnx = aimNow.nx
        fny = aimNow.ny
        travel = Math.min(aimNow.distToTarget, range)
      }
      this.fireBolt(
        p.x,
        p.y,
        fnx,
        fny,
        0,
        stats.speed,
        travel,
        'w',
        0,
        {
          markMs: stats.markMs,
          markBonus: stats.markBonusDamage,
        },
      )
    })
  }

  private tryCastE(time: number) {
    if (!isEzrealAbilityUnlocked(this.abilities.e)) return
    const stats = resolveEzrealEStats(effectiveEzrealAbilityLevel(this.abilities.e))
    if (!stats || !this.host.isAbilityReady('e', time)) return
    const blink = this.resolveBlinkFromMovement(stats.blinkDistance)
    if (!blink) return
    const { ox, oy, tx, ty, nx, ny } = blink
    const angle = Math.atan2(ny, nx)
    this.host.playSpellCastAnimation?.('e', nx, ny)
    spawnEzrealArcaneShiftCast(this.host.scene, ox, oy, angle, oy)
    this.host.repositionPlayer(tx, ty)
    const landed = this.host.getPlayer()
    const lx = landed?.x ?? tx
    const ly = landed?.y ?? ty
    spawnEzrealArcaneShiftCast(this.host.scene, lx, ly, angle, ly, true)
    this.host.scene.time.delayedCall(80, () => {
      this.spawnArcaneShiftMissiles(tx, ty, stats)
    })
    this.host.startAbilityCooldown('e', time, stats.cooldownMs)
  }

  private tryCastR(time: number) {
    if (!isEzrealAbilityUnlocked(this.abilities.r)) return
    const stats = resolveEzrealRStats(effectiveEzrealAbilityLevel(this.abilities.r))
    if (!stats || !this.host.isAbilityReady('r', time)) return
    const player = this.host.getPlayer()
    if (!player) return
    const { nx, ny } = this.aim()
    const castNx = nx
    const castNy = ny
    this.host.playSpellCastAnimation?.('r', nx, ny)
    this.host.scene.time.delayedCall(EZREAL_R_RELEASE_MS, () => {
      const p = this.host.getPlayer()
      if (!p) return
      const aimNow = this.aim()
      let fnx = castNx
      let fny = castNy
      if (aimNow) {
        fnx = aimNow.nx
        fny = aimNow.ny
      }
      this.fireBolt(
        p.x,
        p.y,
        fnx,
        fny,
        stats.damage,
        stats.speed,
        stats.range,
        'r',
        999,
        undefined,
        stats.width,
      )
    })
    this.host.startAbilityCooldown('r', time, stats.cooldownMs)
  }
}

export type { EzrealArenaHost }
