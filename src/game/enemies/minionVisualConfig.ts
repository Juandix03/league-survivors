import type { MinionPreviewKind } from '../../minionPreview/minionPreviewConstants'
import type { EnemyArchetypeId } from './enemyArchetypes'

/** Política de animación según el bake real (evitar Win1 / Attack1 en movimiento). */
export type MinionMoveAnimStyle = 'directionalWalk' | 'idleWhileMoving'

export type MinionVisualConfig = {
  moveStyle: MinionMoveAnimStyle
  /** Escala visual relativa al radio del arquetipo (no altera hitbox). */
  displayScaleMul: number
  /** No usar fila de perfil (bake lateral se ve mal en supers). */
  avoidSideProfile?: boolean
}

export const MINION_VISUAL_BY_KIND: Record<MinionPreviewKind, MinionVisualConfig> = {
  orderMelee: { moveStyle: 'directionalWalk', displayScaleMul: 1.05 },
  chaosMelee: { moveStyle: 'idleWhileMoving', displayScaleMul: 1.05 },
  orderRanged: { moveStyle: 'idleWhileMoving', displayScaleMul: 1.0 },
  chaosRanged: { moveStyle: 'idleWhileMoving', displayScaleMul: 1.0 },
  orderSiege: { moveStyle: 'directionalWalk', displayScaleMul: 0.95 },
  chaosSiege: { moveStyle: 'directionalWalk', displayScaleMul: 0.95 },
  orderSuper: {
    moveStyle: 'directionalWalk',
    displayScaleMul: 1.1,
    avoidSideProfile: true,
  },
  chaosSuper: {
    moveStyle: 'directionalWalk',
    displayScaleMul: 1.1,
    avoidSideProfile: true,
  },
}

/** Referencia preview (radio ~14) → escala arena por radio de arquetipo. */
export const MINION_VISUAL_RADIUS_REF = 14
export const MINION_VISUAL_SCALE_REF = 1.05

export function minionSpriteScaleForRadius(
  hitboxRadius: number,
  kind: MinionPreviewKind,
): number {
  const cfg = MINION_VISUAL_BY_KIND[kind]
  return (hitboxRadius / MINION_VISUAL_RADIUS_REF) * MINION_VISUAL_SCALE_REF * cfg.displayScaleMul
}

/**
 * Arquetipo de gameplay → modelo SR (8 variantes, probabilidad de equipo 50/50).
 * Tank: mayoría siege, minoría super (sin cambiar pesos de spawn de arquetipos).
 */
export function rollMinionVisualForArchetype(archetypeId: EnemyArchetypeId): MinionPreviewKind {
  const order = Math.random() < 0.5
  switch (archetypeId) {
    case 'basic':
      return order ? 'orderMelee' : 'chaosMelee'
    case 'fast':
      return order ? 'orderRanged' : 'chaosRanged'
    case 'tank':
      if (Math.random() < 0.72) {
        return order ? 'orderSiege' : 'chaosSiege'
      }
      return order ? 'orderSuper' : 'chaosSuper'
    default:
      return order ? 'orderMelee' : 'chaosMelee'
  }
}
