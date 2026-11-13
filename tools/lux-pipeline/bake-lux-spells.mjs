import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL = '../../public/assets/vfx/lux/spells'
const OUT = '../../public/assets/vfx/lux/baked'

function run(label, args) {
  console.log('\n==', label)
  const r = spawnSync('node', ['bake-mesh-sprite.mjs', ...args], {
    cwd: __dirname,
    stdio: 'inherit',
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

run('Q Light Binding side view (slash + lux_q_shape)', [
  '--obj',
  'work/lux_base_slash.obj',
  '--tex',
  `${SPELL}/lux_q_shape.png`,
  '--out',
  `${OUT}/lux_q_binding_sprite.png`,
  '--w',
  '1024',
  '--h',
  '384',
  '--rotY',
  '0',
  '--fill',
  '0.94',
  '--cam',
  'side',
])

run('Q portal ring (portaledge + q_shape)', [
  '--obj',
  'work/lux_base_q_portaledge_circle.obj',
  '--tex',
  `${SPELL}/lux_q_shape.png`,
  '--out',
  `${OUT}/lux_q_portal_ring_sprite.png`,
  '--w',
  '384',
  '--h',
  '384',
  '--cam',
  'top',
  '--fill',
  '0.88',
])

run('Q root ring (circle_fixed + gradient)', [
  '--obj',
  'work/lux_base_q_circle_fixed.obj',
  '--tex',
  `${SPELL}/lux_base_q_gradient_1.png`,
  '--out',
  `${OUT}/lux_q_root_ring_sprite.png`,
  '--w',
  '256',
  '--h',
  '256',
  '--cam',
  'top',
  '--fill',
  '0.9',
])

run('Q cylinder pass (slash + q_buf_cylinder)', [
  '--obj',
  'work/lux_base_slash.obj',
  '--tex',
  `${SPELL}/lux_base_q_buf_cylinder.png`,
  '--out',
  `${OUT}/lux_q_binding_cylinder_sprite.png`,
  '--w',
  '640',
  '--h',
  '256',
])

run('E singularity (expo cylinder + sphere_e)', [
  '--obj',
  'work/lux_base_expo_cylinder.obj',
  '--tex',
  `${SPELL}/sphere_e_01.png`,
  '--out',
  `${OUT}/lux_e_singularity_sprite.png`,
  '--w',
  '384',
  '--h',
  '384',
])

run('W prismatic wave (expo + w_prism, side)', [
  '--obj',
  'work/lux_base_expo_cylinder.obj',
  '--tex',
  `${SPELL}/lux_base_w_prism.png`,
  '--out',
  `${OUT}/lux_w_wave_sprite.png`,
  '--w',
  '512',
  '--h',
  '192',
  '--cam',
  'side',
  '--rotY',
  '1.5708',
  '--fill',
  '0.9',
])

run('W shield slab (expo + bw_shield_2d)', [
  '--obj',
  'work/lux_base_expo_cylinder.obj',
  '--tex',
  `${SPELL}/lux_base_w_bw_shield_2d.png`,
  '--out',
  `${OUT}/lux_w_barrier_sprite.png`,
  '--w',
  '512',
  '--h',
  '128',
])

run('W shield bubble top (circle_fixed + light-shield)', [
  '--obj',
  'work/lux_base_q_circle_fixed.obj',
  '--tex',
  `${SPELL}/light-shield.png`,
  '--out',
  `${OUT}/lux_w_shield_bubble_sprite.png`,
  '--w',
  '256',
  '--h',
  '256',
  '--cam',
  'top',
  '--fill',
  '0.88',
])

run('R beam core (expo + lazurbeam01)', [
  '--obj',
  'work/lux_base_expo_cylinder.obj',
  '--tex',
  `${SPELL}/lux_base_r_lazurbeam01.png`,
  '--out',
  `${OUT}/lux_r_beam_sprite.png`,
  '--w',
  '1024',
  '--h',
  '160',
  '--cam',
  'side',
  '--rotY',
  '1.5708',
  '--fill',
  '0.93',
])

run('R beam glow', [
  '--obj',
  'work/lux_base_expo_cylinder.obj',
  '--tex',
  `${SPELL}/lux_base_r_lazurbeamglow.png`,
  '--out',
  `${OUT}/lux_r_beam_glow_sprite.png`,
  '--w',
  '1024',
  '--h',
  '160',
  '--cam',
  'side',
  '--rotY',
  '1.5708',
  '--fill',
  '0.93',
])

console.log('\nLux baked sprites → public/assets/vfx/lux/baked/')
