const bases = [
  'https://raw.communitydragon.org/latest/game/assets/characters/jinx/skins/base/particles/',
  'https://raw.communitydragon.org/latest/game/assets/characters/jinx/skins/base/jinx/',
  'https://raw.communitydragon.org/latest/game/assets/particles/',
]

const needles = ['jinx_r', 'rocket', 'mis', 'mega', 'death']

for (const base of bases) {
  const r = await fetch(base)
  if (!r.ok) {
    console.log('FAIL list', base, r.status)
    continue
  }
  const html = await r.text()
  const re = /href="([^"]+\.(obj|scb|glb|gltf|fbx|skn))"/gi
  let m
  const hits = []
  while ((m = re.exec(html))) {
    const name = m[1].toLowerCase()
    if (needles.some((n) => name.includes(n))) hits.push(m[1])
  }
  console.log('\n', base)
  hits.sort().forEach((h) => console.log(' ', h))
}
