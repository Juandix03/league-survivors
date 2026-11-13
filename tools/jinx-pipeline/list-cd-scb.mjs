const r = await fetch(
  'https://raw.communitydragon.org/latest/game/assets/characters/jinx/skins/base/particles/',
)
const html = await r.text()
const re = /href="([^"]+\.scb)"/gi
const set = new Set()
let m
while ((m = re.exec(html))) set.add(m[1])
;[...set].sort().forEach((x) => console.log(x))
console.log('total scb', set.size)

const r2 = await fetch(
  'https://raw.communitydragon.org/latest/game/assets/particles/',
)
const html2 = await r2.text()
const re2 = /href="([^"]*arrow01[^"]*)"/gi
while ((m = re2.exec(html2))) console.log('global', m[1])
