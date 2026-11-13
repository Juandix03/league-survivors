import { spawnSync } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function run(label, args) {
  console.log('\n==', label)
  const r = spawnSync('node', args, { stdio: 'inherit', cwd: __dirname, shell: true })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('E charm (e_heart_01.scb + e_heart_01 UV — Ahri_Base_E_mis)', [
  'bake-mesh-sprite.mjs',
  '--obj',
  'work/ahri_base_e_heart_01.obj',
  '--tex',
  '../../public/assets/vfx/ahri/spells/ahri_base_e_heart_01.png',
  '--out',
  '../../public/assets/vfx/ahri/e-projectile/ahri_e_charm_sprite.png',
  '--w',
  '512',
  '--h',
  '512',
])

console.log('\nE charm sprite → public/assets/vfx/ahri/e-projectile/')
