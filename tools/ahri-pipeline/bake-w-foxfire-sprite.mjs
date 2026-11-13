import { spawnSync } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function run(label, args) {
  console.log('\n==', label)
  const r = spawnSync('node', args, { stdio: 'inherit', cwd: __dirname, shell: true })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('W foxfire (fox_1 + orb_fox_01 — Ahri_Base_W_mis)', [
  'bake-mesh-sprite.mjs',
  '--obj',
  'work/ahri_base_fox_1.obj',
  '--tex',
  '../../public/assets/vfx/ahri/spells/ahri_base_orb_fox_01.png',
  '--out',
  '../../public/assets/vfx/ahri/w-projectile/ahri_w_foxfire_sprite.png',
  '--w',
  '512',
  '--h',
  '512',
])

run('W foxfire alt (fox_1 + orb_fox_03 — Ahri_Base_W_mis_02)', [
  'bake-mesh-sprite.mjs',
  '--obj',
  'work/ahri_base_fox_1.obj',
  '--tex',
  '../../public/assets/vfx/ahri/spells/ahri_base_orb_fox_03.png',
  '--out',
  '../../public/assets/vfx/ahri/w-projectile/ahri_w_foxfire_alt_sprite.png',
  '--w',
  '512',
  '--h',
  '512',
])

console.log('\nW foxfire sprites → public/assets/vfx/ahri/w-projectile/')
