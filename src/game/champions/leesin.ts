import { PLAYER_RADIUS } from '../constants'
import type { ChampionAnimationSet, ChampionVisualConfig } from './types'

export const LEESIN_ANIMS: ChampionAnimationSet = {
  idle: 'leesin-idle',
  walkDown: 'leesin-walk-down',
  walkUp: 'leesin-walk-up',
  walkSide: 'leesin-walk-side',
}

const HD_FRAME = 256

/** Khada Lee Sin skin0 — `npm run leesin:render` */
const LEESIN_IDLE_CLIP_SEC = 3.0
const LEESIN_RUN_CLIP_SEC = 1.5333333015441895
const HD_FRAMES_PER_CYCLE = 8

export const LEESIN_CHAMPION: ChampionVisualConfig = {
  id: 'leesin',
  directionMode: '8',
  sheet: {
    key: 'leesin-sheet-authentic-hd-8dir',
    url: '/assets/champions/leesin/spritesheet_authentic_hd_8dir.png?v=1',
    frameWidth: HD_FRAME,
    frameHeight: HD_FRAME,
  },
  displayScale: 0.29 * 1.38,
  originX: 0.5,
  originY: 0.94,
  bodyRadius: PLAYER_RADIUS,
  bodyOffsetX: HD_FRAME / 2 - PLAYER_RADIUS,
  bodyOffsetY: Math.round(HD_FRAME * 0.9) - PLAYER_RADIUS,
  textureFilter: 'nearest',
  animTiming: {
    framesPerCycle: HD_FRAMES_PER_CYCLE,
    idleFrameRate: HD_FRAMES_PER_CYCLE / LEESIN_IDLE_CLIP_SEC,
    walkFrameRate: HD_FRAMES_PER_CYCLE / LEESIN_RUN_CLIP_SEC,
  },
}

export const LEESIN_SPLASH = '/assets/champions/leesin/splash.jpg?v=1'
