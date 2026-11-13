/**
 * Lux character data JSON from CommunityDragon (VFX path grep).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'work/lux-skin0-data.json')
const URLS = [
  'https://raw.communitydragon.org/latest/game/data/characters/lux/lux.bin.json',
  'https://raw.communitydragon.org/latest/game/data/characters/lux/skins/skin0.bin.json',
]

mkdirSync(join(__dirname, 'work'), { recursive: true })

for (const url of URLS) {
  const res = await fetch(url)
  if (!res.ok) {
    console.error('FAIL', res.status, url)
    continue
  }
  const json = await res.json()
  const name = url.split('/').slice(-2).join('_')
  writeFileSync(join(__dirname, 'work', name), JSON.stringify(json))
  console.log('OK', name, `(${(JSON.stringify(json).length / 1024).toFixed(0)} KB)`)
}

const main = await fetch(
  'https://raw.communitydragon.org/latest/game/data/characters/lux/lux.bin.json',
).then((r) => (r.ok ? r.json() : null))

if (main) {
  writeFileSync(OUT, JSON.stringify(main))
  const text = JSON.stringify(main)
  const re = /Lux[^"\\]{0,80}(?:Mis|Ba|Q|W|E|R|Binding|Prism|Light|Beam|Shield|Kugel)[^"\\]{0,80}/gi
  const hits = [...new Set(text.match(re) ?? [])].sort()
  console.log('\nVFX-related strings (' + hits.length + '):')
  for (const h of hits.slice(0, 80)) console.log(' ', h)
}
