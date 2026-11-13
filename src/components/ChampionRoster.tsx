import { useCallback, useState } from 'react'
import { resolveChampionDisplayName } from '../game/combat/championHudLabels'
import {
  CHAMPION_UNLOCK_COST,
  getMetaProgress,
  getSelectedChampion,
  isChampionUnlocked,
  setSelectedChampion,
  unlockChampionPermanent,
} from '../game/meta/championUnlock'
import { ROSTER_CHAMPION_IDS } from '../game/meta/championRoster'
import type { ChampionId } from '../game/champions/types'
import { resolveChampionRosterSplash } from '../game/ui/championRosterArt'

type Props = {
  onStartRun: () => void
}

export function ChampionRoster({ onStartRun }: Props) {
  const [meta, setMeta] = useState(() => getMetaProgress())
  const [message, setMessage] = useState<string | null>(null)

  const refreshMeta = useCallback(() => {
    setMeta(getMetaProgress())
  }, [])

  const selected = meta.selectedChampion

  const handleSelect = (id: ChampionId) => {
    if (!isChampionUnlocked(id)) return
    if (setSelectedChampion(id)) {
      refreshMeta()
      setMessage(null)
    }
  }

  const handleUnlock = (id: ChampionId) => {
    const cost = CHAMPION_UNLOCK_COST[id]
    if (cost === null) return
    if (unlockChampionPermanent(id)) {
      refreshMeta()
      setMessage(`${resolveChampionDisplayName(id)} desbloqueado.`)
    } else {
      setMessage(`Necesitás ${cost} monedas (tenés ${meta.coins}).`)
    }
  }

  const handlePlay = () => {
    const id = getSelectedChampion()
    if (!isChampionUnlocked(id)) {
      setMessage('Elegí un campeón desbloqueado.')
      return
    }
    setMessage(null)
    onStartRun()
  }

  return (
    <main className="roster-screen">
      <div className="roster-demo-banner" role="note">
        <strong>Demo pública</strong> — fan game sin afiliación a Riot Games. Contenido en desarrollo.
      </div>

      <ol className="roster-howto">
        <li>Mové con WASD o flechas; ataque automático.</li>
        <li>Subí de nivel y elegí mejoras; teclas 1–4 son Q/W/E/R al desbloquearlas.</li>
        <li>Al morir ganás monedas para más campeones en el roster.</li>
      </ol>

      <div className="roster-header">
        <p className="roster-lead">
          Elegí campeón, sobreviví y desbloqueá habilidades al subir de nivel. Las monedas abren más
          roster.
        </p>
        <div className="roster-wallet">
          <span className="roster-wallet-label">Monedas</span>
          <strong className="roster-wallet-value">{meta.coins}</strong>
        </div>
      </div>

      {message ? <p className="roster-message">{message}</p> : null}

      <ul className="roster-grid">
        {ROSTER_CHAMPION_IDS.map((id) => {
          const unlocked = isChampionUnlocked(id)
          const cost = CHAMPION_UNLOCK_COST[id]
          const isSelected = unlocked && selected === id
          const name = resolveChampionDisplayName(id)

          return (
            <li
              key={id}
              className={`roster-card${unlocked ? '' : ' roster-card--locked'}${isSelected ? ' roster-card--selected' : ''}`}
            >
              <button
                type="button"
                className="roster-card-pick"
                disabled={!unlocked || isSelected}
                onClick={() => (unlocked ? handleSelect(id) : undefined)}
                aria-label={unlocked ? `Elegir ${name}` : `${name} bloqueado`}
              >
                <img
                  className="roster-card-splash"
                  src={resolveChampionRosterSplash(id)}
                  alt=""
                  draggable={false}
                  loading="lazy"
                />
              </button>
              <p className="roster-card-name">{name}</p>
              <p className="roster-card-status">
                {unlocked ? (isSelected ? 'Seleccionado' : 'Desbloqueado') : cost != null ? `🔒 ${cost} monedas` : 'Gratis'}
              </p>
              <div className="roster-card-actions">
                {unlocked ? (
                  <button
                    type="button"
                    className="roster-btn roster-btn--ghost"
                    disabled={isSelected}
                    onClick={() => handleSelect(id)}
                  >
                    {isSelected ? 'Activo' : 'Elegir'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="roster-btn roster-btn--buy"
                    onClick={() => handleUnlock(id)}
                  >
                    Comprar
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="roster-footer">
        <button type="button" className="roster-btn roster-btn--play" onClick={handlePlay}>
          Jugar con {resolveChampionDisplayName(getSelectedChampion())}
        </button>
      </div>

      {import.meta.env.DEV ? (
        <p className="roster-dev-hint">
          Dev: <code>?fullkit=1</code> kit completo · <code>?balance=1</code> panel de balance ·{' '}
          <code>?champion=</code> fuerza campeón
        </p>
      ) : null}
    </main>
  )
}
