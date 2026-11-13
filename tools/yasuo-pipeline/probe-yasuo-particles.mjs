const url =
  'https://raw.communitydragon.org/latest/game/data/characters/yasuo/skins/skin0.bin.json'
const res = await fetch(url)
if (!res.ok) {
  console.error(res.status)
  process.exit(1)
}
const text = await res.text()
const re = /yasuo[a-z0-9_./-]+\.png/gi
const hits = [...new Set(text.match(re) ?? [])].sort()
console.log(hits.join('\n'))
console.log('\ncount', hits.length)
