import type { AbilityHudSlot } from './combat/jinxAbilityHud'
import type { HudListener, HudSnapshot, LevelUpOffer } from './hud'

function abilitiesHudChanged(a: AbilityHudSlot[], b: AbilityHudSlot[]): boolean {
  if (a.length !== b.length) return true
  return a.some((slot, index) => {
    const other = b[index]
    if (!other) return true
    if (slot.state !== other.state || slot.level !== other.level) return true
    if (slot.jinxWeaponEquipped !== other.jinxWeaponEquipped) return true
    if (slot.label !== other.label) return true
    return (
      Math.floor(slot.cooldownRemainingMs / 150) !==
      Math.floor(other.cooldownRemainingMs / 150)
    )
  })
}

const ELAPSED_PUBLISH_MS = 250

function levelUpOfferEqual(
  a: LevelUpOffer | null,
  b: LevelUpOffer | null,
): boolean {
  if (a === b) {
    return true
  }
  if (!a || !b) {
    return false
  }
  if (
    a.levelReached !== b.levelReached ||
    a.pendingChoices !== b.pendingChoices ||
    a.options.length !== b.options.length
  ) {
    return false
  }
  return a.options.every((option, index) => option.id === b.options[index]?.id)
}

function shouldPublishHud(previous: HudSnapshot, next: HudSnapshot): boolean {
  if (previous.gameOver !== next.gameOver) return true
  if (previous.health !== next.health) return true
  if (previous.maxHealth !== next.maxHealth) return true
  if (previous.kills !== next.kills) return true
  if (previous.level !== next.level) return true
  if (previous.xp !== next.xp) return true
  if (previous.xpToNextLevel !== next.xpToNextLevel) return true
  if (!levelUpOfferEqual(previous.levelUpOffer, next.levelUpOffer)) return true
  if (previous.debugFps !== next.debugFps) return true
  if (previous.activeWeapon !== next.activeWeapon) return true
  if (abilitiesHudChanged(previous.abilities, next.abilities)) return true

  const prevBal = previous.balanceDebug?.live
  const nextBal = next.balanceDebug?.live
  if (prevBal !== nextBal) {
    if (!prevBal || !nextBal) return true
    if (
      prevBal.kills !== nextBal.kills ||
      prevBal.level !== nextBal.level ||
      prevBal.aliveEnemies !== nextBal.aliveEnemies ||
      prevBal.levelUpsTotal !== nextBal.levelUpsTotal ||
      prevBal.health !== nextBal.health ||
      Math.abs(prevBal.projectileDamage - nextBal.projectileDamage) > 0.001
    ) {
      return true
    }
  }
  if (previous.balanceDebug?.summary !== next.balanceDebug?.summary) return true

  const previousTick = Math.floor(previous.elapsedMs / ELAPSED_PUBLISH_MS)
  const nextTick = Math.floor(next.elapsedMs / ELAPSED_PUBLISH_MS)
  return previousTick !== nextTick
}

export function createHudPublisher(onHud: (snapshot: HudSnapshot) => void): HudListener {
  let previous: HudSnapshot | undefined

  return (snapshot: HudSnapshot, force = false) => {
    if (!force && previous && !shouldPublishHud(previous, snapshot)) {
      return
    }
    previous = snapshot
    onHud(snapshot)
  }
}
