const r = await fetch(
  'https://raw.communitydragon.org/latest/game/assets/characters/jinx/skins/base/particles/',
)
const html = await r.text()
const re = /href="([^"]*mine[^"]*)"/gi
const set = new Set()
let m
while ((m = re.exec(html))) set.add(m[1])
;[...set].sort().forEach((x) => console.log(x))
console.log('total', set.size)
