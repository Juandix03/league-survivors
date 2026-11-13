import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = join(__dirname, 'work/leesin-wad-extract/assets/characters/leesin/skins/base/particles')
const PY = join(__dirname, '../ahri-pipeline/scb-export-obj.py')
const WORK = join(__dirname, 'work')

mkdirSync(WORK, { recursive: true })

const jobs = [
  ['leesin_base_q_mis_01_energyflame.scb', 'leesin_q_energyflame.obj'],
  ['leesin_base_q_wave_front.scb', 'leesin_q_wave_front.obj'],
  ['leesin_base_q_mis_cone.scb', 'leesin_q_mis_cone.obj'],
  ['leesin_base_q_shockwave.scb', 'leesin_q_shockwave.obj'],
  ['leesin_base_q_shockwave_low1.scb', 'leesin_q_shockwave_low.obj'],
]

for (const [scbName, objName] of jobs) {
  const scb = join(BASE, scbName)
  const obj = join(WORK, objName)
  if (!existsSync(scb)) {
    console.error('Missing', scb, '— run probe-leesin-q-scb.mjs')
    process.exit(1)
  }
  const r = spawnSync('python', [PY, scb, obj], { cwd: __dirname, stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('Lee Sin Q OBJ exports OK')
