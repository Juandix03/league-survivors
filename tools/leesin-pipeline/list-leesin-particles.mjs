const indexUrl =
  'https://raw.communitydragon.org/latest/game/assets/characters/leesin/skins/base/particles/'
const res = await fetch(indexUrl)
const html = await res.text()
const re = /href="([^"]+\.png)"/gi
const files = [...new Set([...html.matchAll(re)].map((m) => m[1]))].sort()
const q = files.filter((f) => /q|sonic|mis|wave|sphere|ball/i.test(f))
console.log('q-related png:', q.length)
for (const f of q) console.log(f)
