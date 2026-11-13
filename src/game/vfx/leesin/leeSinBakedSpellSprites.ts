/** Ortho bakes from LeeSin.wad.client SCB + Riot UV (`npm run leesin:bake-q`). */

/** Cuerpo del misil — vista lateral (cono + flame + ondas), no círculo top-down. */
export const LEESIN_Q_MISSILE_SIDE_SHEET = {
  key: 'leesin-q-missile-side-sheet',
  url: '/assets/vfx/leesin/baked/leesin_q_missile_side_sheet.png?v=3',
  frameWidth: 192,
  frameHeight: 96,
} as const

export const LEESIN_Q_MISSILE_SIDE_ANIM = 'leesin-q-missile-side-spin'

/** Halo sutil bajo el núcleo (opcional). */
export const LEESIN_Q_MISSILE_TOP_SHEET = {
  key: 'leesin-q-missile-top-sheet',
  url: '/assets/vfx/leesin/baked/leesin_q_missile_top_sheet.png?v=2',
  frameWidth: 128,
  frameHeight: 128,
} as const

export const LEESIN_Q_MISSILE_TOP_ANIM = 'leesin-q-missile-top-halo'

export const LEESIN_BAKED_Q_TRAIL = {
  key: 'leesin-baked-q-trail',
  url: '/assets/vfx/leesin/baked/leesin_q_trail_sprite.png?v=2',
} as const

export const LEESIN_BAKED_Q_CAST_RING = {
  key: 'leesin-baked-q-cast-ring',
  url: '/assets/vfx/leesin/baked/leesin_q_cast_ring_sprite.png?v=2',
} as const

export const LEESIN_BAKED_SPELL_SPRITES = [
  LEESIN_BAKED_Q_TRAIL,
  LEESIN_BAKED_Q_CAST_RING,
] as const
