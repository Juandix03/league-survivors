const BASE =
  'https://raw.communitydragon.org/latest/game/assets/characters/lux/skins/base/particles/'
const res = await fetch(BASE)
const html = await res.text()
const scb = [...html.matchAll(/href="([^"]+\.scb)"/gi)].map((m) => m[1]).sort()
console.log('SCB total:', scb.length)
for (const n of scb) console.log(n)

const binUrl =
  'https://raw.communitydragon.org/latest/game/data/characters/lux/lux.bin.json'
const bin = await fetch(binUrl).then((r) => (r.ok ? r.text() : ''))
if (bin) {
  const re = /lux[^"\\]{0,100}(?:q|w|e|r|mis|bind|light|prism|beam|sphere|shield)[^"\\]{0,100}/gi
  const hits = [...new Set(bin.match(re) ?? [])].sort()
  console.log('\nlux.bin strings:', hits.length)
  for (const h of hits.slice(0, 60)) console.log(' ', h)
}
