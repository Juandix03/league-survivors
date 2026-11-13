/**
 * Lista recursos Q en skin0 (CommunityDragon) y descarga PNG de partículas base.
 */
import { mkdirSync, createWriteStream, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../../public/assets/vfx/lux/spells')
const SKIN0 =
  'https://raw.communitydragon.org/latest/game/data/characters/lux/skins/skin0.bin.json'
const PART =
  'https://raw.communitydragon.org/latest/game/assets/characters/lux/skins/base/particles'

const json = await fetch(SKIN0).then((r) => r.text())
const mapKeys = [...json.matchAll(/"(Lux[^"]*LightBinding[^"]*)"/g)].map((m) => m[1])
const mapKeys2 = [...json.matchAll(/"(Lux_[^"]*Q[^"]*|Lux_Base_Q[^"]*)"/gi)].map((m) => m[1])
console.log('LightBinding keys:', [...new Set([...mapKeys, ...mapKeys2])].slice(0, 25))

const extra = [
  'lux_base_starfilter_01.png',
  'lux_base_soft-glow.png',
  'lux_base_rainbowmult.png',
]
mkdirSync(OUT, { recursive: true })
for (const file of extra) {
  const url = `${PART}/${file}`
  const dest = join(OUT, file)
  if (existsSync(dest)) {
    console.log('skip', file)
    continue
  }
  const res = await fetch(url)
  if (!res.ok) {
    console.log('miss', file, res.status)
    continue
  }
  await pipeline(res.body, createWriteStream(dest))
  console.log('ok', file)
}
