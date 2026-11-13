import type { ChampionId } from './champions/types'
import {
  MAX_Q_LEVEL,
  MAX_AHRI_W_LEVEL,
  MAX_AHRI_E_LEVEL,
  MAX_AHRI_R_LEVEL,
} from './combat/ahriAbilityState'
import {
  MAX_W_LEVEL,
  MAX_E_LEVEL,
  MAX_Q_LEVEL as MAX_JINX_Q_LEVEL,
  MAX_R_LEVEL,
} from './combat/jinxAbilityState'
import {
  MAX_LUX_Q_LEVEL,
  MAX_LUX_W_LEVEL,
  MAX_LUX_E_LEVEL,
  MAX_LUX_R_LEVEL,
} from './combat/luxAbilityState'
import {
  MAX_MF_Q,
  MAX_MF_W,
  MAX_MF_E,
  MAX_MF_R,
} from './combat/missFortuneAbilityState'
import {
  MAX_LEESIN_Q_LEVEL,
  MAX_LEESIN_W_LEVEL,
  MAX_LEESIN_E_LEVEL,
  MAX_LEESIN_R_LEVEL,
} from './combat/leeSinAbilityState'
import {
  MAX_YASUO_Q_LEVEL,
  MAX_YASUO_W_LEVEL,
  MAX_YASUO_E_LEVEL,
  MAX_YASUO_R_LEVEL,
} from './combat/yasuoAbilityState'
import {
  MAX_EZREAL_Q_LEVEL,
  MAX_EZREAL_W_LEVEL,
  MAX_EZREAL_E_LEVEL,
  MAX_EZREAL_R_LEVEL,
} from './combat/ezrealAbilityState'
import type { UpgradeId } from './upgradeIds'
import type { UpgradeOfferContext } from './upgradeOfferContext'
import type { UpgradeRunState } from './upgradeRunState'

type AbilitySlot = 'q' | 'w' | 'e' | 'r'

type CatalogEntry = {
  title: string | ((ctx: UpgradeOfferContext) => string)
  description: string
  icon: string
  isEligible: (ctx: UpgradeOfferContext) => boolean
  apply: (state: UpgradeRunState) => UpgradeRunState
}

type AbilityTrackKey =
  | 'abilities'
  | 'ahriAbilities'
  | 'luxAbilities'
  | 'missFortuneAbilities'
  | 'leeSinAbilities'
  | 'yasuoAbilities'
  | 'ezrealAbilities'

type TrackConfig = {
  championId: ChampionId
  stateKey: AbilityTrackKey
  maxBySlot: Record<AbilitySlot, number>
  labels: Record<AbilitySlot, { unlock: string; upgrade: string; desc: string; icon: string }>
  unlockExtra?: Partial<
    Record<AbilitySlot, (ctx: UpgradeOfferContext, level: number) => boolean>
  >
  idPrefix: string
}

function readLevel(ctx: UpgradeOfferContext, key: AbilityTrackKey, slot: AbilitySlot): number {
  const bag = ctx[key] as Record<AbilitySlot, number>
  return bag[slot] ?? 0
}

function writeLevel(
  state: UpgradeRunState,
  key: AbilityTrackKey,
  slot: AbilitySlot,
  level: number,
): UpgradeRunState {
  const bag = { ...(state[key] as Record<AbilitySlot, number>) }
  bag[slot] = level
  return { ...state, [key]: bag }
}

function defaultUnlockEligible(
  ctx: UpgradeOfferContext,
  slot: AbilitySlot,
  level: number,
): boolean {
  if (level > 0) return false
  switch (slot) {
    case 'q':
      return ctx.upgradePickCount >= 1 && ctx.playerLevel >= 2
    case 'w':
      return ctx.upgradePickCount >= 2 && ctx.playerLevel >= 2
    case 'e':
      return ctx.upgradePickCount >= 3 && ctx.playerLevel >= 3
    case 'r':
      return ctx.playerLevel >= 7 && ctx.upgradePickCount >= 6
    default:
      return false
  }
}

function jinxUnlockR(ctx: UpgradeOfferContext, level: number): boolean {
  if (level > 0) return false
  return (
    ctx.playerLevel >= 7 &&
    ctx.abilities.q > 0 &&
    ctx.abilities.w > 0 &&
    ctx.abilities.e > 0 &&
    ctx.upgradePickCount >= 6
  )
}

function buildTrackEntries(track: TrackConfig): Partial<Record<UpgradeId, CatalogEntry>> {
  const out: Partial<Record<UpgradeId, CatalogEntry>> = {}
  const slots: AbilitySlot[] = ['q', 'w', 'e', 'r']

  for (const slot of slots) {
    const cap = track.maxBySlot[slot]
    const meta = track.labels[slot]
    const unlockId = `${track.idPrefix}Unlock${slot.toUpperCase()}` as UpgradeId
    const upgradeId = `${track.idPrefix}Upgrade${slot.toUpperCase()}` as UpgradeId

    out[unlockId] = {
      title: meta.unlock,
      description: meta.desc,
      icon: meta.icon,
      isEligible: (ctx) => {
        if (ctx.championId !== track.championId) return false
        const level = readLevel(ctx, track.stateKey, slot)
        const extra = track.unlockExtra?.[slot]
        if (extra) return extra(ctx, level)
        return defaultUnlockEligible(ctx, slot, level)
      },
      apply: (state) => {
        const level = (state[track.stateKey] as Record<AbilitySlot, number>)[slot]
        if (level > 0) return state
        return writeLevel(state, track.stateKey, slot, 1)
      },
    }

    out[upgradeId] = {
      title: (ctx) => {
        const level = readLevel(ctx, track.stateKey, slot)
        return `${meta.upgrade} — Niv. ${level} → ${level + 1}`
      },
      description: meta.desc,
      icon: meta.icon,
      isEligible: (ctx) => {
        if (ctx.championId !== track.championId) return false
        const level = readLevel(ctx, track.stateKey, slot)
        return level > 0 && level < cap
      },
      apply: (state) => {
        const level = (state[track.stateKey] as Record<AbilitySlot, number>)[slot]
        if (level <= 0 || level >= cap) return state
        return writeLevel(state, track.stateKey, slot, level + 1)
      },
    }
  }

  return out
}

/** Dueño exclusivo de cada mejora de habilidad (stat upgrades no están). */
export const ABILITY_UPGRADE_OWNER: Partial<Record<UpgradeId, ChampionId>> = {}

function registerOwners(prefix: string, championId: ChampionId) {
  for (const slot of ['q', 'w', 'e', 'r'] as const) {
    ABILITY_UPGRADE_OWNER[`${prefix}Unlock${slot.toUpperCase()}` as UpgradeId] = championId
    ABILITY_UPGRADE_OWNER[`${prefix}Upgrade${slot.toUpperCase()}` as UpgradeId] = championId
  }
}

export function buildChampionAbilityUpgradeCatalog(): Partial<Record<UpgradeId, CatalogEntry>> {
  // Jinx Q/W/E/R — Q = cambio Pow-Pow / Fishbones (tecla 1)
  const jinx: Partial<Record<UpgradeId, CatalogEntry>> = {
    jinxUnlockQ: {
      title: '¡Cambia el fusil! (Q)',
      description: 'Desbloquea cambiar entre Pow-Pow y Fishbones con la tecla 1.',
      icon: '🔫',
      isEligible: (ctx) =>
        ctx.championId === 'jinx' &&
        ctx.abilities.q === 0 &&
        ctx.upgradePickCount >= 1 &&
        ctx.playerLevel >= 2,
      apply: (state) => ({
        ...state,
        abilities: { ...state.abilities, q: 1 },
      }),
    },
    jinxUpgradeQ: {
      title: (ctx) => `¡Cambia el fusil! — Niv. ${ctx.abilities.q} → ${ctx.abilities.q + 1}`,
      description: '+12% radio y +10% daño en área de Fishbones.',
      icon: '🔫',
      isEligible: (ctx) =>
        ctx.championId === 'jinx' && ctx.abilities.q > 0 && ctx.abilities.q < MAX_JINX_Q_LEVEL,
      apply: (state) => ({
        ...state,
        abilities: { ...state.abilities, q: state.abilities.q + 1 },
      }),
    },
    unlockW: {
      title: '¡Chispas! (W)',
      description: 'Desbloquea un rayo eléctrico automático hacia el enemigo más cercano.',
      icon: '⚡',
      isEligible: (ctx) =>
        ctx.championId === 'jinx' &&
        ctx.abilities.w === 0 &&
        ctx.upgradePickCount >= 2 &&
        ctx.playerLevel >= 2,
      apply: (state) => ({
        ...state,
        abilities: { ...state.abilities, w: 1 },
      }),
    },
    upgradeW: {
      title: (ctx) => `¡Chispas! — Niv. ${ctx.abilities.w} → ${ctx.abilities.w + 1}`,
      description: 'Más daño, alcance, velocidad y enemigos atravesados.',
      icon: '⚡',
      isEligible: (ctx) =>
        ctx.championId === 'jinx' && ctx.abilities.w > 0 && ctx.abilities.w < MAX_W_LEVEL,
      apply: (state) => ({
        ...state,
        abilities: { ...state.abilities, w: state.abilities.w + 1 },
      }),
    },
    unlockE: {
      title: '¡Mascafuegos! (E)',
      description: 'Coloca trampas que dañan y ralentizan enemigos.',
      icon: '🧨',
      isEligible: (ctx) =>
        ctx.championId === 'jinx' &&
        ctx.abilities.e === 0 &&
        ctx.upgradePickCount >= 3 &&
        ctx.playerLevel >= 3,
      apply: (state) => ({
        ...state,
        abilities: { ...state.abilities, e: 1 },
      }),
    },
    upgradeE: {
      title: (ctx) =>
        `¡Mascafuegos! — Niv. ${ctx.abilities.e} → ${ctx.abilities.e + 1}`,
      description: 'Más trampas activas, daño, duración y menor tiempo de reutilización.',
      icon: '🧨',
      isEligible: (ctx) =>
        ctx.championId === 'jinx' && ctx.abilities.e > 0 && ctx.abilities.e < MAX_E_LEVEL,
      apply: (state) => ({
        ...state,
        abilities: { ...state.abilities, e: state.abilities.e + 1 },
      }),
    },
    unlockR: {
      title: '¡Supermegacohete! (R)',
      description: 'Ultimate: cohete global con explosión en área (reutilización larga).',
      icon: '🚀',
      isEligible: (ctx) => ctx.championId === 'jinx' && jinxUnlockR(ctx, ctx.abilities.r),
      apply: (state) => ({
        ...state,
        abilities: { ...state.abilities, r: 1 },
      }),
    },
    upgradeR: {
      title: (ctx) =>
        `Supermegacohete — Niv. ${ctx.abilities.r} → ${ctx.abilities.r + 1}`,
      description: 'Más daño, radio de explosión y menor tiempo de reutilización.',
      icon: '🚀',
      isEligible: (ctx) =>
        ctx.championId === 'jinx' && ctx.abilities.r > 0 && ctx.abilities.r < MAX_R_LEVEL,
      apply: (state) => ({
        ...state,
        abilities: { ...state.abilities, r: state.abilities.r + 1 },
      }),
    },
  }

  ABILITY_UPGRADE_OWNER.jinxUnlockQ = 'jinx'
  ABILITY_UPGRADE_OWNER.jinxUpgradeQ = 'jinx'
  ABILITY_UPGRADE_OWNER.unlockW = 'jinx'
  ABILITY_UPGRADE_OWNER.upgradeW = 'jinx'
  ABILITY_UPGRADE_OWNER.unlockE = 'jinx'
  ABILITY_UPGRADE_OWNER.upgradeE = 'jinx'
  ABILITY_UPGRADE_OWNER.unlockR = 'jinx'
  ABILITY_UPGRADE_OWNER.upgradeR = 'jinx'

  const ahri = buildTrackEntries({
    championId: 'ahri',
    stateKey: 'ahriAbilities',
    idPrefix: 'ahri',
    maxBySlot: { q: MAX_Q_LEVEL, w: MAX_AHRI_W_LEVEL, e: MAX_AHRI_E_LEVEL, r: MAX_AHRI_R_LEVEL },
    labels: {
      q: {
        unlock: 'Orbe del engaño (Q)',
        upgrade: 'Orbe del engaño',
        desc: 'Más daño, velocidad y menor tiempo de reutilización.',
        icon: '✦',
      },
      w: {
        unlock: 'Fox-Fire (W)',
        upgrade: 'Fox-Fire',
        desc: 'Más espíritus, daño y menor tiempo de reutilización.',
        icon: '🔥',
      },
      e: {
        unlock: 'Encanto (E)',
        upgrade: 'Encanto',
        desc: 'Más daño y mejor control sobre enemigos.',
        icon: '💋',
      },
      r: {
        unlock: 'Espíritu de la raposa (R)',
        upgrade: 'Espíritu de la raposa',
        desc: 'Más cargas de dash y daño por impacto.',
        icon: '🦊',
      },
    },
    unlockExtra: {
      r: (ctx, level) =>
        level <= 0 &&
        ctx.playerLevel >= 7 &&
        ctx.ahriAbilities.q > 0 &&
        ctx.ahriAbilities.w > 0 &&
        ctx.upgradePickCount >= 6,
    },
  })

  // Ahri Q legacy ids
  ahri.unlockQ = {
    title: 'Orbe del engaño (Q)',
    description: 'Lanza un orbe ida y vuelta que daña enemigos.',
    icon: '✦',
    isEligible: (ctx) =>
      ctx.championId === 'ahri' &&
      ctx.ahriAbilities.q === 0 &&
      ctx.upgradePickCount >= 1 &&
      ctx.playerLevel >= 2,
    apply: (state) => ({
      ...state,
      ahriAbilities: { ...state.ahriAbilities, q: 1 },
    }),
  }
  ahri.upgradeQ = {
    title: (ctx) =>
      `Orbe — Niv. ${ctx.ahriAbilities.q} → ${ctx.ahriAbilities.q + 1}`,
    description: 'Más daño, velocidad y menor tiempo de reutilización.',
    icon: '✦',
    isEligible: (ctx) =>
      ctx.championId === 'ahri' &&
      ctx.ahriAbilities.q > 0 &&
      ctx.ahriAbilities.q < MAX_Q_LEVEL,
    apply: (state) => ({
      ...state,
      ahriAbilities: { ...state.ahriAbilities, q: state.ahriAbilities.q + 1 },
    }),
  }

  ABILITY_UPGRADE_OWNER.unlockQ = 'ahri'
  ABILITY_UPGRADE_OWNER.upgradeQ = 'ahri'
  registerOwners('ahri', 'ahri')

  const lux = buildTrackEntries({
    championId: 'lux',
    stateKey: 'luxAbilities',
    idPrefix: 'lux',
    maxBySlot: {
      q: MAX_LUX_Q_LEVEL,
      w: MAX_LUX_W_LEVEL,
      e: MAX_LUX_E_LEVEL,
      r: MAX_LUX_R_LEVEL,
    },
    labels: {
      q: {
        unlock: 'Luz encadenada (Q)',
        upgrade: 'Luz encadenada',
        desc: 'Más daño, alcance y menor tiempo de reutilización.',
        icon: '✴',
      },
      w: {
        unlock: 'Barrera prismática (W)',
        upgrade: 'Barrera prismática',
        desc: 'Escudo más fuerte y onda de daño mejorada.',
        icon: '🛡',
      },
      e: {
        unlock: 'Singularidad (E)',
        upgrade: 'Singularidad',
        desc: 'Zona más amplia, más daño y detonación más letal.',
        icon: '◎',
      },
      r: {
        unlock: 'Chispa final (R)',
        upgrade: 'Chispa final',
        desc: 'Haz ultimate más ancho, más daño y menor CD.',
        icon: '⚡',
      },
    },
    unlockExtra: {
      r: (ctx, level) =>
        level <= 0 &&
        ctx.playerLevel >= 7 &&
        ctx.luxAbilities.q > 0 &&
        ctx.luxAbilities.e > 0 &&
        ctx.upgradePickCount >= 6,
    },
  })
  registerOwners('lux', 'lux')

  const mf = buildTrackEntries({
    championId: 'missfortune',
    stateKey: 'missFortuneAbilities',
    idPrefix: 'mf',
    maxBySlot: { q: MAX_MF_Q, w: MAX_MF_W, e: MAX_MF_E, r: MAX_MF_R },
    labels: {
      q: {
        unlock: 'Double Up (Q)',
        upgrade: 'Double Up',
        desc: 'Más daño en el rebote y menor tiempo de reutilización.',
        icon: '🎯',
      },
      w: {
        unlock: 'Strut (W)',
        upgrade: 'Strut',
        desc: 'Más velocidad de movimiento y cadencia de ataque.',
        icon: '💃',
      },
      e: {
        unlock: 'Make It Rain (E)',
        upgrade: 'Make It Rain',
        desc: 'Lluvia más amplia, más daño y mayor duración.',
        icon: '🌧',
      },
      r: {
        unlock: 'Bullet Time (R)',
        upgrade: 'Bullet Time',
        desc: 'Más oleadas en el cono y mayor daño por impacto.',
        icon: '🔫',
      },
    },
    unlockExtra: {
      r: (ctx, level) =>
        level <= 0 &&
        ctx.playerLevel >= 7 &&
        ctx.missFortuneAbilities.q > 0 &&
        ctx.missFortuneAbilities.w > 0 &&
        ctx.upgradePickCount >= 6,
    },
  })
  registerOwners('mf', 'missfortune')

  const lee = buildTrackEntries({
    championId: 'leesin',
    stateKey: 'leeSinAbilities',
    idPrefix: 'lee',
    maxBySlot: {
      q: MAX_LEESIN_Q_LEVEL,
      w: MAX_LEESIN_W_LEVEL,
      e: MAX_LEESIN_E_LEVEL,
      r: MAX_LEESIN_R_LEVEL,
    },
    labels: {
      q: {
        unlock: 'Safeguard / Sonic Wave (Q)',
        upgrade: 'Sonic Wave',
        desc: 'Mayor daño, alcance y ventana de recast.',
        icon: '🥋',
      },
      w: {
        unlock: 'Safeguard (W)',
        upgrade: 'Safeguard',
        desc: 'Escudo y vampirismo más fuertes.',
        icon: '🛡',
      },
      e: {
        unlock: 'Tempest / Cripple (E)',
        upgrade: 'Tempest',
        desc: 'Más daño en área y cripple más efectivo.',
        icon: '💨',
      },
      r: {
        unlock: 'Dragons Rage (R)',
        upgrade: 'Dragons Rage',
        desc: 'Patada más letal y empuje más amplio.',
        icon: '🐉',
      },
    },
    unlockExtra: {
      r: (ctx, level) =>
        level <= 0 &&
        ctx.playerLevel >= 7 &&
        ctx.leeSinAbilities.q > 0 &&
        ctx.leeSinAbilities.w > 0 &&
        ctx.upgradePickCount >= 6,
    },
  })
  registerOwners('lee', 'leesin')

  const yasuo = buildTrackEntries({
    championId: 'yasuo',
    stateKey: 'yasuoAbilities',
    idPrefix: 'yasuo',
    maxBySlot: {
      q: MAX_YASUO_Q_LEVEL,
      w: MAX_YASUO_W_LEVEL,
      e: MAX_YASUO_E_LEVEL,
      r: MAX_YASUO_R_LEVEL,
    },
    labels: {
      q: {
        unlock: 'Steel Tempest (Q)',
        upgrade: 'Steel Tempest',
        desc: 'Corte más amplio, más daño y menor CD.',
        icon: '⚔',
      },
      w: {
        unlock: 'Wind Wall (W)',
        upgrade: 'Wind Wall',
        desc: 'Muralla más ancha y duradera.',
        icon: '🌬',
      },
      e: {
        unlock: 'Sweeping Blade (E)',
        upgrade: 'Sweeping Blade',
        desc: 'Dash con más daño y menor reutilización.',
        icon: '↯',
      },
      r: {
        unlock: 'Last Breath (R)',
        upgrade: 'Last Breath',
        desc: 'Ultimate más letal en enemigos levantados.',
        icon: '🌪',
      },
    },
    unlockExtra: {
      r: (ctx, level) =>
        level <= 0 &&
        ctx.playerLevel >= 7 &&
        ctx.yasuoAbilities.q > 0 &&
        ctx.yasuoAbilities.e > 0 &&
        ctx.upgradePickCount >= 6,
    },
  })
  registerOwners('yasuo', 'yasuo')

  const ezreal = buildTrackEntries({
    championId: 'ezreal',
    stateKey: 'ezrealAbilities',
    idPrefix: 'ez',
    maxBySlot: {
      q: MAX_EZREAL_Q_LEVEL,
      w: MAX_EZREAL_W_LEVEL,
      e: MAX_EZREAL_E_LEVEL,
      r: MAX_EZREAL_R_LEVEL,
    },
    labels: {
      q: {
        unlock: 'Mystic Shot (Q)',
        upgrade: 'Mystic Shot',
        desc: 'Más daño, perforación y menor tiempo de reutilización.',
        icon: '✦',
      },
      w: {
        unlock: 'Essence Flux (W)',
        upgrade: 'Essence Flux',
        desc: 'Marca más letal, zona más amplia y menor CD.',
        icon: '◎',
      },
      e: {
        unlock: 'Arcane Shift (E)',
        upgrade: 'Arcane Shift',
        desc: 'Más alcance de escape y daño al aterrizar.',
        icon: '↯',
      },
      r: {
        unlock: 'Trueshot Barrage (R)',
        upgrade: 'Trueshot Barrage',
        desc: 'Barrera global más ancha, más daño y menor CD.',
        icon: '⚡',
      },
    },
    unlockExtra: {
      r: (ctx, level) =>
        level <= 0 &&
        ctx.playerLevel >= 7 &&
        ctx.ezrealAbilities.q > 0 &&
        ctx.ezrealAbilities.w > 0 &&
        ctx.upgradePickCount >= 6,
    },
  })
  registerOwners('ez', 'ezreal')

  return { ...jinx, ...ahri, ...lux, ...mf, ...lee, ...yasuo, ...ezreal }
}

export function championUltimateUnlockId(championId: ChampionId): UpgradeId | null {
  const ids = championUnlockUpgradeIds(championId)
  return ids.find((id) => id.endsWith('UnlockR') || id === 'unlockR') ?? null
}

export function championQUnlockId(championId: ChampionId): UpgradeId | null {
  const ids = championUnlockUpgradeIds(championId)
  return ids.find((id) => id.endsWith('UnlockQ') || id === 'unlockQ') ?? null
}

/** Cuenta Q/W/E (o equivalentes) ya desbloqueados — sin la R. */
export function countUnlockedNonUltimateSpells(ctx: UpgradeOfferContext): number {
  const read = (): Record<string, number> => {
    switch (ctx.championId) {
      case 'jinx':
        return { q: ctx.abilities.q, w: ctx.abilities.w, e: ctx.abilities.e }
      case 'ahri':
        return { q: ctx.ahriAbilities.q, w: ctx.ahriAbilities.w, e: ctx.ahriAbilities.e }
      case 'lux':
        return { q: ctx.luxAbilities.q, w: ctx.luxAbilities.w, e: ctx.luxAbilities.e }
      case 'missfortune':
        return {
          q: ctx.missFortuneAbilities.q,
          w: ctx.missFortuneAbilities.w,
          e: ctx.missFortuneAbilities.e,
        }
      case 'leesin':
        return { q: ctx.leeSinAbilities.q, w: ctx.leeSinAbilities.w, e: ctx.leeSinAbilities.e }
      case 'yasuo':
        return { q: ctx.yasuoAbilities.q, w: ctx.yasuoAbilities.w, e: ctx.yasuoAbilities.e }
      case 'ezreal':
        return { q: ctx.ezrealAbilities.q, w: ctx.ezrealAbilities.w, e: ctx.ezrealAbilities.e }
      default:
        return {}
    }
  }
  return Object.values(read()).filter((lv) => lv > 0).length
}

export function championUnlockUpgradeIds(championId: ChampionId): UpgradeId[] {
  switch (championId) {
    case 'jinx':
      return ['jinxUnlockQ', 'unlockW', 'unlockE', 'unlockR']
    case 'ahri':
      return ['unlockQ', 'ahriUnlockW', 'ahriUnlockE', 'ahriUnlockR']
    case 'lux':
      return ['luxUnlockQ', 'luxUnlockW', 'luxUnlockE', 'luxUnlockR']
    case 'missfortune':
      return ['mfUnlockQ', 'mfUnlockW', 'mfUnlockE', 'mfUnlockR']
    case 'leesin':
      return ['leeUnlockQ', 'leeUnlockW', 'leeUnlockE', 'leeUnlockR']
    case 'yasuo':
      return ['yasuoUnlockQ', 'yasuoUnlockW', 'yasuoUnlockE', 'yasuoUnlockR']
    case 'ezreal':
      return ['ezUnlockQ', 'ezUnlockW', 'ezUnlockE', 'ezUnlockR']
    default:
      return []
  }
}
