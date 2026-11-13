import type { MinionPreviewKind } from '../../minionPreview/minionPreviewConstants'
import type { MinionAttackerProfile } from '../enemies/minionRangedCombatConfig'
import type { EnemyArchetypeId } from '../enemies/enemyArchetypes'

export type SimEnemy = {
  x: number
  y: number
  hp: number
  maxHp: number
  speed: number
  radius: number
  archetype: EnemyArchetypeId
  minionKind: MinionPreviewKind
  /** Ranged / siege only. */
  nextShotCombatMs: number
  windupEndCombatMs: number
  pendingShotX: number
  pendingShotY: number
}

export type SimEnemyProjectile = {
  x: number
  y: number
  vx: number
  vy: number
  damage: number
  radius: number
  lifeMs: number
}

export type SimDamageZone = {
  x: number
  y: number
  radius: number
  endCombatMs: number
  dps: number
  lastTickCombatMs: number
}

export type SimAbilityCd = {
  q: number
  w: number
  e: number
  r: number
}
