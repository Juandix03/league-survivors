/**
 * Simulaciones headless de partidas survivor (balance / Monte Carlo).
 *
 * Uso:
 *   npx tsx tools/simulate-runs-cli.ts
 *   npx tsx tools/simulate-runs-cli.ts --runs 200 --minutes 10 --seed 42
 *   npx tsx tools/simulate-runs-cli.ts --champion lux --policy random
 *   npx tsx tools/simulate-runs-cli.ts --runs 100 --csv out/sim.csv
 */
import fs from 'node:fs'
import path from 'node:path'
import type { ChampionId } from '../src/game/champions/types'
import {
  runSurvivalBatch,
  runSurvivalSimulation,
  type SimPlayerBehavior,
  type SurvivalSimResult,
} from '../src/game/sim/survivalRunSimulator'
import type { SimUpgradePolicy } from '../src/game/sim/simUpgradePicker'
import type { SimAbilityStartMode } from '../src/game/sim/simChampionInit'

const CHAMPIONS: ChampionId[] = [
  'jinx',
  'ahri',
  'lux',
  'missfortune',
  'leesin',
  'yasuo',
  'ezreal',
]

function parseArgs(argv: string[]) {
  let runs = 50
  let minutes = 10
  let seed: number | undefined
  let behavior: SimPlayerBehavior = 'kite'
  let championId: ChampionId = 'jinx'
  let policy: SimUpgradePolicy = 'greedy'
  let abilityStart: SimAbilityStartMode = 'production'
  let csvPath: string | undefined

  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--runs' && argv[i + 1]) {
      runs = Math.max(1, Number.parseInt(argv[++i], 10))
    } else if (a === '--minutes' && argv[i + 1]) {
      minutes = Math.max(0.5, Number.parseFloat(argv[++i]))
    } else if (a === '--seed' && argv[i + 1]) {
      seed = Number.parseInt(argv[++i], 10)
    } else if (a === '--champion' && argv[i + 1]) {
      const c = argv[++i] as ChampionId
      if (CHAMPIONS.includes(c)) championId = c
    } else if (a === '--policy' && argv[i + 1]) {
      const p = argv[++i]
      if (p === 'random' || p === 'greedy') policy = p
    } else if (a === '--abilities' && argv[i + 1]) {
      const m = argv[++i]
      if (m === 'dev' || m === 'production') abilityStart = m
    } else if (a === '--csv' && argv[i + 1]) {
      csvPath = argv[++i]
    } else if (a === '--stand') {
      behavior = 'stand'
    } else if (a === '--kite') {
      behavior = 'kite'
    }
  }

  const positional = argv.slice(2).filter((a) => !a.startsWith('--'))
  if (positional[0] && Number.isFinite(Number.parseInt(positional[0], 10))) {
    runs = Math.max(1, Number.parseInt(positional[0], 10))
  }
  if (positional[1] && Number.isFinite(Number.parseFloat(positional[1]))) {
    minutes = Math.max(0.5, Number.parseFloat(positional[1]))
  }
  if (positional[2] && Number.isFinite(Number.parseInt(positional[2], 10))) {
    seed = Number.parseInt(positional[2], 10)
  }

  return {
    runs,
    maxCombatMs: Math.round(minutes * 60 * 1000),
    seed,
    behavior,
    championId,
    policy,
    abilityStart,
    csvPath,
  }
}

function writeCsv(filePath: string, results: SurvivalSimResult[]) {
  const header =
    'run,survived,combatMs,kills,coins,level,upgradePicks,playerHpLeft,peakEnemiesAlive,damageTaken,championId'
  const lines = results.map((r, i) =>
    [
      i + 1,
      r.survived ? 1 : 0,
      r.combatMs,
      r.kills,
      r.coins,
      r.level,
      r.upgradePicks,
      r.playerHpLeft,
      r.peakEnemiesAlive,
      r.damageTaken,
      r.championId,
    ].join(','),
  )
  const dir = path.dirname(filePath)
  if (dir && dir !== '.') {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filePath, [header, ...lines].join('\n'), 'utf8')
}

const opts = parseArgs(process.argv)

const simConfig = {
  maxCombatMs: opts.maxCombatMs,
  seed: opts.seed,
  behavior: opts.behavior,
  championId: opts.championId,
  upgradePolicy: opts.policy,
  abilityStart: opts.abilityStart,
}

if (opts.runs === 1) {
  const r = runSurvivalSimulation(simConfig)
  console.log(JSON.stringify(r, null, 2))
} else {
  const { results, summary } = runSurvivalBatch(opts.runs, simConfig)
  console.log('--- Resumen simulación survivor ---')
  console.log(`Campeón: ${summary.championId} | Política mejoras: ${opts.policy}`)
  console.log(`Partidas: ${summary.runs} | Supervivientes: ${summary.survived}`)
  console.log(
    `Tiempo combate (ms): mediana ${Math.round(summary.medianCombatMs)} | p10 ${Math.round(summary.p10CombatMs)} | p90 ${Math.round(summary.p90CombatMs)}`,
  )
  console.log(
    `Promedios: ${(summary.avgCombatMs / 1000).toFixed(1)}s | ${summary.avgKills.toFixed(1)} kills | ${summary.avgCoins.toFixed(0)} monedas | nivel ${summary.avgLevel.toFixed(1)} | ${summary.avgUpgradePicks.toFixed(1)} mejoras`,
  )
  console.log(`Comportamiento jugador: ${opts.behavior}`)
  console.log(`Tope simulado: ${opts.maxCombatMs / 1000}s | Habilidades: ${opts.abilityStart}`)
  if (opts.seed !== undefined) {
    console.log(`Semilla base: ${opts.seed}`)
  }
  if (opts.csvPath) {
    writeCsv(opts.csvPath, results)
    console.log(`CSV: ${path.resolve(opts.csvPath)}`)
  }
}
