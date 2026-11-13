/** Mapeo preview ↔ personaje Riot / rutas de trabajo. */

export const MINION_ALIASES = {
  'order-melee': {
    label: 'Order melee (azul)',
    character: 'SRU_OrderMinionMelee',
    khadaExtrasAlias: 'ha_orderminionmelee',
    clips: { idle: 'Idle1_Base', run: 'Run_Base' },
  },
  'chaos-melee': {
    label: 'Chaos melee (rojo)',
    character: 'SRU_ChaosMinionMelee',
    khadaExtrasAlias: 'ha_chaosminionmelee',
    clips: { idle: 'Idle1_Base', run: 'Run_Base' },
  },
  'order-ranged': {
    label: 'Order ranged',
    character: 'SRU_OrderMinionRanged',
    khadaExtrasAlias: 'ha_orderminionranged',
    clips: { idle: 'Idle1', run: 'Run', attack: 'Attack1' },
  },
  'chaos-ranged': {
    label: 'Chaos ranged',
    character: 'SRU_ChaosMinionRanged',
    khadaExtrasAlias: 'ha_chaosminionranged',
    clips: { idle: 'Idle1', run: 'Run', attack: 'Attack1' },
  },
  'order-siege': {
    label: 'Order siege',
    character: 'SRU_OrderMinionSiege',
    khadaExtrasAlias: 'ha_orderminionsiege',
    /** GLB Khada extras: Idle1 + Run (no Run_Base / Idle1_Base). */
    clips: { idle: 'Idle1', run: 'Run', attack: 'Attack1_BASE' },
  },
  'chaos-siege': {
    label: 'Chaos siege',
    character: 'SRU_ChaosMinionSiege',
    khadaExtrasAlias: 'ha_chaosminionsiege',
    clips: { idle: 'Idle1', run: 'Run', attack: 'Attack1_BASE' },
  },
  'order-super': {
    label: 'Order super',
    character: 'SRU_OrderMinionSuper',
    khadaExtrasAlias: 'ha_orderminionsuper',
    clips: { idle: 'Idle1_Base', run: 'Run_Base' },
  },
  'chaos-super': {
    label: 'Chaos super',
    character: 'SRU_ChaosMinionSuper',
    khadaExtrasAlias: 'ha_chaosminionsuper',
    clips: { idle: 'Idle1_Base', run: 'Run_Base' },
  },
}

export function resolveMinionAlias(argvAlias) {
  const key = argvAlias ?? 'order-melee'
  const spec = MINION_ALIASES[key]
  if (!spec) {
    throw new Error(`Alias desconocido "${key}". Usá: ${Object.keys(MINION_ALIASES).join(', ')}`)
  }
  return { key, ...spec }
}
