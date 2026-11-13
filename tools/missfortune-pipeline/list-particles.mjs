const indexUrl =
  'https://raw.communitydragon.org/latest/game/assets/characters/missfortune/skins/base/particles/'
const res = await fetch(indexUrl)
const html = await res.text()
const re = /href="([^"]+\.png)"/gi
const files = [...new Set([...html.matchAll(re)].map((m) => m[1]))].sort()
for (const f of files.filter((x) => /ba|q|w|e|r|bullet|mis|rain|passive/i.test(x))) {
  console.log(f)
}
console.log('total png', files.length)
