const url =
  'https://raw.communitydragon.org/latest/game/assets/characters/ahri/skins/base/particles/'
const html = await fetch(url).then((r) => r.text())
const files = [...html.matchAll(/href="([^"]+\.png)"/g)].map((m) => m[1])
const interesting = files.filter((f) => /mis|bullet|projectile|ba_/i.test(f))
console.log('interesting', interesting.length)
for (const f of interesting.sort()) console.log(f)
