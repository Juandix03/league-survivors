const base =
  'https://raw.communitydragon.org/latest/game/assets/characters/jinx/skins/base/particles/'
const files = [
  'jinx_base_e_mis_grenade.png',
  'jinx_base_e_mis_grenade_blur.png',
  'jinx_base_e_mis_type11.png',
  'jinx_base_e_splat_01.png',
  'jinx_base_e_splats_01.png',
  'jinx_base_e_tar_centerflare.png',
  'jinx_base_e_tar_praxis.png',
  'jinx_base_e_mine_debuff_geo_ringfire.png',
  'jinx_r_mis.png',
  'jinx_base_r_rocketfire_revision.png',
  'jinx_base_r_energy_01.png',
  'jinx_r_shape.png',
  'jinx_base_r_groundsmoke02.png',
  'aura_self.png',
]

for (const f of files) {
  const r = await fetch(base + f)
  if (!r.ok) {
    console.log(f, 'MISSING', r.status)
    continue
  }
  const buf = Buffer.from(await r.arrayBuffer())
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  console.log(`${f}\t${w}x${h}\t${buf.length}b`)
}
