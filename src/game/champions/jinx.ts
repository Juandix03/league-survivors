import { PLAYER_RADIUS } from '../constants'
import type { ChampionAnimationSet, ChampionVisualConfig } from './types'

export const JINX_ANIMS: ChampionAnimationSet = {
  idle: 'jinx-idle',
  walkDown: 'jinx-walk-down',
  walkUp: 'jinx-walk-up',
  walkSide: 'jinx-walk-side',
}

const HD_FRAME = 256

/** GLB clip durations (Khada Jinx skin0) — used to sync cycle length, not gameplay speed. */
const JINX_IDLE_CLIP_SEC = 1.0666669607162476
const JINX_RUN_CLIP_SEC = 0.9333333373069763
const HD_FRAMES_PER_CYCLE = 8

/** Prototipo JPG 64×64 con fondo magenta — `?jinxSheet=prototype`. */
export const JINX_CHAMPION_PROTOTYPE: ChampionVisualConfig = {
  id: 'jinx',
  sheet: {
    key: 'jinx-sheet',
    url: '/assets/champions/jinx/spritesheet.jpg',
    frameWidth: 64,
    frameHeight: 64,
  },
  displayScale: 1.18,
  originX: 0.5,
  originY: 0.72,
  bodyRadius: PLAYER_RADIUS,
  bodyOffsetX: 32 - PLAYER_RADIUS,
  bodyOffsetY: 40 - PLAYER_RADIUS,
}

/** Ortho HD bake from Khada GLB (`npm run jinx:render`). Activo por defecto. */
export const JINX_CHAMPION: ChampionVisualConfig = {
  id: 'jinx',
  directionMode: '8',
  sheet: {
    key: 'jinx-sheet-authentic-hd-8dir',
    url: '/assets/champions/jinx/spritesheet_authentic_hd_8dir.png?v=1',
    frameWidth: HD_FRAME,
    frameHeight: HD_FRAME,
  },
  displayScale: 0.29 * 1.3,
  originX: 0.5,
  originY: 0.72,
  bodyRadius: PLAYER_RADIUS,
  bodyOffsetX: HD_FRAME / 2 - PLAYER_RADIUS,
  bodyOffsetY: Math.round(HD_FRAME * 0.625) - PLAYER_RADIUS,
  textureFilter: 'nearest',
  animTiming: {
    framesPerCycle: HD_FRAMES_PER_CYCLE,
    idleFrameRate: HD_FRAMES_PER_CYCLE / JINX_IDLE_CLIP_SEC,
    walkFrameRate: HD_FRAMES_PER_CYCLE / JINX_RUN_CLIP_SEC,
  },
}

/** Khada GLB (Riot client data) → ortho bake. Enable with ?jinxSheet=authentic */
export const JINX_CHAMPION_AUTHENTIC_PREVIEW: ChampionVisualConfig = {
  ...JINX_CHAMPION_PROTOTYPE,
  sheet: {
    key: 'jinx-sheet-authentic',
    url: '/assets/champions/jinx/spritesheet_authentic_test.png',
    frameWidth: 64,
    frameHeight: 64,
  },
  displayScale: 1.05 * 1.3,
  originY: 0.68,
  bodyOffsetY: 38 - PLAYER_RADIUS,
  textureFilter: 'nearest',
}

/** @deprecated Alias — usar `JINX_CHAMPION` (HD por defecto). */
export const JINX_CHAMPION_AUTHENTIC_HD_PREVIEW: ChampionVisualConfig = JINX_CHAMPION
