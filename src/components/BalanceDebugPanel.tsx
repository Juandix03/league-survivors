import { useCallback, useState } from 'react'
import { formatElapsed } from '../game/hud'
import type { HudSnapshot } from '../game/hud'
import {
  formatBalanceRunSummaryJson,
  formatBalanceRunSummaryText,
} from '../game/dev/balanceRunRecorder'

type Props = {
  hud: HudSnapshot
}

export function BalanceDebugPanel({ hud }: Props) {
  const [open, setOpen] = useState(true)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const debug = hud.balanceDebug

  const summary = debug?.summary

  const copySummary = useCallback(
    async (asJson: boolean) => {
      if (!summary) {
        setCopyStatus('Jugá hasta game over para el resumen')
        return
      }
      const text = asJson
        ? formatBalanceRunSummaryJson(summary)
        : formatBalanceRunSummaryText(summary)
      try {
        await navigator.clipboard.writeText(text)
        setCopyStatus(asJson ? 'JSON copiado' : 'Texto copiado')
      } catch {
        setCopyStatus('No se pudo copiar')
      }
    },
    [summary],
  )

  if (!debug) {
    return null
  }

  const { live } = debug

  return (
    <aside className="balance-debug" aria-label="Balance debug">
      <button
        type="button"
        className="balance-debug-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Panel de balance (solo dev, ?balance=1)"
      >
        Balance {open ? '▾' : '▸'}
      </button>

      {open ? (
        <div className="balance-debug-panel">
          <dl className="balance-debug-grid">
            <div>
              <dt>Combate</dt>
              <dd>{formatElapsed(live.combatElapsedMs)}</dd>
            </div>
            <div>
              <dt>Nivel</dt>
              <dd>{live.level}</dd>
            </div>
            <div>
              <dt>Kills</dt>
              <dd>{live.kills}</dd>
            </div>
            <div>
              <dt>Vivos</dt>
              <dd>{live.aliveEnemies}</dd>
            </div>
            <div>
              <dt>LVL ups</dt>
              <dd>{live.levelUpsTotal}</dd>
            </div>
            <div>
              <dt>HP</dt>
              <dd>
                {live.health}/{live.maxHealth}
              </dd>
            </div>
            <div>
              <dt>Dmg proj.</dt>
              <dd>{live.projectileDamage.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Atk ms</dt>
              <dd>{Math.round(live.attackIntervalMs)}</dd>
            </div>
          </dl>
          {summary ? (
            <div className="balance-debug-summary">
              <p className="balance-debug-line">
                Máx. vivos: {summary.maxAliveEnemies} · {summary.timeline.length} muestras
              </p>
              <div className="balance-debug-actions">
                <button type="button" onClick={() => copySummary(false)}>
                  Copiar
                </button>
                <button type="button" onClick={() => copySummary(true)}>
                  JSON
                </button>
              </div>
            </div>
          ) : (
            <p className="balance-debug-hint">Resumen al morir.</p>
          )}
          {copyStatus ? <p className="balance-debug-copy-status">{copyStatus}</p> : null}
        </div>
      ) : null}
    </aside>
  )
}
