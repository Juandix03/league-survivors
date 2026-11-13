import { spawnSync } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function run(label, args) {
  console.log('\n==', label)
  const r = spawnSync('node', args, { stdio: 'inherit', cwd: __dirname, shell: true })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('R dash body (r_frontcapsule + r_airbullet — Ahri_Base_R_mis)', [
  'bake-mesh-sprite.mjs',
  '--obj',
  'work/ahri_base_r_frontcapsule.obj',
  '--tex',
  '../../public/assets/vfx/ahri/spells/ahri_base_r_airbullet.png',
  '--out',
  '../../public/assets/vfx/ahri/r-projectile/ahri_r_dash_capsule_sprite.png',
  '--w',
  '640',
  '--h',
  '512',
])

console.log('\nR dash sprite → public/assets/vfx/ahri/r-projectile/')
console.log('Note: ahridash.scb has no renderable triangles (bbox 0); use frontcapsule bake.')
