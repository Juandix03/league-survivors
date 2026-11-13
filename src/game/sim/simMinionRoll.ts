import type { MinionPreviewKind } from '../../minionPreview/minionPreviewConstants'
import type { EnemyArchetypeId } from '../enemies/enemyArchetypes'

export function rollMinionVisualForArchetypeSeeded(
  archetypeId: EnemyArchetypeId,
  rand: () => number,
): MinionPreviewKind {
  const order = rand() < 0.5
  switch (archetypeId) {
    case 'basic':
      return order ? 'orderMelee' : 'chaosMelee'
    case 'fast':
      return order ? 'orderRanged' : 'chaosRanged'
    case 'tank':
      if (rand() < 0.72) {
        return order ? 'orderSiege' : 'chaosSiege'
      }
      return order ? 'orderSuper' : 'chaosSuper'
    default:
      return order ? 'orderMelee' : 'chaosMelee'
  }
}
