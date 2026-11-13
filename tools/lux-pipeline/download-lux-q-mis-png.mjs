/**
 * Intenta descargar texturas referenciadas por Lux_Q_mis / LightBinding (CommunityDragon).
 */
import { createWriteStream, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../../public/assets/vfx/lux/spells')
const BASE =
  'https://raw.communitydragon.org/latest/game/assets/characters/lux/skins/base/particles'
const SKIN0_PART =
  'https://raw.communitydragon.org/latest/game/assets/characters/lux/skins/skin0/particles'

const candidates = [
  'Lux_Q_mis.png',
  'LuxLightBinding_mis.png',
  'Lux_Base_Q_mis.png',
  'luxlightbinding_mis.png',
]

mkdirSync(OUT, { recursive: true })

for (const file of candidates) {
  for (const root of [BASE, SKIN0_PART]) {
    const url = `${root}/${file}`
    const dest = join(OUT, file.toLowerCase())
    if (existsSync(dest)) continue
    const res = await fetch(url)
    if (!res.ok) continue
    await pipeline(res.body, createWriteStream(dest))
    console.log('ok', url)
  }
}

// List skin0 particles directory
const idx = await fetch(`${SKIN0_PART}/`).then((r) => r.text())
const hrefs = [...idx.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => /q|bind|light/i.test(h))
console.log('\nskin0/particles q-related:', hrefs.slice(0, 40).join(', '))
