const indexUrl =
  'https://raw.communitydragon.org/latest/game/assets/characters/yasuo/skins/base/particles/'
const res = await fetch(indexUrl)
const html = await res.text()
const re = /href="([^"]+\.png)"/gi
const files = [...new Set([...html.matchAll(re)].map((m) => m[1]))].sort()
console.log(files.filter((f) => f.includes('yasuo')).join('\n'))
console.log('\nyasuo count', files.filter((f) => f.includes('yasuo')).length)
