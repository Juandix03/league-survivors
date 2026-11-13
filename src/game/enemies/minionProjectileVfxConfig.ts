import type { MinionPreviewKind } from '../../minionPreview/minionPreviewConstants'

const BASE = '/assets/vfx/minions/projectiles'

export type MinionProjectileVfxSet = {
  bodyKey: string
  bodyUrl: string
  bodyScale: number
  /** Si true, usar ADD (partículas de chispa / fuego). */
  bodyAdd?: boolean
}

export const MINION_PROJECTILE_VFX_FILES = {
  orderCasterMis: `${BASE}/order_caster_ba_mis.png`,
  chaosCasterMis: `${BASE}/chaos_caster_ba_mis.png`,
  orderSiegeSparks: `${BASE}/order_siege_ba_sparks.png`,
  chaosSiegeSparks: `${BASE}/chaos_siege_ba_sparks.png`,
} as const

const ORDER_RANGED: MinionProjectileVfxSet = {
  bodyKey: 'minion_proj_order_caster_mis',
  bodyUrl: MINION_PROJECTILE_VFX_FILES.orderCasterMis,
  bodyScale: 0.5,
}

const CHAOS_RANGED: MinionProjectileVfxSet = {
  bodyKey: 'minion_proj_chaos_caster_mis',
  bodyUrl: MINION_PROJECTILE_VFX_FILES.chaosCasterMis,
  bodyScale: 0.5,
}

/** Chispas del set siege (64px aprox.), escala baja → bola de cañón legible. */
const ORDER_SIEGE: MinionProjectileVfxSet = {
  bodyKey: 'minion_proj_order_siege_sparks',
  bodyUrl: MINION_PROJECTILE_VFX_FILES.orderSiegeSparks,
  bodyScale: 0.52,
  bodyAdd: true,
}

const CHAOS_SIEGE: MinionProjectileVfxSet = {
  bodyKey: 'minion_proj_chaos_siege_sparks',
  bodyUrl: MINION_PROJECTILE_VFX_FILES.chaosSiegeSparks,
  bodyScale: 0.52,
  bodyAdd: true,
}

export function getMinionProjectileVfx(
  minionKind: MinionPreviewKind,
): MinionProjectileVfxSet | null {
  switch (minionKind) {
    case 'orderRanged':
      return ORDER_RANGED
    case 'chaosRanged':
      return CHAOS_RANGED
    case 'orderSiege':
      return ORDER_SIEGE
    case 'chaosSiege':
      return CHAOS_SIEGE
    default:
      return null
  }
}

export const MINION_PROJECTILE_VFX_LOAD_LIST: MinionProjectileVfxSet[] = [
  ORDER_RANGED,
  CHAOS_RANGED,
  ORDER_SIEGE,
  CHAOS_SIEGE,
]
