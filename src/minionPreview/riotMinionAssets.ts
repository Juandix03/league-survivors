import * as Phaser from 'phaser'
import type { MinionPreviewKind } from './minionPreviewConstants'

/** Archivos en public/ — descargar con npm run minions:download-riot-hud */
export const RIOT_MINION_SQUARE_KEY = {
  orderMelee: 'riot_minion_order_melee',
  chaosMelee: 'riot_minion_chaos_melee',
  orderRanged: 'riot_minion_order_ranged',
  chaosRanged: 'riot_minion_chaos_ranged',
  orderSiege: 'riot_minion_order_siege',
  chaosSiege: 'riot_minion_chaos_siege',
  orderSuper: 'riot_minion_order_super',
  chaosSuper: 'riot_minion_chaos_super',
} as const satisfies Record<MinionPreviewKind, string>

export const RIOT_MINION_SQUARE_URL: Record<MinionPreviewKind, string> = {
  orderMelee: '/assets/minions-preview/riot-square/orderMelee.png',
  chaosMelee: '/assets/minions-preview/riot-square/chaosMelee.png',
  orderRanged: '/assets/minions-preview/riot-square/orderRanged.png',
  chaosRanged: '/assets/minions-preview/riot-square/chaosRanged.png',
  orderSiege: '/assets/minions-preview/riot-square/orderSiege.png',
  chaosSiege: '/assets/minions-preview/riot-square/chaosSiege.png',
  orderSuper: '/assets/minions-preview/riot-square/orderSuper.png',
  chaosSuper: '/assets/minions-preview/riot-square/chaosSuper.png',
}

/** Fallback CDN si no corriste el script de descarga (solo dev). */
export const RIOT_MINION_SQUARE_CDN: Record<MinionPreviewKind, string> = {
  orderMelee:
    'https://raw.communitydragon.org/latest/game/assets/characters/sru_orderminionmelee/hud/bluemelee_square.png',
  chaosMelee:
    'https://raw.communitydragon.org/latest/game/assets/characters/sru_chaosminionmelee/hud/redmelee_square.png',
  orderRanged:
    'https://raw.communitydragon.org/latest/game/assets/characters/sru_orderminionranged/hud/bluerange_square.png',
  chaosRanged:
    'https://raw.communitydragon.org/latest/game/assets/characters/sru_chaosminionranged/hud/redrange_square.png',
  orderSiege:
    'https://raw.communitydragon.org/latest/game/assets/characters/sru_orderminionsiege/hud/bluemechcannon_square.png',
  chaosSiege:
    'https://raw.communitydragon.org/latest/game/assets/characters/sru_chaosminionsiege/hud/redmechcannon_square.png',
  orderSuper:
    'https://raw.communitydragon.org/latest/game/assets/characters/sru_orderminionsuper/hud/bluemechmelee_square.png',
  chaosSuper:
    'https://raw.communitydragon.org/latest/game/assets/characters/sru_chaosminionsuper/hud/redmechmelee_square.png',
}

export function loadRiotMinionSquareTextures(scene: Phaser.Scene, preferLocal = true) {
  for (const kind of Object.keys(RIOT_MINION_SQUARE_KEY) as MinionPreviewKind[]) {
    const key = RIOT_MINION_SQUARE_KEY[kind]
    const url = preferLocal ? RIOT_MINION_SQUARE_URL[kind] : RIOT_MINION_SQUARE_CDN[kind]
    if (!scene.textures.exists(key)) {
      scene.load.image(key, url)
    }
  }
}

export function riotMinionTextureKey(kind: MinionPreviewKind): string {
  return RIOT_MINION_SQUARE_KEY[kind]
}

/** Iconos HUD 128² — escala en mundo para tier. */
export function riotMinionDisplayScale(kind: MinionPreviewKind): number {
  if (kind.includes('Super')) return 0.46
  if (kind.includes('Siege')) return 0.38
  if (kind.includes('Ranged')) return 0.3
  return 0.32
}

export function riotMinionBodyRadius(kind: MinionPreviewKind): number {
  return Math.round(64 * riotMinionDisplayScale(kind) * 0.45)
}
