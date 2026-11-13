#!/usr/bin/env node
/**
 * Extrae model.glb de un minion (local LoL + extractor Khada).
 * Alternativa sin repo Khada: npm run minions:download-glb -- <alias>
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveMinionAlias } from './minion-config.mjs'
import { khadaExtrasGlbUrl } from './download-minion-glb.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WORK = join(__dirname, 'work', 'extract')

const LEAGUE_CANDIDATES = [
  'C:\\Riot Games\\League of Legends',
  'D:\\Riot Games\\League of Legends',
  'C:\\Program Files\\Riot Games\\League of Legends',
]

function findLeaguePath() {
  const env = process.env.LEAGUE_PATH
  if (env && existsSync(join(env, 'Game', 'DATA', 'FINAL'))) {
    return env
  }
  for (const p of LEAGUE_CANDIDATES) {
    if (existsSync(join(p, 'Game', 'DATA', 'FINAL'))) {
      return p
    }
  }
  return null
}

function resolveLocalExtractor() {
  const exe = process.env.WAD_EXTRACTOR_EXE
  if (exe && existsSync(exe)) {
    return { mode: 'exe', path: exe }
  }
  const extractor = process.env.KHADA_EXTRACTOR
  const csproj = join(extractor ?? '', 'LeagueConvert.CommandLine.csproj')
  if (extractor && existsSync(csproj)) {
    return { mode: 'dotnet', path: extractor }
  }
  return null
}

function printNoExtractorHelp(key, character, label, khadaExtrasAlias) {
  const cdnLine = khadaExtrasAlias
    ? `
Ruta recomendada (sin clonar Khada, sin compilar):
  npm run minions:download-glb -- ${key}

CDN verificado:
  ${khadaExtrasGlbUrl(khadaExtrasAlias, 0)}
`
    : ''

  console.error(`
No se encontró el extractor Khada local.

${cdnLine}
Extractor local (solo si tenés el binario o el csproj):
  • WAD_EXTRACTOR_EXE = ruta a wad-extractor / LeagueConvert publicado (convert-wad …)
  • KHADA_EXTRACTOR = carpeta LeagueConvert.CommandLine con el .csproj

El monorepo https://github.com/Khada-Model-Viewer/khada devuelve "Repository not found";
la doc en https://docs.modelviewer.lol/extractor menciona releases pero no hay URL pública verificable.

Personaje objetivo (extract local): ${character} (${label})
`)
}

function runConvertWad(tool, character, outDir, leaguePath) {
  const convertArgs = [
    'convert-wad',
    character,
    '-o',
    outDir,
    '-s',
    '-a',
    '--skins',
    '0',
    '--no-download',
    '-l',
    leaguePath,
  ]

  if (tool.mode === 'exe') {
    return spawnSync(tool.path, convertArgs, { stdio: 'inherit', shell: true })
  }

  return spawnSync(
    'dotnet',
    ['run', '--project', tool.path, '--', ...convertArgs],
    { stdio: 'inherit', shell: true },
  )
}

function main() {
  const { key, character, label, khadaExtrasAlias } = resolveMinionAlias(process.argv[2])
  const tool = resolveLocalExtractor()
  if (!tool) {
    printNoExtractorHelp(key, character, label, khadaExtrasAlias)
    process.exit(1)
  }

  const leaguePath = findLeaguePath()
  if (!leaguePath) {
    console.error('No se detectó League of Legends. Seteá LEAGUE_PATH si está en otra unidad.')
    process.exit(1)
  }

  const outDir = join(WORK, key)
  mkdirSync(outDir, { recursive: true })

  console.log('Solo lectura en:', leaguePath)
  console.log('Salida en:', outDir)
  console.log('Personaje:', character)
  console.log('Extractor:', tool.mode === 'exe' ? tool.path : `dotnet → ${tool.path}`)

  const result = runConvertWad(tool, character, outDir, leaguePath)
  if (result.status !== 0) {
    console.error(`
Extract falló. Minions a veces no están en un .wad suelto de Champions.

Opciones seguras (no modifican LoL):
  • npm run minions:download-glb -- ${key}   (GLB ya procesado en CDN Khada)
  • Quitar --no-download y dejar que CDTB baje el WAD a %USERPROFILE%\\.khada-extractor\\cache
  • Pasar ruta a Map11: convert-wad "...\\Maps\\Shipping\\Map11.wad.client" (más pesado)

Ver README en tools/minions-pipeline/
`)
    process.exit(result.status ?? 1)
  }

  console.log('\nListo. Buscá model.glb bajo:', outDir)
}

main()
