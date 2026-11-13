import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = join(
  __dirname,
  'work/ahri-wad-extract/assets/characters/ahri/skins/base/particles',
)

const jobs = [
  [join(BASE, 'common_magicball.scb'), join(__dirname, 'work/common_magicball.obj')],
  [join(BASE, 'ahri_base_q_sphere_01.scb'), join(__dirname, 'work/ahri_base_q_sphere_01.obj')],
  [join(BASE, 'ahri_base_fox_1.scb'), join(__dirname, 'work/ahri_base_fox_1.obj')],
  [join(BASE, 'ahri_base_e_heart_01.scb'), join(__dirname, 'work/ahri_base_e_heart_01.obj')],
  [join(BASE, 'ahri_base_r_frontcapsule.scb'), join(__dirname, 'work/ahri_base_r_frontcapsule.obj')],
  [join(BASE, 'ahridash.scb'), join(__dirname, 'work/ahridash.obj')],
]

for (const [scb, obj] of jobs) {
  if (!existsSync(scb)) {
    console.error('Missing', scb, '— run extract-wad-spell-assets.mjs')
    process.exit(1)
  }
  const r = spawnSync('python', ['scb-export-obj.py', scb, obj], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}
