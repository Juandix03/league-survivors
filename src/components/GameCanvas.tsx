import { useCallback, useEffect, useRef, useState } from 'react'
import { createGame } from '../game/createGame'
import type { GameHandle } from '../game/createGame'
import type { ChampionId } from '../game/champions/types'
import { formatElapsed, INITIAL_HUD } from '../game/hud'
import type { HudSnapshot } from '../game/hud'
import type { UpgradeId } from '../game/upgrades'
import { AbilityBar } from './AbilityBar'
import { BalanceDebugPanel } from './BalanceDebugPanel'
import { LevelUpModal } from './LevelUpModal'
import { isBalanceRunDebugEnabled } from '../game/devConfig'

type GameCanvasProps = {
  championId: ChampionId
  onBackToRoster: () => void
  onRetry: () => void
}

export function GameCanvas({ championId, onBackToRoster, onRetry }: GameCanvasProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<GameHandle | null>(null)
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD)

  useEffect(() => {
    const parent = parentRef.current
    if (!parent) {
      return
    }

    gameRef.current = createGame(parent, setHud, championId)

    return () => {
      gameRef.current?.destroy()
      gameRef.current = null
    }
  }, [championId])

  const handleChooseUpgrade = useCallback((id: UpgradeId) => {
    gameRef.current?.chooseUpgrade(id)
  }, [])

  const healthPercent = Math.max(0, Math.min(100, (hud.health / hud.maxHealth) * 100))
  const xpPercent =
    hud.xpToNextLevel > 0
      ? Math.max(0, Math.min(100, (hud.xp / hud.xpToNextLevel) * 100))
      : 0

  return (
    <div className="app-shell app-shell--run">
      <div className="stage">
        <div ref={parentRef} className="game-parent" />

        <div className="hud" aria-live="polite">
          <header className="hud-top">
            <div className="hud-top-stats">
              <div className="hud-pill hud-pill--level" title="Nivel">
                <span className="hud-pill-value">{hud.level}</span>
                <span className="hud-pill-label">Nv</span>
              </div>

              <div className="hud-pill hud-pill--timer" title="Tiempo de supervivencia">
                <span className="hud-pill-value">{formatElapsed(hud.elapsedMs)}</span>
              </div>

              <div className="hud-pill hud-pill--kills" title="Enemigos derrotados">
                <span className="hud-pill-label">☠</span>
                <span className="hud-pill-value">{hud.kills}</span>
              </div>

              {import.meta.env.DEV && hud.debugFps !== undefined ? (
                <span className="hud-pill hud-pill--fps" title="FPS (solo desarrollo)">
                  {hud.debugFps}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              className="hud-exit-btn"
              onClick={onBackToRoster}
              title="Volver al roster (abandona la partida)"
            >
              Salir
            </button>
          </header>

          <footer className="hud-bottom">
            <div className="hud-vitals" aria-label="Vitalidad y experiencia">
              <div className="hud-vitals-head">
                <span className="hud-vitals-name">{hud.championName}</span>
                <span className="hud-vitals-hp">
                  {Math.ceil(hud.health)} / {hud.maxHealth}
                </span>
              </div>
              <div className="hud-bar health-track">
                <div className="health-fill" style={{ width: `${healthPercent}%` }} />
              </div>
              <div className="hud-bar xp-track">
                <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
              </div>
              <p className="hud-weapon-line" title="Arma o ataque básico activo">
                {hud.activeWeapon}
                <span className="hud-weapon-sep"> · </span>
                <span className="hud-controls-keys">1–4</span> habilidades
              </p>
            </div>

            <div className="hud-ability-dock">
              <AbilityBar slots={hud.abilities} championId={hud.championId} />
            </div>
          </footer>

          {hud.gameOver ? (
            <div className="hud-panel game-over-panel game-over-panel--interactive">
              <span className="hud-label">Fin de partida</span>
              <strong>Game Over</strong>
              {hud.runCoinReward != null && hud.runCoinReward > 0 ? (
                <p className="game-over-reward">
                  +{hud.runCoinReward} monedas
                  <span className="game-over-reward-total"> · total {hud.metaCoins ?? 0}</span>
                </p>
              ) : null}
              <div className="game-over-actions">
                <button type="button" className="roster-btn roster-btn--play" onClick={onRetry}>
                  Reintentar
                </button>
                <button type="button" className="roster-btn roster-btn--ghost" onClick={onBackToRoster}>
                  Roster
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {hud.levelUpOffer && !hud.gameOver ? (
          <LevelUpModal offer={hud.levelUpOffer} onChoose={handleChooseUpgrade} />
        ) : null}

        {isBalanceRunDebugEnabled() && hud.balanceDebug ? (
          <BalanceDebugPanel hud={hud} />
        ) : null}
      </div>
    </div>
  )
}
