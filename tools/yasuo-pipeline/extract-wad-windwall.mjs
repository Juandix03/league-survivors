/**
 * Extract Yasuo W wind-wall meshes + color tex from local Yasuo.wad.client (LoL + CDTB).
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WAD =
  process.env.YASUO_WAD ??
  'C:/Riot Games/League of Legends/Game/DATA/FINAL/Champions/Yasuo.wad.client'
const OUT = join(__dirname, 'work/yasuo-wad-extract')

const PATTERNS = [
  '*particles/yasuo_w_windwall_mesh.scb',
  '*particles/yasuo_w_windwall_side_mesh.scb',
  '*particles/yasuo_w_windwall_top_mesh.scb',
  '*particles/yasuo_w_windwall_behind_mesh.scb',
  '*particles/Color_yasuo_w_windwall_dust.tex',
  '*particles/yasuo_w_windwall_main.tex',
  '*particles/yasuo_w_windwall_distort.tex',
]

if (!existsSync(WAD)) {
  console.error(`WAD not found: ${WAD}`)
  console.error('Set YASUO_WAD to your Yasuo.wad.client path.')
  process.exit(1)
}

for (const pattern of PATTERNS) {
  console.log('\n> extract', pattern)
  const r = spawnSync(
    `python -m cdtb wad-extract "${WAD}" -o "${OUT}" -p "${pattern}"`,
    { stdio: 'inherit', shell: true },
  )
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('\nExtracted under', OUT)
