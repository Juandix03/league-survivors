const r = await fetch(
  'https://raw.communitydragon.org/latest/game/assets/characters/jinx/skins/base/particles/',
)
const html = await r.text()
const re = /href="([^"]+)"/gi
const set = new Set()
let m
while ((m = re.exec(html))) {
  const name = m[1]
  if (/\.(scb|skn|glb|gltf|obj|fbx)$/i.test(name)) set.add(name)
}
;[...set].sort().forEach((x) => console.log(x))
console.log('count', set.size)
