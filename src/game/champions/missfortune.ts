import { PLAYER_RADIUS } from '../constants'
import type { ChampionAnimationSet, ChampionVisualConfig } from './types'

export const MISSFORTUNE_ANIMS: ChampionAnimationSet = {
  idle: 'missfortune-idle',
  walkDown: 'missfortune-walk-down',
  walkUp: 'missfortune-walk-up',
  walkSide: 'missfortune-walk-side',
}

const HD_FRAME = 256
const IDLE_SEC = 1.333
const RUN_SEC = 0.8
const HD_FRAMES = 8

export const MISSFORTUNE_CHAMPION: ChampionVisualConfig = {
  id: 'missfortune',
  directionMode: '8',
  sheet: {
    key: 'missfortune-sheet-authentic-hd-8dir',
    url: '/assets/champions/missfortune/spritesheet_authentic_hd_8dir.png?v=1',
    frameWidth: HD_FRAME,
    frameHeight: HD_FRAME,
  },
  displayScale: 0.29 * 1.35,
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

export const MISSFORTUNE_SPLASH = '/assets/champions/missfortune/splash.jpg?v=1'
