/**
 * Probe CommunityDragon for Yasuo W / windwall assets.
 */
const PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/characters/yasuo/skins/base/particles/'
const SPELLS =
  'https://raw.communitydragon.org/latest/game/assets/characters/yasuo/skins/base/'

const PREFIXES = [
  'yasuo_w',
  'yasuow',
  'yasuo_w_',
  'windwall',
  'wind_wall',
  'windwall',
  'yasuo_base_w',
]

const SUFFIXES = [
  '',
  '_mis',
  '_missile',
  '_cas',
  '_cast',
  '_tar',
  '_main',
  '_main_02',
  '_main_03',
  '_child',
  '_wall',
  '_ring',
  '_steam',
  '_wispy',
  '_mult',
  '_dust',
  '_indicator',
  '_mesh',
  '_shape',
  '_blade',
  '_glow',
  '_trail',
  '_01',
  '_02',
  '_03',
]

async function headOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

async function listDir(base) {
  try {
    const res = await fetch(base)
    if (!res.ok) return []
    const html = await res.text()
    return [...html.matchAll(/href="([^"]+\.(png|scb|skn|bin|glb))"/gi)].map((m) => m[1])
  } catch {
    return []
  }
}

const found = new Set()

for (const pre of PREFIXES) {
  for (const suf of SUFFIXES) {
    const file = `${pre}${suf}.png`
    if (await headOk(PARTICLES + file)) found.add('particles/' + file)
  }
}

for (const href of await listDir(PARTICLES)) {
  if (/wind|wall|spell2|yasuo_w/i.test(href)) found.add('particles/' + href)
}

for (const href of await listDir(SPELLS)) {
  if (/wind|wall|w_/i.test(href)) found.add('skin/' + href)
}

console.log('Found', found.size, 'assets')
for (const f of [...found].sort()) console.log(f)
