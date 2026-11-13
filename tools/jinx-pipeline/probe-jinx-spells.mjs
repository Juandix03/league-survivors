/**
 * Probe CommunityDragon for Jinx W/E/R particle PNGs (base skin).
 */
const BASE =
  'https://raw.communitydragon.org/latest/game/assets/characters/jinx/skins/base/particles/'

const PREFIXES = [
  'jinx_w',
  'jinxw',
  'jinx_w_',
  'jinx_e',
  'jinxe',
  'jinx_e_',
  'jinx_r',
  'jinxr',
  'jinx_r_',
  'jinx_zap',
  'zap',
  'chomper',
  'flame',
  'mega',
  'super',
  'death',
  'rocket',
]

const SUFFIXES = [
  '',
  '_mis',
  '_missile',
  '_beam',
  '_hit',
  '_cas',
  '_cast',
  '_tar',
  '_target',
  '_explosion',
  '_smoke',
  '_trail',
  '_mine',
  '_trap',
  '_fuse',
  '_root',
  '_buff',
  '_ground',
  '_aoe',
  '_flash',
  '_glow',
  '_spark',
  '_ring',
]

const found = []

async function headOk(url) {
  const res = await fetch(url, { method: 'HEAD' })
  return res.ok
}

for (const pre of PREFIXES) {
  for (const suf of SUFFIXES) {
    const file = `${pre}${suf}.png`
    const url = BASE + file
    if (await headOk(url)) found.push(file)
  }
}

console.log('Found', found.length, 'PNG files')
for (const f of found.sort()) console.log(f)
