import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const raw = readFileSync(join(__dirname, 'work/skins_skin0.bin.json'), 'utf8')

const needles = [
  'LuxLightBindingMis',
  'LightBinding',
  'lux_base_q',
  'lux_q_shape',
  'VfxSystem',
  'Particle',
  'ResourceResolver',
]

for (const n of needles) {
  let i = 0
  let count = 0
  while ((i = raw.indexOf(n, i)) !== -1 && count < 3) {
    const start = Math.max(0, i - 120)
    const end = Math.min(raw.length, i + 280)
    console.log('\n---', n, '---')
    console.log(raw.slice(start, end).replace(/\s+/g, ' '))
    i += n.length
    count += 1
  }
}

const assetRe =
  /assets\/characters\/lux[^"\\]{0,120}\.(?:scb|tex|skn|png)/gi
const assets = [...new Set(raw.match(assetRe) ?? [])].sort()
console.log('\nLux asset paths in skin0:', assets.length)
for (const a of assets.filter((p) => /q|bind|light|mis|shape|trail|spark|cylinder|slash|portal/i.test(p))) {
  console.log(' ', a)
}
