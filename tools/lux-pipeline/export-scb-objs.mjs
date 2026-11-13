import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = join(__dirname, 'work/lux-wad-extract/assets/characters/lux/skins/base/particles')
const SHARED = join(__dirname, 'work/lux-wad-extract/assets/shared/particles')
const PY = join(__dirname, '../ahri-pipeline/scb-export-obj.py')

const jobs = [
  [join(BASE, 'lux_base_slash.scb'), join(__dirname, 'work/lux_base_slash.obj')],
  [join(BASE, 'lux_base_q_portaledge_circle.scb'), join(__dirname, 'work/lux_base_q_portaledge_circle.obj')],
  [join(BASE, 'lux_base_q_circle_fixed.scb'), join(__dirname, 'work/lux_base_q_circle_fixed.obj')],
  [join(BASE, 'lux_base_expo_cylinder.scb'), join(__dirname, 'work/lux_base_expo_cylinder.obj')],
  [join(SHARED, 'sphere_01.scb'), join(__dirname, 'work/sphere_01.obj')],
]

for (const [scb, obj] of jobs) {
  if (!existsSync(scb)) {
    console.error('Missing', scb, '— run extract-wad-spell-assets.mjs')
    process.exit(1)
  }
  const r = spawnSync('python', [PY, scb, obj], { cwd: __dirname, stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('OBJ exports OK')
