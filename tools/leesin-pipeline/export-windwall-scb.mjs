import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = join(
  __dirname,
  'work/yasuo-wad-extract/assets/characters/yasuo/skins/base/particles',
)

const jobs = [
  [join(BASE, 'yasuo_w_windwall_mesh.scb'), join(__dirname, 'work/yasuo_w_windwall_mesh.obj')],
  [
    join(BASE, 'yasuo_w_windwall_side_mesh.scb'),
    join(__dirname, 'work/yasuo_w_windwall_side_mesh.obj'),
  ],
]

for (const [scb, obj] of jobs) {
  if (!existsSync(scb)) {
    console.warn('Skip missing', scb)
    continue
  }
  const r = spawnSync('python', [join(__dirname, '../ahri-pipeline/scb-export-obj.py'), scb, obj], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}
