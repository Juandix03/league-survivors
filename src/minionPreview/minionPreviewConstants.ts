/** Sprites originales del repo — no son assets de Riot. */
export const MINION_PREVIEW_TEXTURE = {
  orderMelee: 'minion_prev_order_melee',
  chaosMelee: 'minion_prev_chaos_melee',
  orderRanged: 'minion_prev_order_ranged',
  chaosRanged: 'minion_prev_chaos_ranged',
  orderSiege: 'minion_prev_order_siege',
  chaosSiege: 'minion_prev_chaos_siege',
  orderSuper: 'minion_prev_order_super',
  chaosSuper: 'minion_prev_chaos_super',
} as const

export type MinionPreviewKind = keyof typeof MINION_PREVIEW_TEXTURE

export const MINION_PREVIEW_LABELS: Record<
  MinionPreviewKind,
  { title: string; team: 'Order' | 'Chaos'; role: string }
> = {
  orderMelee: { title: 'Melee', team: 'Order', role: 'cuerpo a cuerpo' },
  chaosMelee: { title: 'Melee', team: 'Chaos', role: 'cuerpo a cuerpo' },
  orderRanged: { title: 'Ranged', team: 'Order', role: 'caster' },
  chaosRanged: { title: 'Ranged', team: 'Chaos', role: 'caster' },
  orderSiege: { title: 'Siege', team: 'Order', role: 'cañón' },
  chaosSiege: { title: 'Siege', team: 'Chaos', role: 'cañón' },
  orderSuper: { title: 'Super', team: 'Order', role: 'super minion' },
  chaosSuper: { title: 'Super', team: 'Chaos', role: 'super minion' },
}

/** Cuadrícula baked: fila Order arriba, Chaos abajo; columnas melee → super. */
export const BAKED_GRID_KINDS: MinionPreviewKind[][] = [
  ['orderMelee', 'orderRanged', 'orderSiege', 'orderSuper'],
  ['chaosMelee', 'chaosRanged', 'chaosSiege', 'chaosSuper'],
]

/** Texturas diffuse oficiales (CDN). Solo galería local — IP Riot. */
export const RIOT_MINION_CDN_TEXTURES: {
  kind: MinionPreviewKind
  label: string
  url: string
}[] = [
  {
    kind: 'orderMelee',
    label: 'SR Order Melee',
    url: 'https://raw.communitydragon.org/latest/game/assets/characters/sru_orderminionmelee/skins/base/orderminion_melee_tx_cm.png',
  },
  {
    kind: 'chaosMelee',
    label: 'SR Chaos Melee',
    url: 'https://raw.communitydragon.org/latest/game/assets/characters/sru_chaosminionmelee/skins/base/chaosminion_melee_tx_cm.png',
  },
  {
    kind: 'orderRanged',
    label: 'SR Order Caster',
    url: 'https://raw.communitydragon.org/latest/game/assets/characters/sru_orderminionranged/skins/base/orderminion_caster_tx_cm.png',
  },
  {
    kind: 'chaosRanged',
    label: 'SR Chaos Caster',
    url: 'https://raw.communitydragon.org/latest/game/assets/characters/sru_chaosminionranged/skins/base/red_caster_tx_cm.png',
  },
  {
    kind: 'orderSiege',
    label: 'SR Order Siege',
    url: 'https://raw.communitydragon.org/latest/game/assets/characters/sru_orderminionsiege/skins/base/order_minion_siege_tx_cm.png',
  },
  {
    kind: 'chaosSiege',
    label: 'SR Chaos Siege',
    url: 'https://raw.communitydragon.org/latest/game/assets/characters/sru_chaosminionsiege/skins/base/chaos_minion_siege_tx_cm.png',
  },
  {
    kind: 'orderSuper',
    label: 'SR Order Super',
    url: 'https://raw.communitydragon.org/latest/game/assets/characters/sru_orderminionsuper/skins/base/blue_superminion_tx_cm.png',
  },
  {
    kind: 'chaosSuper',
    label: 'SR Chaos Super',
    url: 'https://raw.communitydragon.org/latest/game/assets/characters/sru_chaosminionsuper/skins/base/red_superminion_tx_cm.png',
  },
]
