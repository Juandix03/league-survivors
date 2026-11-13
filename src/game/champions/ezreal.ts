import { PLAYER_RADIUS } from '../constants'
import type { ChampionAnimationSet, ChampionVisualConfig } from './types'

export const EZREAL_ANIMS: ChampionAnimationSet = {
  idle: 'ezreal-idle',
  walkDown: 'ezreal-walk-down',
  walkUp: 'ezreal-walk-up',
  walkSide: 'ezreal-walk-side',
}

const HD_FRAME = 256
const IDLE_SEC = 2.667
const RUN_SEC = 1.0
const HD_FRAMES = 8

export const EZREAL_CHAMPION: ChampionVisualConfig = {
  id: 'ezreal',
  directionMode: '8',
  sheet: {
    key: 'ezreal-sheet-authentic-hd-8dir',
    url: '/assets/champions/ezreal/spritesheet_authentic_hd_8dir.png?v=1',
    frameWidth: HD_FRAME,
    frameHeight: HD_FRAME,
  },
  displayScale: 0.29 * 1.32,
  originX: 0.5,
  originY: 0.94,
  bodyRadius: PLAYER_RADIUS,
  bodyOffsetX: HD_FRAME / 2 - PLAYER_RADIUS,
  bodyOffsetY: Math.round(HD_FRAME * 0.9) - PLAYER_RADIUS,
  textureFilter: 'nearest',
  animTiming: {
    framesPerCycle: HD_FRAMES,
    idleFrameRate: HD_FRAMES / IDLE_SEC,
    walkFrameRate: HD_FRAMES / RUN_SEC,
  },
}

export const EZREAL_SPLASH = '/assets/champions/ezreal/splash.jpg?v=1'

/** Attack1a — `npm run ezreal:render-attack` */
export const EZREAL_ATTACK_SHEET = {
  key: 'ezreal-attack-sheet-hd',
  url: '/assets/champions/ezreal/attack_sheet_hd.png?v=1',
  frameWidth: HD_FRAME,
  frameHeight: HD_FRAME,
  framesPerRow: 6,
  frameRate: 22,
} as const
