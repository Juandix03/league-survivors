/**
 * Instrumentación mínima para pruebas de balance (ver DEV_TARGET_RUN_MS en survivalRunConfig).
 * No afecta gameplay; ArenaScene solo llama estos hooks con `?balance=1` en dev.
 */

import { isBalanceRunDebugEnabled } from '../devConfig'

export type BalanceDebugLive = {
  combatElapsedMs: number
  level: number
  kills: number
  aliveEnemies: number
  levelUpsTotal: number
  health: number
  maxHealth: number
  projectileDamage: number
  attackIntervalMs: number
}

export type BalanceTimelineSample = {
  combatSec: number
  level: number
  kills: number
  alive: number
  health: number
  projectileDamage: number
}

export type BalanceRunSummary = {
  reason: 'game_over'
  combatElapsedMs: number
  finalLevel: number
  totalKills: number
  levelUpsTotal: number
  maxAliveEnemies: number
  finalHealth: number
  maxHealth: number
  finalProjectileDamage: number
  finalAttackIntervalMs: number
  timeline: BalanceTimelineSample[]
}

const SAMPLE_INTERVAL_MS = 30_000

type RecorderState = {
  active: boolean
  levelUpsTotal: number
  maxAliveEnemies: number
  lastSampleCombatMs: number
  timeline: BalanceTimelineSample[]
  live: BalanceDebugLive | null
  summary: BalanceRunSummary | null
}

const state: RecorderState = {
  active: false,
  levelUpsTotal: 0,
  maxAliveEnemies: 0,
  lastSampleCombatMs: -SAMPLE_INTERVAL_MS,
  timeline: [],
  live: null,
  summary: null,
}

function enabled() {
  return isBalanceRunDebugEnabled()
}

function pushTimelineSample(live: BalanceDebugLive) {
  state.timeline.push({
    combatSec: Math.round(live.combatElapsedMs / 1000),
    level: live.level,
    kills: live.kills,
    alive: live.aliveEnemies,
    health: live.health,
    projectileDamage: live.projectileDamage,
  })
}

export function resetBalanceRunRecorder() {
  if (!enabled()) return
  state.active = true
  state.levelUpsTotal = 0
  state.maxAliveEnemies = 0
  state.lastSampleCombatMs = -SAMPLE_INTERVAL_MS
  state.timeline = []
  state.live = null
  state.summary = null
}

export function recordBalanceLevelUps(count: number) {
  if (!enabled() || !state.active || count <= 0) return
  state.levelUpsTotal += count
}

export type BalanceRunTickInput = {
  combatElapsedMs: number
  level: number
  kills: number
  aliveEnemies: number
  health: number
  maxHealth: number
  projectileDamage: number
  attackIntervalMs: number
}

/** Llamar desde emitHud (~250 ms), no cada frame de Phaser. */
export function tickBalanceRunRecorder(input: BalanceRunTickInput) {
  if (!enabled() || !state.active || state.summary) return

  state.maxAliveEnemies = Math.max(state.maxAliveEnemies, input.aliveEnemies)

  const live: BalanceDebugLive = {
    combatElapsedMs: input.combatElapsedMs,
    level: input.level,
    kills: input.kills,
    aliveEnemies: input.aliveEnemies,
    levelUpsTotal: state.levelUpsTotal,
    health: input.health,
    maxHealth: input.maxHealth,
    projectileDamage: input.projectileDamage,
    attackIntervalMs: input.attackIntervalMs,
  }
  state.live = live

  if (state.timeline.length === 0) {
    pushTimelineSample(live)
    state.lastSampleCombatMs = input.combatElapsedMs
  } else if (
    input.combatElapsedMs - state.lastSampleCombatMs >=
    SAMPLE_INTERVAL_MS
  ) {
    pushTimelineSample(live)
    state.lastSampleCombatMs = input.combatElapsedMs
  }
}

export function finalizeBalanceRunRecorder(input: BalanceRunTickInput) {
  if (!enabled() || !state.active) return
  tickBalanceRunRecorder(input)

  const live = state.live
  if (!live) return

  if (
    state.timeline.length === 0 ||
    state.timeline[state.timeline.length - 1]!.combatSec !==
      Math.round(input.combatElapsedMs / 1000)
  ) {
    pushTimelineSample({
      ...live,
      combatElapsedMs: input.combatElapsedMs,
      level: input.level,
      kills: input.kills,
      aliveEnemies: input.aliveEnemies,
      health: input.health,
      maxHealth: input.maxHealth,
      projectileDamage: input.projectileDamage,
      attackIntervalMs: input.attackIntervalMs,
    })
  }

  state.summary = {
    reason: 'game_over',
    combatElapsedMs: input.combatElapsedMs,
    finalLevel: input.level,
    totalKills: input.kills,
    levelUpsTotal: state.levelUpsTotal,
    maxAliveEnemies: state.maxAliveEnemies,
    finalHealth: input.health,
    maxHealth: input.maxHealth,
    finalProjectileDamage: input.projectileDamage,
    finalAttackIntervalMs: input.attackIntervalMs,
    timeline: [...state.timeline],
  }
  state.active = false
}

export function getBalanceDebugLive(): BalanceDebugLive | null {
  return enabled() ? state.live : null
}

export function getBalanceRunSummary(): BalanceRunSummary | null {
  return enabled() ? state.summary : null
}

export function formatBalanceRunSummaryText(summary: BalanceRunSummary): string {
  const min = Math.floor(summary.combatElapsedMs / 60000)
  const sec = Math.floor((summary.combatElapsedMs % 60000) / 1000)
  const lines = [
    'League Survivors — balance run summary',
    `combat_time: ${min}:${String(sec).padStart(2, '0')} (${summary.combatElapsedMs} ms)`,
    `level: ${summary.finalLevel}`,
    `kills: ${summary.totalKills}`,
    `level_ups: ${summary.levelUpsTotal}`,
    `max_alive_enemies: ${summary.maxAliveEnemies}`,
    `health: ${summary.finalHealth}/${summary.maxHealth}`,
    `projectile_damage: ${summary.finalProjectileDamage.toFixed(2)}`,
    `attack_interval_ms: ${Math.round(summary.finalAttackIntervalMs)}`,
    '',
    'timeline (combat sec, level, kills, alive, hp, dmg):',
    ...summary.timeline.map(
      (s) =>
        `  ${s.combatSec}s | L${s.level} | kills ${s.kills} | alive ${s.alive} | hp ${s.health} | dmg ${s.projectileDamage.toFixed(2)}`,
    ),
  ]
  return lines.join('\n')
}

export function formatBalanceRunSummaryJson(summary: BalanceRunSummary): string {
  return JSON.stringify(summary, null, 2)
}
