import type * as Phaser from 'phaser'
import type { ArenaEnemy } from '../enemies/enemyFactory'
import type { AhriQOrbVisual } from '../vfx/ahri/ahriSpellVisuals'
import type { QAbilityStats } from './ahriAbilityState'

export type AhriOrbPhase = 'out' | 'return'

export type AhriOrbProjectile = {
  visual: Phaser.GameObjects.Container
  qVisual: AhriQOrbVisual
  phase: AhriOrbPhase
  vx: number
  vy: number
  speed: number
  remainingMs: number
  lastDepth: number
  damage: number
  hitRadius: number
  hit: WeakSet<ArenaEnemy>
  /** Posición del jugador al lanzar (retorno). */
  homeX: number
  homeY: number
  trailAccumMs: number
}

export function createAhriOrbFromStats(
  stats: QAbilityStats,
): Pick<
  AhriOrbProjectile,
  'speed' | 'remainingMs' | 'damage' | 'hitRadius'
> & { returnSpeed: number } {
  return {
    speed: stats.speed,
    returnSpeed: stats.returnSpeed,
    remainingMs: stats.outboundMs,
    damage: stats.damage,
    hitRadius: stats.hitRadius,
  }
}
