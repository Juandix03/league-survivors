import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const r = spawnSync(
  'node',
  [
    'bake-mesh-sprite.mjs',
    '--obj',
    'work/common_magicball.obj',
    '--tex',
    '../../public/assets/vfx/ahri/ahri_base_ba_orbbackground.png',
    '--out',
    '../../public/assets/vfx/ahri/ba-projectile/ahri_ba_magicball_sprite.png',
    '--w',
    '384',
    '--h',
    '384',
  ],
  { stdio: 'inherit', cwd: __dirname, shell: true },
)

if (r.status !== 0) process.exit(r.status ?? 1)
console.log('BA sprite → public/assets/vfx/ahri/ba-projectile/ahri_ba_magicball_sprite.png')
