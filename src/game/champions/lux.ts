import { PLAYER_RADIUS } from '../constants'
import type { ChampionAnimationSet, ChampionVisualConfig } from './types'

export const LUX_ANIMS: ChampionAnimationSet = {
  idle: 'lux-idle',
  walkDown: 'lux-walk-down',
  walkUp: 'lux-walk-up',
  walkSide: 'lux-walk-side',
}

const HD_FRAME = 256

/** GLB clip durations (Khada Lux skin0) — sync cycle length with bake. */
const LUX_IDLE_CLIP_SEC = 1.0666669607162476
const LUX_RUN_CLIP_SEC = 4.800000190734863
const HD_FRAMES_PER_CYCLE = 8

/** Ortho HD bake from Khada GLB (`npm run lux:render`). */
export const LUX_CHAMPION: ChampionVisualConfig = {
  id: 'lux',
  directionMode: '8',
  sheet: {
    key: 'lux-sheet-authentic-hd-8dir',
    url: '/assets/champions/lux/spritesheet_authentic_hd_8dir.png?v=1',
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
    idleFrameRate: HD_FRAMES_PER_CYCLE / LUX_IDLE_CLIP_SEC,
    walkFrameRate: HD_FRAMES_PER_CYCLE / LUX_RUN_CLIP_SEC,
  },
}
