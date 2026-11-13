import fs from 'node:fs'

const base = new URL(
  '../../public/assets/arena/beast-preview/source/TilesetGrass/TilesetGrass/',
  import.meta.url,
)

function parseMap(filename) {
  const xml = fs.readFileSync(new URL(filename, base), 'utf8')
  const re = /<layer[^>]*>\s*<data[^>]*>([\s\S]*?)<\/data>/g
  const layers = []
  let m
  while ((m = re.exec(xml))) {
    layers.push(m[1].trim().split(/\s*,\s*/).map((n) => Number(n)))
  }
  const wMatch = xml.match(/width="(\d+)"/)
  const hMatch = xml.match(/height="(\d+)"/)
  const w = wMatch ? Number(wMatch[1]) : 21
  const h = hMatch ? Number(hMatch[1]) : 42
  function to2d(flat) {
    const a = []
    for (let y = 0; y < h; y++) {
      a.push(flat.slice(y * w, y * w + w))
    }
    return a
  }
  return {
    ground: to2d(layers[0]),
    decor: layers[1] ? to2d(layers[1]) : [],
    w,
    h,
  }
}

const out = {
  map1: parseMap('map1.tmx'),
  map2: parseMap('map2.tmx'),
}
const outPath = new URL('../../src/beastPreview/beastMapTemplates.json', import.meta.url)
fs.writeFileSync(outPath, JSON.stringify(out))
console.log('wrote templates', outPath.pathname)
