import { PLAYER_RADIUS } from '../constants'
import type { ChampionAnimationSet, ChampionVisualConfig } from './types'

export const AHRI_ANIMS: ChampionAnimationSet = {
  idle: 'ahri-idle',
  walkDown: 'ahri-walk-down',
  walkUp: 'ahri-walk-up',
  walkSide: 'ahri-walk-side',
}

const HD_FRAME = 256

/** GLB clip durations (Khada Ahri skin0) — sync cycle length with bake. */
const AHRI_IDLE_CLIP_SEC = 3.9666643142700195
const AHRI_RUN_CLIP_SEC = 1.0000003576278687
const HD_FRAMES_PER_CYCLE = 8

/** Ortho HD bake from Khada/Riot-derived GLB (`npm run ahri:render`). */
export const AHRI_CHAMPION: ChampionVisualConfig = {
  id: 'ahri',
  directionMode: '8',
  sheet: {
    key: 'ahri-sheet-authentic-hd-8dir',
    url: '/assets/champions/ahri/spritesheet_authentic_hd_8dir.png?v=1',
    frameWidth: HD_FRAME,
    frameHeight: HD_FRAME,
  },
  /** Más zoom-out en bake (fill 0.68) — escala un poco mayor que Jinx HD. */
  displayScale: 0.29 * 1.42,
  originX: 0.5,
  /** Pies anclados abajo del frame (Khada bake), no centro como Jinx. */
  originY: 0.94,
  bodyRadius: PLAYER_RADIUS,
  bodyOffsetX: HD_FRAME / 2 - PLAYER_RADIUS,
  bodyOffsetY: Math.round(HD_FRAME * 0.9) - PLAYER_RADIUS,
  textureFilter: 'nearest',
  animTiming: {
    framesPerCycle: HD_FRAMES_PER_CYCLE,
    idleFrameRate: HD_FRAMES_PER_CYCLE / AHRI_IDLE_CLIP_SEC,
    walkFrameRate: HD_FRAMES_PER_CYCLE / AHRI_RUN_CLIP_SEC,
  },
}
