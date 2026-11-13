import type { ChampionId } from '../champions/types'
import { resolveQStats, resolveWStats as resolveAhriW, resolveEStats as resolveAhriE, resolveRStats as resolveAhriR } from '../combat/ahriAbilityState'
import {
  resolveWStats as resolveJinxW,
  resolveEStats as resolveJinxE,
  resolveRStats as resolveJinxR,
  type JinxAbilityLevels,
} from '../combat/jinxAbilityState'
import {
  resolveLuxQStats,
  resolveLuxWStats,
  resolveLuxEStats,
  resolveLuxRStats,
  type LuxAbilityLevels,
} from '../combat/luxAbilityState'
import {
  resolveMissFortuneQStats,
  resolveMissFortuneWStats,
  resolveMissFortuneEStats,
  resolveMissFortuneRStats,
  type MissFortuneAbilityLevels,
} from '../combat/missFortuneAbilityState'
import {
  resolveLeeSinQStats,
  resolveLeeSinEStats,
  resolveLeeSinRStats,
  type LeeSinAbilityLevels,
} from '../combat/leeSinAbilityState'
import {
  resolveYasuoQStats,
  resolveYasuoEStats,
  resolveYasuoRStats,
  type YasuoAbilityLevels,
} from '../combat/yasuoAbilityState'
import {
  resolveEzrealQStats,
  resolveEzrealWStats,
  resolveEzrealEStats,
  resolveEzrealRStats,
  type EzrealAbilityLevels,
} from '../combat/ezrealAbilityState'
import { BASE_PROJECTILE_DAMAGE } from '../playerStats'
import type { PlayerCombatStats } from '../playerStats'
import type { SimAbilityLoadout } from './simChampionInit'
import {
  damageEnemyAt,
  damageEnemyIndices,
  densestClusterCenter,
  enemiesInCone,
  enemiesInRadius,
  nearestEnemyIndex,
} from './simGeo'
import type { SimAbilityCd, SimDamageZone, SimEnemy } from './simTypes'

export type SimAbilityRuntime = {
  cds: SimAbilityCd
  zones: SimDamageZone[]
  /** MF W — multiplicador extra sobre intervalo de básico mientras activo. */
  mfWAttackSpeedMult: number
  mfWEndCombatMs: number
  /** Lee W — escudo simplificado (absorbe daño de contacto/proyectil). */
  leeShieldUntilMs: number
  leeShieldHp: number
}

export function createSimAbilityRuntime(): SimAbilityRuntime {
  return {
    cds: { q: 0, w: 0, e: 0, r: 0 },
    zones: [],
    mfWAttackSpeedMult: 1,
    mfWEndCombatMs: 0,
    leeShieldUntilMs: 0,
    leeShieldHp: 0,
  }
}

function abilityMult(stats: PlayerCombatStats): number {
  return stats.projectileDamage / BASE_PROJECTILE_DAMAGE
}

export function tickDamageZones(
  zones: SimDamageZone[],
  combatMs: number,
  tickMs: number,
  enemies: SimEnemy[],
): number {
  let kills = 0
  for (let z = zones.length - 1; z >= 0; z -= 1) {
    const zone = zones[z]
    if (combatMs >= zone.endCombatMs) {
      zones.splice(z, 1)
      continue
    }
    if (combatMs - zone.lastTickCombatMs < tickMs) continue
    zone.lastTickCombatMs = combatMs
    const tickDmg = (zone.dps * tickMs) / 1000
    const hits = enemiesInRadius(enemies, zone.x, zone.y, zone.radius)
    kills += damageEnemyIndices(enemies, hits, tickDmg)
  }
  return kills
}

export function tickChampionAbilities(
  championId: ChampionId,
  px: number,
  py: number,
  combatMs: number,
  stats: PlayerCombatStats,
  loadout: SimAbilityLoadout,
  runtime: SimAbilityRuntime,
  enemies: SimEnemy[],
  facingDx: number,
  facingDy: number,
): number {
  if (enemies.length === 0) return 0
  const mult = abilityMult(stats)
  let kills = 0

  if (combatMs >= runtime.mfWEndCombatMs) {
    runtime.mfWAttackSpeedMult = 1
  }

  switch (championId) {
    case 'jinx':
      kills += tickJinxAbilities(px, py, combatMs, mult, loadout.jinx, runtime, enemies)
      break
    case 'ahri':
      kills += tickAhriAbilities(px, py, combatMs, mult, loadout.ahri, runtime, enemies)
      break
    case 'lux':
      kills += tickLuxAbilities(px, py, combatMs, mult, loadout.lux, runtime, enemies)
      break
    case 'missfortune':
      kills += tickMissFortuneAbilities(
        px,
        py,
        combatMs,
        mult,
        loadout.missFortune,
        runtime,
        enemies,
        facingDx,
        facingDy,
      )
      break
    case 'leesin':
      kills += tickLeeSinAbilities(px, py, combatMs, mult, loadout.leeSin, runtime, enemies)
      break
    case 'yasuo':
      kills += tickYasuoAbilities(
        px,
        py,
        combatMs,
        mult,
        loadout.yasuo,
        runtime,
        enemies,
        facingDx,
        facingDy,
      )
      break
    case 'ezreal':
      kills += tickEzrealAbilities(
        px,
        py,
        combatMs,
        mult,
        loadout.ezreal,
        runtime,
        enemies,
        facingDx,
        facingDy,
      )
      break
    default:
      break
  }

  return kills
}

function tickJinxAbilities(
  px: number,
  py: number,
  combatMs: number,
  mult: number,
  ab: JinxAbilityLevels,
  runtime: SimAbilityRuntime,
  enemies: SimEnemy[],
): number {
  let kills = 0
  const w = resolveJinxW(ab.w)
  if (w && combatMs >= runtime.cds.w) {
    const idx = nearestEnemyIndex(enemies, px, py, 520)
    if (idx >= 0) {
      kills += damageEnemyAt(enemies, idx, w.damage * mult)
      const pierce = w.pierce
      let last = idx
      for (let p = 0; p < pierce; p += 1) {
        const next = nearestEnemyIndex(enemies, px, py, 520, last)
        if (next < 0) break
        kills += damageEnemyAt(enemies, next, w.damage * mult * 0.85)
        last = next
      }
      runtime.cds.w = combatMs + w.cooldownMs
    }
  }

  const e = resolveJinxE(ab.e)
  if (e && combatMs >= runtime.cds.e) {
    const idx = nearestEnemyIndex(enemies, px, py, 360)
    if (idx >= 0) {
      const target = enemies[idx]
      const hits = enemiesInRadius(enemies, target.x, target.y, e.triggerRadius + 20)
      kills += damageEnemyIndices(enemies, hits, e.trapDamage * mult)
      runtime.cds.e = combatMs + e.cooldownMs
    }
  }

  const r = resolveJinxR(ab.r)
  if (r && combatMs >= runtime.cds.r) {
    const idx = nearestEnemyIndex(enemies, px, py, 900)
    if (idx >= 0) {
      const target = enemies[idx]
      kills += damageEnemyAt(enemies, idx, r.directDamage * mult)
      const splashHits = enemiesInRadius(enemies, target.x, target.y, r.splashRadius)
      kills += damageEnemyIndices(
        enemies,
        splashHits.filter((i) => i !== idx),
        r.splashDamage * mult,
      )
      runtime.cds.r = combatMs + r.cooldownMs
    }
  }

  return kills
}

function tickAhriAbilities(
  px: number,
  py: number,
  combatMs: number,
  mult: number,
  ab: { q: number; w: number; e: number; r: number },
  runtime: SimAbilityRuntime,
  enemies: SimEnemy[],
): number {
  let kills = 0
  const q = resolveQStats(ab.q)
  if (q && combatMs >= runtime.cds.q) {
    const idx = nearestEnemyIndex(enemies, px, py, 480)
    if (idx >= 0) {
      kills += damageEnemyAt(enemies, idx, q.damage * mult)
      if (enemies[idx]) {
        kills += damageEnemyAt(enemies, idx, q.damage * mult * 0.9)
      }
      runtime.cds.q = combatMs + q.cooldownMs
    }
  }

  const w = resolveAhriW(ab.w)
  if (w && combatMs >= runtime.cds.w) {
    let hit = 0
    for (let s = 0; s < w.spiritCount; s += 1) {
      const idx = nearestEnemyIndex(enemies, px, py, 420)
      if (idx < 0) break
      hit += damageEnemyAt(enemies, idx, w.damage * mult)
    }
    if (hit > 0) runtime.cds.w = combatMs + w.cooldownMs
  }

  const e = resolveAhriE(ab.e)
  if (e && combatMs >= runtime.cds.e) {
    const idx = nearestEnemyIndex(enemies, px, py, 620)
    if (idx >= 0) {
      kills += damageEnemyAt(enemies, idx, e.damage * mult)
      runtime.cds.e = combatMs + e.cooldownMs
    }
  }

  const r = resolveAhriR(ab.r)
  if (r && combatMs >= runtime.cds.r) {
    for (let d = 0; d < r.dashCount; d += 1) {
      const hits = enemiesInRadius(enemies, px, py, r.hitRadius + 40)
      kills += damageEnemyIndices(enemies, hits, r.damage * mult)
    }
    runtime.cds.r = combatMs + r.cooldownMs
  }

  return kills
}

function tickLuxAbilities(
  px: number,
  py: number,
  combatMs: number,
  mult: number,
  ab: LuxAbilityLevels,
  runtime: SimAbilityRuntime,
  enemies: SimEnemy[],
): number {
  let kills = 0
  const q = resolveLuxQStats(ab.q)
  if (q && combatMs >= runtime.cds.q) {
    const idx = nearestEnemyIndex(enemies, px, py, q.range)
    if (idx >= 0) {
      kills += damageEnemyAt(enemies, idx, q.damage * mult)
      runtime.cds.q = combatMs + q.cooldownMs
    }
  }

  const w = resolveLuxWStats(ab.w)
  if (w && combatMs >= runtime.cds.w) {
    const idx = nearestEnemyIndex(enemies, px, py, w.waveRange)
    if (idx >= 0) {
      const target = enemies[idx]
      const hits = enemiesInRadius(enemies, target.x, target.y, w.waveHitRadius)
      kills += damageEnemyIndices(enemies, hits, w.waveDamage * mult)
      runtime.cds.w = combatMs + w.cooldownMs
    }
  }

  const e = resolveLuxEStats(ab.e)
  if (e && combatMs >= runtime.cds.e) {
    const cluster = densestClusterCenter(enemies, px, py, e.range) ?? {
      x: enemies[0].x,
      y: enemies[0].y,
    }
    runtime.zones.push({
      x: cluster.x,
      y: cluster.y,
      radius: e.radius,
      endCombatMs: combatMs + e.lingerMs,
      dps: (e.damage * mult) / 1.2,
      lastTickCombatMs: combatMs,
    })
    runtime.cds.e = combatMs + e.cooldownMs
  }

  const r = resolveLuxRStats(ab.r)
  if (r && combatMs >= runtime.cds.r) {
    const idx = nearestEnemyIndex(enemies, px, py, r.range)
    if (idx >= 0) {
      const target = enemies[idx]
      const lineHits = enemiesInRadius(enemies, target.x, target.y, r.width * 2)
      kills += damageEnemyIndices(enemies, lineHits, r.damage * mult)
      runtime.cds.r = combatMs + r.cooldownMs
    }
  }

  return kills
}

function tickMissFortuneAbilities(
  px: number,
  py: number,
  combatMs: number,
  mult: number,
  ab: MissFortuneAbilityLevels,
  runtime: SimAbilityRuntime,
  enemies: SimEnemy[],
  facingDx: number,
  facingDy: number,
): number {
  let kills = 0

  const w = resolveMissFortuneWStats(ab.w)
  if (w && combatMs >= runtime.cds.w && combatMs >= runtime.mfWEndCombatMs) {
    runtime.mfWEndCombatMs = combatMs + w.durationMs
    runtime.mfWAttackSpeedMult = w.attackSpeedMult
    runtime.cds.w = combatMs + w.cooldownMs
  }

  const q = resolveMissFortuneQStats(ab.q)
  if (q && combatMs >= runtime.cds.q) {
    const first = nearestEnemyIndex(enemies, px, py, q.range)
    if (first >= 0) {
      kills += damageEnemyAt(enemies, first, q.damage * mult)
      const bounce = nearestEnemyIndex(enemies, px, py, q.bounceRange, first)
      if (bounce >= 0) {
        kills += damageEnemyAt(enemies, bounce, q.damage * mult * 0.85)
      }
      runtime.cds.q = combatMs + q.cooldownMs
    }
  }

  const e = resolveMissFortuneEStats(ab.e)
  if (e && combatMs >= runtime.cds.e) {
    const cluster = densestClusterCenter(enemies, px, py, e.range)
    if (cluster) {
      runtime.zones.push({
        x: cluster.x,
        y: cluster.y,
        radius: e.radius,
        endCombatMs: combatMs + e.durationMs,
        dps: e.damage * mult,
        lastTickCombatMs: combatMs,
      })
      runtime.cds.e = combatMs + e.cooldownMs
    }
  }

  const r = resolveMissFortuneRStats(ab.r)
  if (r && combatMs >= runtime.cds.r) {
    const dirX = facingDx !== 0 || facingDy !== 0 ? facingDx : 1
    const dirY = facingDx !== 0 || facingDy !== 0 ? facingDy : 0
    const cone = enemiesInCone(enemies, px, py, dirX, dirY, r.coneRange, r.coneHalfAngle)
    if (cone.length >= 2) {
      const total = r.waves * r.damagePerWave * mult
      const perTarget = total / cone.length
      kills += damageEnemyIndices(enemies, cone, perTarget)
      runtime.cds.r = combatMs + r.cooldownMs
    }
  }

  return kills
}

function tickLeeSinAbilities(
  px: number,
  py: number,
  combatMs: number,
  mult: number,
  ab: LeeSinAbilityLevels,
  runtime: SimAbilityRuntime,
  enemies: SimEnemy[],
): number {
  let kills = 0
  const q = resolveLeeSinQStats(ab.q)
  if (q && combatMs >= runtime.cds.q) {
    const idx = nearestEnemyIndex(enemies, px, py, q.range)
    if (idx >= 0) {
      kills += damageEnemyAt(enemies, idx, q.damage * mult)
      kills += damageEnemyAt(enemies, idx, q.damage * mult * 0.5)
      runtime.cds.q = combatMs + q.cooldownMs
    }
  }

  if (ab.w > 0 && combatMs >= runtime.cds.w) {
    runtime.leeShieldUntilMs = combatMs + 2200
    runtime.leeShieldHp = 25 + ab.w * 8
    runtime.cds.w = combatMs + 1200
  }

  const e = resolveLeeSinEStats(ab.e)
  if (e && combatMs >= runtime.cds.e) {
    const hits = enemiesInRadius(enemies, px, py, e.radius)
    kills += damageEnemyIndices(enemies, hits, e.damage * mult)
    runtime.cds.e = combatMs + e.cooldownMs
  }

  const r = resolveLeeSinRStats(ab.r)
  if (r && combatMs >= runtime.cds.r) {
    const idx = nearestEnemyIndex(enemies, px, py, r.range)
    if (idx >= 0) {
      const target = enemies[idx]
      kills += damageEnemyAt(enemies, idx, r.damage * mult)
      if (target) {
        const splash = enemiesInRadius(enemies, target.x, target.y, r.knockback * 0.35)
        kills += damageEnemyIndices(enemies, splash, r.damage * mult * 0.35)
      }
      runtime.cds.r = combatMs + r.cooldownMs
    }
  }

  return kills
}

function tickEzrealAbilities(
  px: number,
  py: number,
  combatMs: number,
  mult: number,
  ab: EzrealAbilityLevels,
  runtime: SimAbilityRuntime,
  enemies: SimEnemy[],
  facingDx: number,
  facingDy: number,
): number {
  let kills = 0
  const q = resolveEzrealQStats(ab.q)
  if (q && combatMs >= runtime.cds.q) {
    const first = nearestEnemyIndex(enemies, px, py, q.range)
    if (first >= 0) {
      kills += damageEnemyAt(enemies, first, q.damage * mult)
      let pierce = q.pierce
      let last = first
      while (pierce > 0) {
        const next = nearestEnemyIndex(enemies, px, py, q.range, last)
        if (next < 0) break
        kills += damageEnemyAt(enemies, next, q.damage * mult * 0.92)
        last = next
        pierce -= 1
      }
      runtime.cds.q = combatMs + q.cooldownMs
    }
  }

  const w = resolveEzrealWStats(ab.w)
  if (w && combatMs >= runtime.cds.w) {
    const idx = nearestEnemyIndex(enemies, px, py, w.range)
    if (idx >= 0) {
      const target = enemies[idx]
      const hits = enemiesInRadius(enemies, target.x, target.y, w.radius)
      kills += damageEnemyIndices(enemies, hits, w.damage * mult)
      runtime.cds.w = combatMs + w.cooldownMs
    }
  }

  const e = resolveEzrealEStats(ab.e)
  if (e && combatMs >= runtime.cds.e) {
    const idx = nearestEnemyIndex(enemies, px, py, 360)
    if (idx >= 0) {
      const target = enemies[idx]
      const hits = enemiesInRadius(enemies, target.x, target.y, e.landRadius)
      kills += damageEnemyIndices(enemies, hits, e.damage * mult)
      runtime.cds.e = combatMs + e.cooldownMs
    }
  }

  const r = resolveEzrealRStats(ab.r)
  if (r && combatMs >= runtime.cds.r) {
    const dirX = facingDx !== 0 || facingDy !== 0 ? facingDx : 1
    const dirY = facingDx !== 0 || facingDy !== 0 ? facingDy : 0
    const cone = enemiesInCone(enemies, px, py, dirX, dirY, r.range, 0.35)
    kills += damageEnemyIndices(enemies, cone, r.damage * mult)
    runtime.cds.r = combatMs + r.cooldownMs
  }

  return kills
}

function tickYasuoAbilities(
  px: number,
  py: number,
  combatMs: number,
  mult: number,
  ab: YasuoAbilityLevels,
  runtime: SimAbilityRuntime,
  enemies: SimEnemy[],
  facingDx: number,
  facingDy: number,
): number {
  let kills = 0
  const q = resolveYasuoQStats(ab.q)
  if (q && combatMs >= runtime.cds.q) {
    const dirX = facingDx !== 0 || facingDy !== 0 ? facingDx : 1
    const dirY = facingDx !== 0 || facingDy !== 0 ? facingDy : 0
    const cone = enemiesInCone(enemies, px, py, dirX, dirY, q.range + q.rangeOrigin, 0.55)
    kills += damageEnemyIndices(enemies, cone, q.damage * mult)
    runtime.cds.q = combatMs + q.cooldownMs
  }

  if (ab.e > 0 && combatMs >= runtime.cds.e) {
    const idx = nearestEnemyIndex(enemies, px, py, 320)
    if (idx >= 0) {
      const eStats = resolveYasuoEStats(ab.e)
      if (eStats) {
        kills += damageEnemyAt(enemies, idx, eStats.damage * mult)
        runtime.cds.e = combatMs + eStats.cooldownMs
      }
    }
  }

  const r = resolveYasuoRStats(ab.r)
  if (r && combatMs >= runtime.cds.r) {
    const hits = enemiesInRadius(enemies, px, py, r.radius)
    if (hits.length >= 3) {
      kills += damageEnemyIndices(enemies, hits, r.damage * mult)
      runtime.cds.r = combatMs + r.cooldownMs
    }
  }

  return kills
}
