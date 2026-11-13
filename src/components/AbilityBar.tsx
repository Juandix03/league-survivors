import type { AbilityHudSlot } from '../game/combat/jinxAbilityHud'
import { resolveChampionAbilityHudIcon } from '../game/ui/championAbilityHudIcons'
import type { ChampionId } from '../game/champions/types'

type AbilityBarProps = {
  slots: AbilityHudSlot[]
  championId?: ChampionId
}

function cooldownLabel(ms: number) {
  if (ms <= 0) return ''
  const s = Math.ceil(ms / 100) / 10
  return s >= 10 ? String(Math.ceil(s)) : s.toFixed(1)
}

export function AbilityBar({ slots, championId = 'jinx' }: AbilityBarProps) {
  const aria =
    championId === 'ahri'
      ? 'Habilidades de Ahri'
      : championId === 'yasuo'
        ? 'Habilidades de Yasuo'
        : championId === 'lux'
          ? 'Habilidades de Lux'
          : championId === 'leesin'
            ? 'Habilidades de Lee Sin'
            : championId === 'missfortune'
              ? 'Habilidades de Miss Fortune'
              : championId === 'ezreal'
                ? 'Habilidades de Ezreal'
                : 'Habilidades de Jinx'

  return (
    <div className="ability-bar" role="group" aria-label={aria}>
      {slots.map((slot) => {
        const cdPct =
          slot.cooldownTotalMs > 0
            ? Math.min(100, (slot.cooldownRemainingMs / slot.cooldownTotalMs) * 100)
            : 0
        const title =
          slot.state === 'locked' && slot.unlockHint
            ? `${slot.label} (bloqueada) · Tecla ${slot.hotkey}. ${slot.unlockHint}`
            : `${slot.label} · Tecla ${slot.hotkey}`

        const iconSrc = resolveChampionAbilityHudIcon(
          championId,
          slot.id,
          slot.label,
          slot.jinxQSwapIconWeapon ?? slot.jinxWeaponEquipped,
        )

        const jinxQVisualWeapon = slot.jinxQSwapIconWeapon ?? slot.jinxWeaponEquipped
        const jinxWeaponClass =
          championId === 'jinx' && slot.id === 'q' && jinxQVisualWeapon
            ? ` jinx-q--${jinxQVisualWeapon}`
            : ''

        return (
          <div
            key={slot.id}
            className={`ability-slot state-${slot.state}${jinxWeaponClass}`}
            title={title}
          >
            <div className="ability-icon-wrap">
              <img className="ability-icon" src={iconSrc} alt="" draggable={false} />
              <span className="ability-hotkey-badge" aria-hidden>
                {slot.hotkey}
              </span>
              {slot.level > 0 ? (
                <span className="ability-level-badge" aria-hidden>
                  {slot.level}
                </span>
              ) : null}
              {slot.state === 'cooldown' ? (
                <>
                  <div className="ability-cd-overlay" style={{ height: `${cdPct}%` }} />
                  <span className="ability-cd-text">{cooldownLabel(slot.cooldownRemainingMs)}</span>
                </>
              ) : null}
              {slot.state === 'locked' ? <div className="ability-lock" /> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
