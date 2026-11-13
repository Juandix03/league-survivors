export type EnemyArchetypeId = 'basic' | 'fast' | 'tank'

export type EnemyArchetypeConfig = {
  id: EnemyArchetypeId
  label: string
  maxHealth: number
  speedMin: number
  speedMax: number
  radius: number
  bodyColor: number
  strokeColor: number
  strokeWidth: number
  eyeColor: number
  shadowW: number
  shadowH: number
}

/** Valores centralizados para balancear sin tocar ArenaScene. */
export const ENEMY_ARCHETYPES: Record<EnemyArchetypeId, EnemyArchetypeConfig> = {
  basic: {
    id: 'basic',
    label: 'Básico',
    maxHealth: 4,
    speedMin: 68,
    speedMax: 84,
    radius: 15,
    bodyColor: 0x991b1b,
    strokeColor: 0xfca5a5,
    strokeWidth: 3,
    eyeColor: 0xfff7ed,
    shadowW: 35,
    shadowH: 14,
  },
  fast: {
    id: 'fast',
    label: 'Rápido',
    maxHealth: 2,
    speedMin: 108,
    speedMax: 128,
    radius: 11,
    bodyColor: 0xc2410c,
    strokeColor: 0xfdba74,
    strokeWidth: 2,
    eyeColor: 0xffedd5,
    shadowW: 26,
    shadowH: 10,
  },
  tank: {
    id: 'tank',
    label: 'Tanque',
    maxHealth: 12,
    speedMin: 38,
    speedMax: 50,
    radius: 19,
    bodyColor: 0x581c87,
    strokeColor: 0xc4b5fd,
    strokeWidth: 4,
    eyeColor: 0xe9d5ff,
    shadowW: 42,
    shadowH: 16,
  },
}

const SPAWN_WEIGHTS: { id: EnemyArchetypeId; weight: number }[] = [
  { id: 'basic', weight: 0.5 },
  { id: 'fast', weight: 0.3 },
  { id: 'tank', weight: 0.2 },
]

export function rollEnemyArchetype(): EnemyArchetypeId {
  let roll = Math.random()
  for (const entry of SPAWN_WEIGHTS) {
    roll -= entry.weight
    if (roll <= 0) {
      return entry.id
    }
  }
  return 'basic'
}

export function resolveArchetypeSpeed(config: EnemyArchetypeConfig): number {
  return config.speedMin + Math.random() * (config.speedMax - config.speedMin)
}
