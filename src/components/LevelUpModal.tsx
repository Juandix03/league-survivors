import { useEffect, useState } from 'react'
import type { LevelUpOffer } from '../game/hud'
import type { UpgradeId } from '../game/upgrades'

type LevelUpModalProps = {
  offer: LevelUpOffer
  onChoose: (id: UpgradeId) => void
}

export function LevelUpModal({ offer, onChoose }: LevelUpModalProps) {
  const [hoveredId, setHoveredId] = useState<UpgradeId | null>(null)
  const [lockedId, setLockedId] = useState<UpgradeId | null>(null)

  const optionKey = offer.options.map((option) => option.id).join('|')

  useEffect(() => {
    setHoveredId(null)
    setLockedId(null)
  }, [offer.levelReached, optionKey])

  const handleChoose = (id: UpgradeId) => {
    if (lockedId) {
      return
    }
    setLockedId(id)
    onChoose(id)
  }

  return (
    <div className="level-up-overlay" role="dialog" aria-modal="true" aria-labelledby="level-up-title">
      <div className="level-up-panel">
        <p className="level-up-kicker">Ascenso alcanzado</p>
        <h2 id="level-up-title" className="level-up-title">
          Nivel {offer.levelReached}
        </h2>
        <p className="level-up-instruction">
          Elegí una mejora para continuar
          {offer.pendingChoices > 1 ? ` · ${offer.pendingChoices} elecciones pendientes` : ''}
        </p>

        <div className="upgrade-cards">
          {offer.options.map((option) => {
            const isHovered = hoveredId === option.id
            const isSelected = lockedId === option.id

            return (
              <button
                key={option.id}
                type="button"
                className={`upgrade-card${isHovered ? ' is-hovered' : ''}${isSelected ? ' is-selected' : ''}`}
                disabled={lockedId !== null}
                onMouseEnter={() => setHoveredId(option.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(option.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => handleChoose(option.id)}
              >
                <span className="upgrade-icon" aria-hidden="true">
                  {option.iconSrc ? (
                    <img className="upgrade-icon-img" src={option.iconSrc} alt="" draggable={false} />
                  ) : (
                    option.icon
                  )}
                </span>
                <span className="upgrade-name">{option.title}</span>
                <span className="upgrade-desc">{option.description}</span>
                {isSelected ? <span className="upgrade-selected-tag">Elegida</span> : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
