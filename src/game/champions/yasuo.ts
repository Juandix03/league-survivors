import { PLAYER_RADIUS } from '../constants'
import type { ChampionAnimationSet, ChampionVisualConfig } from './types'

export const YASUO_ANIMS: ChampionAnimationSet = {
  idle: 'yasuo-idle',
  walkDown: 'yasuo-walk-down',
  walkUp: 'yasuo-walk-up',
  walkSide: 'yasuo-walk-side',
}

const HD_FRAME = 256

/** Attack1 side bake — `npm run yasuo:render-attack` */
export const YASUO_ATTACK_SHEET = {
  key: 'yasuo-attack-sheet-hd',
  url: '/assets/champions/yasuo/attack_sheet_hd.png?v=1',
  frameWidth: HD_FRAME,
  frameHeight: HD_FRAME,
  frames: 6,
  frameRate: 28,
} as const

/** Spell1A thrust — `npm run yasuo:render-q` */
/** WAD mesh + UV scroll (legacy tiles) — `npm run yasuo:bake-w-scb` */
export const YASUO_W_SCB_ANIM_SHEET = {
  key: 'yasuo-w-wall-scb-anim',
  url: '/assets/champions/yasuo/w_wall_scb_anim_sheet.png?v=2',
  frameWidth: 384,
  frameHeight: 224,
  framesPerRow: 8,
  directionRows: 3,
  frameRate: 14,
} as const

/** WAD mesh face-on horizontal strip — `npm run yasuo:bake-w-horizontal` */
export const YASUO_W_SCB_HORIZONTAL_SHEET = {
  key: 'yasuo-w-wall-scb-horizontal',
  url: '/assets/champions/yasuo/w_wall_scb_horizontal_sheet.png?v=2',
  frameWidth: 640,
  frameHeight: 168,
  framesPerRow: 8,
  directionRows: 3,
  frameRate: 12,
} as const

/** Iso camera + franja ancha para arena top-down — `npm run yasuo:bake-w-topdown` */
export const YASUO_W_SCB_TOPDOWN_SHEET = {
  key: 'yasuo-w-wall-scb-topdown',
  url: '/assets/champions/yasuo/w_wall_scb_topdown_sheet.png?v=3',
  frameWidth: 768,
  frameHeight: 200,
  framesPerRow: 8,
  directionRows: 3,
  frameRate: 12,
} as const

export const YASUO_Q_STEEL_SHEET = {
  key: 'yasuo-q-steel-sheet-hd',
  url: '/assets/champions/yasuo/q_steel_sheet_hd.png?v=2',
  frameWidth: HD_FRAME,
  frameHeight: HD_FRAME,
  /** 3 filas: down, up, side × 6 frames. */
  framesPerRow: 6,
  directionRows: 3,
  frameRate: 32,
} as const

/** Khada Yasuo skin0 — `npm run yasuo:render` */
const YASUO_IDLE_CLIP_SEC = 13.333333015441895
const YASUO_RUN_CLIP_SEC = 0.8999999761581421
const HD_FRAMES_PER_CYCLE = 8

export const YASUO_CHAMPION: ChampionVisualConfig = {
  id: 'yasuo',
  directionMode: '8',
  sheet: {
    key: 'yasuo-sheet-authentic-hd-8dir',
    url: '/assets/champions/yasuo/spritesheet_authentic_hd_8dir.png?v=1',
    frameWidth: HD_FRAME,
    frameHeight: HD_FRAME,
  },
  displayScale: 0.29 * 1.4,
  originX: 0.5,
  originY: 0.94,
  bodyRadius: PLAYER_RADIUS,
  bodyOffsetX: HD_FRAME / 2 - PLAYER_RADIUS,
  bodyOffsetY: Math.round(HD_FRAME * 0.9) - PLAYER_RADIUS,
  textureFilter: 'nearest',
  animTiming: {
    framesPerCycle: HD_FRAMES_PER_CYCLE,
    idleFrameRate: HD_FRAMES_PER_CYCLE / YASUO_IDLE_CLIP_SEC,
    walkFrameRate: HD_FRAMES_PER_CYCLE / YASUO_RUN_CLIP_SEC,
  },
}
