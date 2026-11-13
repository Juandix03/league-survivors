import * as Phaser from 'phaser'
import {
  ENEMY_ARCHETYPES,
  rollEnemyArchetype,
  resolveArchetypeSpeed,
  type EnemyArchetypeId,
} from './enemyArchetypes'
import {
  bakedAnimKey,
  BAKED_FRAME,
  getBakedSheetDef,
} from '../../minionPreview/bakedMinionAssets'
import type { MinionPreviewKind } from '../../minionPreview/minionPreviewConstants'
import {
  minionSpriteScaleForRadius,
  rollMinionVisualForArchetype,
} from './minionVisualConfig'
import {
  createDefaultMinionFacing,
  syncMinionEnemyAnimation,
  type MinionFacingState,
} from './syncMinionEnemyAnim'
import {
  getMinionAttackerProfile,
  type MinionAttackerProfile,
} from './minionRangedCombatConfig'

const HP_BAR_HEIGHT = 4
const HP_BAR_OFFSET_Y = 8

export type ArenaEnemy = {
  visual: Phaser.GameObjects.Container
  archetypeId: EnemyArchetypeId
  minionKind: MinionPreviewKind
  sprite?: Phaser.GameObjects.Sprite
  health: number
  maxHealth: number
  speed: number
  radius: number
  lastDepth: number
  slowUntil: number
  slowMultiplier: number
  /** Hechizo (E): no persigue ni dispara al jugador. */
  charmedUntil: number
  hpBarBg: Phaser.GameObjects.Rectangle
  hpBarFill: Phaser.GameObjects.Rectangle
  hpBarMaxWidth: number
  facing: MinionFacingState
  /** Tiempo de combate (ms) hasta próximo disparo ranged/siege. */
  nextShotCombatMs: number
  /** Fin de windup; 0 = no disparando. */
  windupEndCombatMs: number
  pendingShotX: number
  pendingShotY: number
  /** Cache en spawn; evita lookup por frame en IA ranged/siege. */
  attackerProfile: MinionAttackerProfile | null
}

function hpBarWidthForRadius(radius: number) {
  return Math.max(22, Math.round(radius * 1.85))
}

export function syncEnemyHpBar(enemy: ArenaEnemy) {
  const ratio = Phaser.Math.Clamp(enemy.health / enemy.maxHealth, 0, 1)
  enemy.hpBarFill.setSize(enemy.hpBarMaxWidth * ratio, HP_BAR_HEIGHT)
}

function spawnProceduralFallback(
  scene: Phaser.Scene,
  config: (typeof ENEMY_ARCHETYPES)[EnemyArchetypeId],
) {
  const body = scene.add.circle(0, 0, config.radius, config.bodyColor, 1)
  body.setStrokeStyle(config.strokeWidth, config.strokeColor, 1)

  const eyeOffsetX = config.radius * 0.35
  const eyeOffsetY = -config.radius * 0.2
  const eyeR = Math.max(2, config.radius * 0.2)
  const leftEye = scene.add.circle(-eyeOffsetX, eyeOffsetY, eyeR, config.eyeColor, 1)
  const rightEye = scene.add.circle(eyeOffsetX, eyeOffsetY, eyeR, config.eyeColor, 1)
  return [body, leftEye, rightEye] as Phaser.GameObjects.GameObject[]
}

export function spawnArenaEnemy(
  scene: Phaser.Scene,
  x: number,
  y: number,
  archetypeId: EnemyArchetypeId = rollEnemyArchetype(),
): ArenaEnemy {
  const config = ENEMY_ARCHETYPES[archetypeId]
  const minionKind = rollMinionVisualForArchetype(archetypeId)
  const sheetDef = getBakedSheetDef(minionKind)
  const barW = hpBarWidthForRadius(config.radius)
  const barY = -config.radius - HP_BAR_OFFSET_Y

  const shadow = scene.add.ellipse(
    0,
    config.radius * 0.72,
    config.shadowW,
    config.shadowH,
    0x160c20,
    0.4,
  )

  let sprite: Phaser.GameObjects.Sprite | undefined
  const children: Phaser.GameObjects.GameObject[] = [shadow]

  if (sheetDef && scene.textures.exists(sheetDef.sheetKey)) {
    sprite = scene.add.sprite(0, 0, sheetDef.sheetKey, 0)
    sprite.setOrigin(0.5, BAKED_FRAME.originY)
    sprite.setScale(minionSpriteScaleForRadius(config.radius, minionKind))
    const idleKey = bakedAnimKey(minionKind, 'idle')
    if (scene.anims.exists(idleKey)) {
      sprite.play(idleKey, true)
    }
    children.push(sprite)
  } else {
    children.push(...spawnProceduralFallback(scene, config))
  }

  const hpBarBg = scene.add.rectangle(-barW / 2, barY, barW, HP_BAR_HEIGHT, 0x0f172a, 0.78)
  hpBarBg.setOrigin(0, 0.5)
  hpBarBg.setStrokeStyle(1, 0x334155, 0.9)

  const hpBarFill = scene.add.rectangle(-barW / 2, barY, barW, HP_BAR_HEIGHT, 0x4ade80, 1)
  hpBarFill.setOrigin(0, 0.5)

  children.push(hpBarBg, hpBarFill)

  const visual = scene.add.container(x, y, children)
  visual.setDepth(y)

  const attackerProfile = getMinionAttackerProfile(minionKind)

  const enemy: ArenaEnemy = {
    visual,
    archetypeId,
    minionKind,
    sprite,
    health: config.maxHealth,
    maxHealth: config.maxHealth,
    speed: resolveArchetypeSpeed(config),
    radius: config.radius,
    lastDepth: Math.floor(y),
    slowUntil: 0,
    slowMultiplier: 1,
    charmedUntil: 0,
    hpBarBg,
    hpBarFill,
    hpBarMaxWidth: barW,
    facing: createDefaultMinionFacing(),
    attackerProfile,
    nextShotCombatMs: attackerProfile
      ? Math.floor(Math.random() * attackerProfile.fireIntervalMs)
      : 0,
    windupEndCombatMs: 0,
    pendingShotX: 0,
    pendingShotY: 0,
  }

  syncEnemyHpBar(enemy)
  return enemy
}

/** Llamar tras mover al enemigo (ArenaScene). `towardX/Y` = jugador − enemigo. */
export function syncArenaEnemyMotionAnim(
  enemy: ArenaEnemy,
  towardX: number,
  towardY: number,
  distance: number,
  movingOverride?: boolean,
) {
  if (!enemy.sprite) {
    return
  }
  const moving = movingOverride ?? distance > 0.5
  enemy.facing = syncMinionEnemyAnimation(
    enemy.sprite,
    enemy.minionKind,
    towardX,
    towardY,
    distance,
    enemy.facing,
    moving,
  )
}
