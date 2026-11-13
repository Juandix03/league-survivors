/**
 * Extract Lux spell SCB/TEX from local Lux.wad.client (LoL installed).
 * Set LUX_WAD if needed.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WAD =
  process.env.LUX_WAD ??
  'C:/Riot Games/League of Legends/Game/DATA/FINAL/Champions/Lux.wad.client'
const OUT = join(__dirname, 'work/lux-wad-extract')

const PATTERNS = [
  '*lux/skins/base/particles/lux_base_slash.scb',
  '*lux/skins/base/particles/lux_base_q_portaledge_circle.scb',
  '*lux/skins/base/particles/lux_base_q_circle_fixed.scb',
  '*lux/skins/base/particles/lux_base_expo_cylinder.scb',
  '*lux/skins/base/particles/lux_q_shape.tex',
  '*lux/skins/base/particles/lux_base_q_buf_cylinder.tex',
  '*lux/skins/base/particles/lux_base_q_trail.tex',
  '*lux/skins/base/particles/sphere_e_01.tex',
  '*lux/skins/base/particles/lux_base_w_bw_shield_2d.tex',
  '*lux/skins/base/particles/lux_base_w_prism.tex',
  '*lux/skins/base/particles/lux_base_r_lazurbeam01.tex',
  '*lux/skins/base/particles/lux_base_r_lazurbeamglow.tex',
  '*shared/particles/sphere_01.scb',
]

if (!existsSync(WAD)) {
  console.error(`WAD not found: ${WAD}`)
  console.error('Set LUX_WAD to your Lux.wad.client path.')
  process.exit(1)
}

for (const pattern of PATTERNS) {
  console.log('\n> extract', pattern)
  const r = spawnSync('python', ['-m', 'cdtb', 'wad-extract', WAD, '-o', OUT, '-p', pattern], {
    stdio: 'inherit',
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('\nExtracted under', OUT)
