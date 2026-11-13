import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'work')
mkdirSync(OUT, { recursive: true })

const url =
  'https://raw.communitydragon.org/latest/game/data/characters/yasuo/skins/skin0.bin.json'
const res = await fetch(url)
if (!res.ok) {
  console.error('FAIL', res.status, url)
  process.exit(1)
}
const json = await res.json()
writeFileSync(join(OUT, 'yasuo-skin0-data.json'), JSON.stringify(json))
console.log('OK', join(OUT, 'yasuo-skin0-data.json'))
