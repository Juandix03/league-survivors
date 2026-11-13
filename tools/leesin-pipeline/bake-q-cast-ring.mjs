import { copyFileSync, mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LUX = join(__dirname, '../lux-pipeline')
const obj = resolve(__dirname, 'work/leesin_q_shockwave_low.obj')
mkdirSync(join(LUX, 'work'), { recursive: true })
copyFileSync(obj, join(LUX, 'work', 'leesin_q_shockwave_low.obj'))

const r = spawnSync(
  'node',
  [
    join(LUX, 'bake-mesh-sprite.mjs'),
    '--obj',
    obj,
    '--tex',
    resolve(__dirname, '../../public/assets/vfx/leesin/spells/leesin_base_q_cast_shockwave.png'),
    '--out',
    resolve(__dirname, '../../public/assets/vfx/leesin/baked/leesin_q_cast_ring_sprite.png'),
    '--w',
    '128',
    '--h',
    '128',
    '--rotY',
    '0',
    '--fill',
    '0.9',
    '--cam',
    'top',
    '--noTrim',
    '1',
  ],
  { cwd: __dirname, stdio: 'inherit' },
)
if (r.status !== 0) process.exit(r.status ?? 1)
