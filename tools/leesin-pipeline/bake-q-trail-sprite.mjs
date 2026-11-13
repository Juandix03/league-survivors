/**
 * Lee Sin Q — side trail (mis cone + mis_front_02), stretches behind orb in arena.
 */
import { copyFileSync, mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LUX = join(__dirname, '../lux-pipeline')
const OUT = '../../public/assets/vfx/leesin/baked/leesin_q_trail_sprite.png'
const obj = resolve(__dirname, 'work/leesin_q_mis_cone.obj')
mkdirSync(join(LUX, 'work'), { recursive: true })
copyFileSync(obj, join(LUX, 'work', 'leesin_q_mis_cone.obj'))

const r = spawnSync(
  'node',
  [
    join(LUX, 'bake-mesh-sprite.mjs'),
    '--obj',
    obj,
    '--tex',
    resolve(__dirname, '../../public/assets/vfx/leesin/spells/base_leesin_q_mis_front_02.png'),
    '--out',
    resolve(__dirname, OUT),
    '--w',
    '256',
    '--h',
    '128',
    '--rotY',
    '0',
    '--fill',
    '0.92',
    '--cam',
    'side',
    '--noTrim',
    '1',
  ],
  { cwd: __dirname, stdio: 'inherit' },
)
if (r.status !== 0) process.exit(r.status ?? 1)
