import { STARTING_LEVEL, xpRequiredForNextLevel } from './experience'
import type { ChampionId } from './champions/types'
import type { AbilityHudSlot } from './combat/jinxAbilityHud'
import type {
  BalanceDebugLive,
  BalanceRunSummary,
} from './dev/balanceRunRecorder'
import type { UpgradeOptionView } from './upgrades'

export type LevelUpOffer = {
  levelReached: number
  pendingChoices: number
  options: UpgradeOptionView[]
}

export type HudSnapshot = {
  health: number
  maxHealth: number
  elapsedMs: number
  kills: number
  gameOver: boolean
  level: number
  xp: number
  xpToNextLevel: number
  levelUpOffer: LevelUpOffer | null
  championId: ChampionId
  championName: string
  activeWeapon: string
  abilities: AbilityHudSlot[]
  /** Monedas permanentes acumuladas. */
  metaCoins?: number
  /** Monedas ganadas en esta partida (game over). */
  runCoinReward?: number | null
  /** Solo en desarrollo: FPS reales de Phaser (no velocidad de simulación). */
  debugFps?: number
  /** Solo dev con `?balance=1`: métricas de partida para balance. */
  balanceDebug?: {
    live: BalanceDebugLive
    summary: BalanceRunSummary | null
  }
}

export const INITIAL_HUD: HudSnapshot = {
  health: 100,
  maxHealth: 100,
  elapsedMs: 0,
  kills: 0,
  gameOver: false,
  level: STARTING_LEVEL,
  xp: 0,
  xpToNextLevel: xpRequiredForNextLevel(STARTING_LEVEL),
  levelUpOffer: null,
  championId: 'jinx',
  championName: 'Jinx',
  activeWeapon: 'Pow-Pow',
  abilities: [],
}

export type HudListener = (snapshot: HudSnapshot, force?: boolean) => void

export function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}