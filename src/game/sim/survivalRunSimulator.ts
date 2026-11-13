import type { ChampionId } from '../champions/types'
import {
  PLAYER_RADIUS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants'
import { ENEMY_ARCHETYPES, type EnemyArchetypeId } from '../enemies/enemyArchetypes'
import {
  getMinionAttackerProfile,
  type MinionAttackerProfile,
} from '../enemies/minionRangedCombatConfig'
import {
  applyExperience,
  STARTING_LEVEL,
  XP_CRYSTAL_VALUE,
  type XpState,
} from '../experience'
import { computeRunCoinReward } from '../meta/runCoinReward'
import {
  createInitialCombatStats,
  type PlayerCombatStats,
} from '../playerStats'
import {
  DEV_TARGET_RUN_MS,
  SURVIVAL_SPAWN,
  resolveMaxAliveEnemies,
  resolveSpawnIntervalMs,
} from '../run/survivalRunConfig'
import { resolveSplashDamage, type JinxWeaponId } from '../combat/jinxWeapons'
import {
  createSimAbilityRuntime,
  tickChampionAbilities,
  tickDamageZones,
} from './simAbilityCombat'
import {
  createSimAbilityLoadout,
  type SimAbilityLoadout,
  type SimAbilityStartMode,
} from './simChampionInit'
import { resolveChampionBasicSnapshot } from './simChampionCombat'
import { damageEnemyAt, damageEnemyIndices, nearestEnemyIndex, enemiesInRadius } from './simGeo'
import { rollMinionVisualForArchetypeSeeded } from './simMinionRoll'
import { mulberry32 } from './simRandom'
import {
  applySimUpgradePick,
  buildOfferContext,
  loadoutFromUpgradeState,
  pickSimUpgrade,
  type SimUpgradePolicy,
} from './simUpgradePicker'
import { createInitialUpgradeRunState } from '../upgradeRunState'
import type { SimEnemy, SimEnemyProjectile } from './simTypes'

const WORLD_PAD = 40
const TICK_MS = 50
const CONTACT_DAMAGE = 10
const CONTACT_IFRAME_MS = 800
const SPAWN_DIST_MIN = 520
const SPAWN_DIST_EXTRA = 100
const KITE_REPEL_RADIUS = 220

export type SimPlayerBehavior = 'kite' | 'stand'

export type SurvivalSimConfig = {
  maxCombatMs?: number
  seed?: number
  stats?: PlayerCombatStats
  behavior?: SimPlayerBehavior
  championId?: ChampionId
  upgradePolicy?: SimUpgradePolicy
  abilityStart?: SimAbilityStartMode
  /** Jinx alterna Fishbones cada N ms (0 = solo Pow-Pow). */
  jinxFishbonesEveryMs?: number
}

export type SurvivalSimResult = {
  survived: boolean
  combatMs: number
  kills: number
  coins: number
  playerHpLeft: number
  peakEnemiesAlive: number
  ticks: number
  level: number
  upgradePicks: number
  championId: ChampionId
  damageTaken: number
}

type SimRand = () => number

function clampWorld(x: number, y: number) {
  return {
    x: Math.max(WORLD_PAD, Math.min(WORLD_WIDTH - WORLD_PAD, x)),
    y: Math.max(WORLD_PAD, Math.min(WORLD_HEIGHT - WORLD_PAD, y)),
  }
}

function spawnPos(playerX: number, playerY: number, rand: SimRand) {
  const angle = rand() * Math.PI * 2
  const dist = SPAWN_DIST_MIN + rand() * SPAWN_DIST_EXTRA
  return clampWorld(playerX + Math.cos(angle) * dist, playerY + Math.sin(angle) * dist)
}

const ARCHETYPE_WEIGHTS: { id: EnemyArchetypeId; weight: number }[] = [
  { id: 'basic', weight: 0.5 },
  { id: 'fast', weight: 0.3 },
  { id: 'tank', weight: 0.2 },
]

function rollArchetype(rand: SimRand): EnemyArchetypeId {
  let roll = rand()
  for (const entry of ARCHETYPE_WEIGHTS) {
    roll -= entry.weight
    if (roll <= 0) return entry.id
  }
  return 'basic'
}

function spawnEnemy(playerX: number, playerY: number, rand: SimRand): SimEnemy {
  const id = rollArchetype(rand)
  const cfg = ENEMY_ARCHETYPES[id]
  const minionKind = rollMinionVisualForArchetypeSeeded(id, rand)
  const { x, y } = spawnPos(playerX, playerY, rand)
  return {
    x,
    y,
    hp: cfg.maxHealth,
    maxHp: cfg.maxHealth,
    speed: cfg.speedMin + rand() * (cfg.speedMax - cfg.speedMin),
    radius: cfg.radius,
    archetype: id,
    minionKind,
    nextShotCombatMs: 400,
    windupEndCombatMs: 0,
    pendingShotX: playerX,
    pendingShotY: playerY,
  }
}

function tickRangedMinion(
  enemy: SimEnemy,
  profile: MinionAttackerProfile,
  combatMs: number,
  step: number,
  moveSpeed: number,
  playerX: number,
  playerY: number,
  projectiles: SimEnemyProjectile[],
) {
  const dx = playerX - enemy.x
  const dy = playerY - enemy.y
  const distSq = dx * dx + dy * dy
  const rangeSq = profile.range * profile.range
  const distance = distSq > 0 ? Math.sqrt(distSq) : 0

  if (enemy.windupEndCombatMs > 0 && combatMs >= enemy.windupEndCombatMs) {
    const tx = enemy.pendingShotX
    const ty = enemy.pendingShotY
    const sx = tx - enemy.x
    const sy = ty - enemy.y
    const slen = Math.hypot(sx, sy) || 1
    const spd = profile.projectileSpeed
    projectiles.push({
      x: enemy.x,
      y: enemy.y,
      vx: (sx / slen) * spd,
      vy: (sy / slen) * spd,
      damage: profile.damage,
      radius: profile.projectileRadius,
      lifeMs: profile.maxProjectileLifeMs,
    })
    enemy.windupEndCombatMs = 0
    enemy.nextShotCombatMs = combatMs + profile.fireIntervalMs
    return
  }

  if (enemy.windupEndCombatMs > 0) {
    return
  }

  if (distSq > rangeSq) {
    if (distance > 0) {
      enemy.x += (dx / distance) * moveSpeed * step
      enemy.y += (dy / distance) * moveSpeed * step
    }
    return
  }

  if (combatMs >= enemy.nextShotCombatMs) {
    enemy.pendingShotX = playerX
    enemy.pendingShotY = playerY
    enemy.windupEndCombatMs = combatMs + profile.windupMs
    return
  }

  const creep =
    distance > profile.range * 0.55 && distance > 0 ? moveSpeed * 0.22 * step : 0
  if (creep > 0) {
    enemy.x += (dx / distance) * creep
    enemy.y += (dy / distance) * creep
  }
}

function applyPlayerDamage(
  amount: number,
  combatMs: number,
  invulnUntil: number,
  leeShieldUntilMs: number,
  leeShieldHp: number,
): {
  hpDelta: number
  invulnUntil: number
  leeShieldUntilMs: number
  leeShieldHp: number
  taken: number
} {
  if (combatMs < invulnUntil || amount <= 0) {
    return {
      hpDelta: 0,
      invulnUntil,
      leeShieldUntilMs,
      leeShieldHp,
      taken: 0,
    }
  }

  let remaining = amount
  if (combatMs < leeShieldUntilMs && leeShieldHp > 0) {
    const absorbed = Math.min(leeShieldHp, remaining)
    leeShieldHp -= absorbed
    remaining -= absorbed
  }

  if (remaining <= 0) {
    return { hpDelta: 0, invulnUntil, leeShieldUntilMs, leeShieldHp, taken: amount }
  }

  return {
    hpDelta: -remaining,
    invulnUntil: combatMs + CONTACT_IFRAME_MS,
    leeShieldUntilMs,
    leeShieldHp,
    taken: amount,
  }
}

function onEnemyKill(
  kills: number,
  xpState: XpState,
  championId: ChampionId,
  upgradeRun: ReturnType<typeof createInitialUpgradeRunState>,
  upgradePickCount: number,
  policy: SimUpgradePolicy,
  rand: SimRand,
): {
  kills: number
  xpState: XpState
  upgradeRun: ReturnType<typeof createInitialUpgradeRunState>
  upgradePickCount: number
} {
  const xpApplied = applyExperience(xpState, XP_CRYSTAL_VALUE)
  let nextRun = upgradeRun
  let nextPickCount = upgradePickCount

  for (let g = 0; g < xpApplied.levelsGained; g += 1) {
    const ctx = buildOfferContext(
      championId,
      nextRun,
      nextPickCount,
      xpApplied.level,
    )
    const pick = pickSimUpgrade(policy, rand, ctx)
    nextRun = applySimUpgradePick(pick, nextRun)
    nextPickCount += 1
  }

  return {
    kills: kills + 1,
    xpState: { level: xpApplied.level, xp: xpApplied.xp },
    upgradeRun: nextRun,
    upgradePickCount: nextPickCount,
  }
}

function resolveJinxWeapon(
  combatMs: number,
  jinxFishbonesEveryMs: number,
): JinxWeaponId {
  if (jinxFishbonesEveryMs <= 0) return 'powPow'
  const phase = Math.floor(combatMs / jinxFishbonesEveryMs) % 2
  return phase === 1 ? 'fishbones' : 'powPow'
}

/** Simulación headless de una partida survivor (spawn, XP, mejoras, básicos, habilidades, ranged). */
export function runSurvivalSimulation(config: SurvivalSimConfig = {}): SurvivalSimResult {
  const rand: SimRand =
    config.seed !== undefined ? mulberry32(config.seed) : () => Math.random()
  const championId = config.championId ?? 'jinx'
  let stats = config.stats ?? createInitialCombatStats()
  const behavior = config.behavior ?? 'kite'
  const maxCombatMs = config.maxCombatMs ?? DEV_TARGET_RUN_MS
  const policy = config.upgradePolicy ?? 'greedy'
  const abilityStart = config.abilityStart ?? 'production'
  const jinxFishbonesEveryMs = config.jinxFishbonesEveryMs ?? 7000

  const abilityStartLoadout = createSimAbilityLoadout(abilityStart)
  let upgradeRun = createInitialUpgradeRunState(stats, stats.maxHealth)
  upgradeRun = {
    ...upgradeRun,
    abilities: abilityStartLoadout.jinx,
    ahriAbilities: abilityStartLoadout.ahri,
    luxAbilities: abilityStartLoadout.lux,
    missFortuneAbilities: abilityStartLoadout.missFortune,
    leeSinAbilities: abilityStartLoadout.leeSin,
    yasuoAbilities: abilityStartLoadout.yasuo,
    ezrealAbilities: abilityStartLoadout.ezreal,
  }
  let loadout = loadoutFromUpgradeState(upgradeRun)
  const abilityRuntime = createSimAbilityRuntime()

  let px = WORLD_WIDTH * 0.5
  let py = WORLD_HEIGHT * 0.5
  let playerHp = upgradeRun.health
  let kills = 0
  let combatMs = 0
  let nextSpawnAt = SURVIVAL_SPAWN.firstDelayMs
  let nextShotAt = 0
  let invulnUntil = 0
  let peakAlive = 0
  let ticks = 0
  let upgradePickCount = 0
  let damageTaken = 0
  let xpState: XpState = { level: STARTING_LEVEL, xp: 0 }
  let facingDx = 1
  let facingDy = 0

  const enemies: SimEnemy[] = []
  const enemyProjectiles: SimEnemyProjectile[] = []

  const recordKill = () => {
    const applied = onEnemyKill(
      kills,
      xpState,
      championId,
      upgradeRun,
      upgradePickCount,
      policy,
      rand,
    )
    kills = applied.kills
    xpState = applied.xpState
    upgradeRun = applied.upgradeRun
    stats = upgradeRun.stats
    playerHp = Math.min(upgradeRun.health, stats.maxHealth)
    loadout = loadoutFromUpgradeState(upgradeRun)
    upgradePickCount = applied.upgradePickCount
  }

  while (combatMs < maxCombatMs && playerHp > 0) {
    ticks += 1
    combatMs += TICK_MS
    const step = TICK_MS / 1000

    const maxAlive = resolveMaxAliveEnemies(combatMs)
    if (combatMs >= nextSpawnAt && enemies.length < maxAlive) {
      enemies.push(spawnEnemy(px, py, rand))
      nextSpawnAt = combatMs + resolveSpawnIntervalMs(combatMs)
    }
    peakAlive = Math.max(peakAlive, enemies.length)

    if (behavior === 'kite') {
      let rx = 0
      let ry = 0
      for (const e of enemies) {
        const dx = px - e.x
        const dy = py - e.y
        const d = Math.hypot(dx, dy)
        if (d > 0 && d < KITE_REPEL_RADIUS) {
          rx += dx / d
          ry += dy / d
        }
      }
      const len = Math.hypot(rx, ry)
      if (len > 0) {
        const moveStep = (stats.moveSpeed * TICK_MS) / 1000
        const p = clampWorld(px + (rx / len) * moveStep, py + (ry / len) * moveStep)
        px = p.x
        py = p.y
      }
    }

    for (const e of enemies) {
      const profile = getMinionAttackerProfile(e.minionKind)
      if (profile) {
        tickRangedMinion(e, profile, combatMs, step, e.speed, px, py, enemyProjectiles)
      } else {
        const dx = px - e.x
        const dy = py - e.y
        const d = Math.hypot(dx, dy)
        if (d > 0) {
          e.x += (dx / d) * e.speed * step
          e.y += (dy / d) * e.speed * step
        }
      }

      const dx = px - e.x
      const dy = py - e.y
      const touch = PLAYER_RADIUS + e.radius
      if (dx * dx + dy * dy < touch * touch) {
        const hit = applyPlayerDamage(
          CONTACT_DAMAGE,
          combatMs,
          invulnUntil,
          abilityRuntime.leeShieldUntilMs,
          abilityRuntime.leeShieldHp,
        )
        playerHp = Math.max(0, playerHp + hit.hpDelta)
        invulnUntil = hit.invulnUntil
        abilityRuntime.leeShieldHp = hit.leeShieldHp
        damageTaken += hit.taken
      }
    }

    for (let p = enemyProjectiles.length - 1; p >= 0; p -= 1) {
      const proj = enemyProjectiles[p]
      proj.lifeMs -= TICK_MS
      if (proj.lifeMs <= 0) {
        enemyProjectiles.splice(p, 1)
        continue
      }
      proj.x += proj.vx * step
      proj.y += proj.vy * step
      const pdx = px - proj.x
      const pdy = py - proj.y
      const hitR = PLAYER_RADIUS + proj.radius
      if (pdx * pdx + pdy * pdy <= hitR * hitR) {
        const hit = applyPlayerDamage(
          proj.damage,
          combatMs,
          invulnUntil,
          abilityRuntime.leeShieldUntilMs,
          abilityRuntime.leeShieldHp,
        )
        playerHp = Math.max(0, playerHp + hit.hpDelta)
        invulnUntil = hit.invulnUntil
        abilityRuntime.leeShieldHp = hit.leeShieldHp
        damageTaken += hit.taken
        enemyProjectiles.splice(p, 1)
      }
    }

    const nearest = nearestEnemyIndex(enemies, px, py)
    if (nearest >= 0) {
      facingDx = enemies[nearest].x - px
      facingDy = enemies[nearest].y - py
    }

    let abilityKills = tickChampionAbilities(
      championId,
      px,
      py,
      combatMs,
      stats,
      loadout,
      abilityRuntime,
      enemies,
      facingDx,
      facingDy,
    )
    while (abilityKills > 0) {
      recordKill()
      abilityKills -= 1
    }

    abilityKills = tickDamageZones(
      abilityRuntime.zones,
      combatMs,
      TICK_MS,
      enemies,
    )
    while (abilityKills > 0) {
      recordKill()
      abilityKills -= 1
    }

    const jinxWeapon =
      championId === 'jinx' ? resolveJinxWeapon(combatMs, jinxFishbonesEveryMs) : 'powPow'
    const mfIntervalMult =
      championId === 'missfortune' ? abilityRuntime.mfWAttackSpeedMult : 1
    const basic = resolveChampionBasicSnapshot(championId, stats, {
      jinxWeapon,
      attackIntervalMult: mfIntervalMult,
    })

    if (combatMs >= nextShotAt) {
      const idx = nearestEnemyIndex(enemies, px, py, basic.range)
      if (idx >= 0) {
        for (let shot = 0; shot < basic.projectileCount; shot += 1) {
          if (damageEnemyAt(enemies, idx, basic.damage) > 0) {
            recordKill()
          }
        }
        if (basic.splashRadius > 0 && basic.splashDamage > 0) {
          const target = enemies[idx]
          const centerX = target?.x ?? px
          const centerY = target?.y ?? py
          const splashHits = enemiesInRadius(enemies, centerX, centerY, basic.splashRadius)
          const splashDmg =
            championId === 'jinx'
              ? resolveSplashDamage(stats, 'fishbones')
              : basic.splashDamage
          const splashKills = damageEnemyIndices(enemies, splashHits, splashDmg)
          for (let s = 0; s < splashKills; s += 1) recordKill()
        }
      }
      nextShotAt = combatMs + basic.intervalMs
    }
  }

  return {
    survived: playerHp > 0,
    combatMs,
    kills,
    coins: computeRunCoinReward(kills, combatMs),
    playerHpLeft: playerHp,
    peakEnemiesAlive: peakAlive,
    ticks,
    level: xpState.level,
    upgradePicks: upgradePickCount,
    championId,
    damageTaken,
  }
}

export type SurvivalBatchSummary = {
  runs: number
  survived: number
  avgCombatMs: number
  avgKills: number
  avgCoins: number
  avgLevel: number
  avgUpgradePicks: number
  medianCombatMs: number
  p10CombatMs: number
  p90CombatMs: number
  championId: ChampionId
}

export function runSurvivalBatch(
  runs: number,
  config: SurvivalSimConfig = {},
): { results: SurvivalSimResult[]; summary: SurvivalBatchSummary } {
  const results: SurvivalSimResult[] = []
  for (let i = 0; i < runs; i += 1) {
    const seed = config.seed !== undefined ? config.seed + i : undefined
    results.push(runSurvivalSimulation({ ...config, seed }))
  }

  const times = results.map((r) => r.combatMs).sort((a, b) => a - b)
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1)
  const pct = (p: number) =>
    times[Math.min(times.length - 1, Math.floor(p * (times.length - 1)))] ?? 0

  return {
    results,
    summary: {
      runs,
      survived: results.filter((r) => r.survived).length,
      avgCombatMs: avg(times),
      avgKills: avg(results.map((r) => r.kills)),
      avgCoins: avg(results.map((r) => r.coins)),
      avgLevel: avg(results.map((r) => r.level)),
      avgUpgradePicks: avg(results.map((r) => r.upgradePicks)),
      medianCombatMs: pct(0.5),
      p10CombatMs: pct(0.1),
      p90CombatMs: pct(0.9),
      championId: config.championId ?? 'jinx',
    },
  }
}
