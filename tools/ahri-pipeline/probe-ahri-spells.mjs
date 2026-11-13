/**
 * Probe CommunityDragon for Ahri spell particle PNGs (base skin).
 */
const BASE =
  'https://raw.communitydragon.org/latest/game/assets/characters/ahri/skins/base/particles/'

const NAMES = [
  'ahri_ba_mis',
  'ahri_base_ba_mis',
  'Ahri_BA_mis',
  'ahri_q_mis',
  'ahri_base_q_mis',
  'Ahri_Q_mis',
  'Ahri_Q_mis_02',
  'ahri_base_q_mis',
  'ahri_w_mis',
  'ahri_base_w_mis',
  'Ahri_W_mis',
  'ahri_e_mis',
  'ahri_base_e_mis',
  'Ahri_E_mis',
  'ahri_r_mis',
  'ahri_base_r_mis',
  'Ahri_R_mis',
  'Ahri_R_mis_02',
  'ahri_base_primary_q_mis',
  'ahri_q_return',
]

const found = []
async function headOk(url) {
  const res = await fetch(url, { method: 'HEAD' })
  return res.ok
}

for (const stem of NAMES) {
  const file = `${stem}.png`
  if (await headOk(BASE + file)) found.push(file)
}

console.log('Found', found.length)
for (const f of found.sort()) console.log(f)
