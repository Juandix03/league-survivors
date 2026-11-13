/**
 * Extract SCB/TEX sources for Ahri bakes from local Ahri.wad.client (requires LoL installed).
 * Outputs to work/ahri-wad-extract/ — gitignored.
 *
 * Default WAD path (Windows):
 *   C:/Riot Games/League of Legends/Game/DATA/FINAL/Champions/Ahri.wad.client
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WAD =
  process.env.AHRI_WAD ??
  'C:/Riot Games/League of Legends/Game/DATA/FINAL/Champions/Ahri.wad.client'
const OUT = join(__dirname, 'work/ahri-wad-extract')

const PATTERNS = [
  '*particles/ahri_base_q_sphere_01.scb',
  '*particles/common_magicball.scb',
  '*particles/ahri_base_q_orbbackground.tex',
  '*particles/ahri_base_q_orbedge.tex',
  '*particles/ahri_base_ba_orbbackground.tex',
  '*particles/ahri_base_ba_mote_01.tex',
  '*particles/ahri_base_e_heart_01.scb',
  '*particles/ahri_base_fox_1.scb',
  '*particles/ahri_base_w_swirls_01.scb',
  '*particles/ahridash.scb',
  '*particles/ahri_base_r_frontcapsule.scb',
]

if (!existsSync(WAD)) {
  console.error(`WAD not found: ${WAD}`)
  console.error('Set AHRI_WAD to your Ahri.wad.client path.')
  process.exit(1)
}

for (const pattern of PATTERNS) {
  console.log('\n> extract', pattern)
  const r = spawnSync(
    'python',
    ['-m', 'cdtb', 'wad-extract', WAD, '-o', OUT, '-p', pattern],
    { stdio: 'inherit', shell: true },
  )
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('\nExtracted under', OUT)
console.log('Next: python scb-export-obj.py … && node bake-mesh-sprite.mjs …')
