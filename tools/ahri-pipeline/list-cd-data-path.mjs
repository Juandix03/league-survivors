const base =
  'https://raw.communitydragon.org/latest/game/data/characters/ahri/'
const html = await fetch(base).then((r) => r.text())
const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
console.log(links.join('\n'))
