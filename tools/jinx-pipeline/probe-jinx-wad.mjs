const bases = [
  'https://raw.communitydragon.org/latest/game/data/final/champions/jinx.wad.client',
  'https://raw.communitydragon.org/patch/latest/game/data/final/champions/jinx.wad.client',
  'https://raw.communitydragon.org/latest/game/data/final/champions/jinx.wad',
]
for (const u of bases) {
  const r = await fetch(u, { method: 'HEAD' })
  console.log(r.status, u, r.headers.get('content-length'))
}
