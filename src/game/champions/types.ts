export type ChampionId =
  | 'jinx'
  | 'ahri'
  | 'yasuo'
  | 'lux'
  | 'leesin'
  | 'missfortune'
  | 'ezreal'

export type ChampionSheetConfig = {
  key: string
  url: string
  frameWidth: number
  frameHeight: number
}

export type ChampionTextureFilter = 'nearest' | 'linear'

export type ChampionAnimTiming = {
  framesPerCycle: number
  /** frameRate = framesPerCycle / GLB clip duration (one cycle matches source anim). */
  idleFrameRate: number
  walkFrameRate: number
}

export type ChampionDirectionMode = '4' | '8'

export type ChampionVisualConfig = {
  id: ChampionId
  sheet: ChampionSheetConfig
  /** `8` = sheet horneado con 8 filas de Run + idle (Miss Fortune hd8). */
  directionMode?: ChampionDirectionMode
  displayScale: number
  originX: number
  originY: number
  bodyRadius: number
  bodyOffsetX: number
  bodyOffsetY: number
  /** Avoid blurry upscale when frame size >> on-screen size. */
  textureFilter?: ChampionTextureFilter
  animTiming?: ChampionAnimTiming
}

export type ChampionAnimationSet = {
  idle: string
  walkDown: string
  walkUp: string
  walkSide: string
}
