import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../..')

function run(label, args) {
  console.log('\n==', label)
  const r = spawnSync('node', args, { stdio: 'inherit', cwd: __dirname, shell: true })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('Q outbound (sphere + orbbackground)', [
  'bake-mesh-sprite.mjs',
  '--obj',
  'work/ahri_base_q_sphere_01.obj',
  '--tex',
  '../../public/assets/vfx/ahri/spells/ahri_base_q_orbbackground.png',
  '--out',
  '../../public/assets/vfx/ahri/q-projectile/ahri_q_orb_outbound_sprite.png',
  '--w',
  '512',
  '--h',
  '512',
])

run('Q return (sphere + orbedge tint pass)', [
  'bake-mesh-sprite.mjs',
  '--obj',
  'work/ahri_base_q_sphere_01.obj',
  '--tex',
  '../../public/assets/vfx/ahri/spells/ahri_base_q_orbedge.png',
  '--out',
  '../../public/assets/vfx/ahri/q-projectile/ahri_q_orb_return_sprite.png',
  '--w',
  '512',
  '--h',
  '512',
])

console.log('\nQ orb sprites written to public/assets/vfx/ahri/q-projectile/')
