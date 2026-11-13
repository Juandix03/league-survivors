export const WORLD_WIDTH = 2560
export const WORLD_HEIGHT = 2560

export const PLAYER_SPEED = 240
export const PLAYER_RADIUS = 22
export const PLAYER_MAX_HEALTH = 100

export const TEXTURE = {
  grass: 'grass',
  grassAlt: 'grassAlt',
  dirtPatch: 'dirtPatch',
  bush: 'bush',
  bushTall: 'bushTall',
  rock: 'rock',
  rockCluster: 'rockCluster',
  pebble: 'pebble',
  flower: 'flower',
  grassTuft: 'grassTuft',
  waterPuddle: 'waterPuddle',
  rune: 'rune',
  xpCrystal: 'xpCrystal',
  /** Procedural top-down sprites — LoL projectile PNGs are trail/mask atlases, not usable as-is. */
  powPowBolt: 'powPowBolt',
  ahriSpiritBolt: 'ahriSpiritBolt',
  /** Orbe del engaño (Q) — sprite horneado, legible en top-down. */
  ahriQOrb: 'ahriQOrb',
  fishbonesRocket: 'fishbonesRocket',
  zapBolt: 'zapBolt',
  chomperTrap: 'chomperTrap',
  megaRocket: 'megaRocket',
  zapHit: 'zapHit',
} as const

/** Deterministic layout seed for arena props (reproducible each run). */
export const ARENA_DECOR_SEED = 2_026_0314
