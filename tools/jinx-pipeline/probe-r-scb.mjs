const paths = [
  'game/assets/characters/jinx/skins/base/particles/jinx_r_mis.scb',
  'game/assets/characters/jinx/skins/base/particles/Jinx_R_Mis.scb',
  'game/assets/Characters/Jinx/Skins/Base/Particles/Jinx_R_Mis.scb',
  'game/assets/characters/jinx/skins/base/particles/jinx_r_mis.skn',
  'game/assets/particles/jinx_r_mis.scb',
  'game/assets/Particles/Jinx_R_Mis.scb',
  'game/assets/characters/jinx/skins/base/jinx_r_mis.scb',
]

const base = 'https://raw.communitydragon.org/latest/'
for (const p of paths) {
  const r = await fetch(base + p, { method: 'HEAD' })
  console.log(r.status, p, r.headers.get('content-length') ?? '')
}
