/**
 * Download Ahri skin0 character data JSON from CommunityDragon (for VFX path grep).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'work/ahri-skin0-data.json')
const URLS = [
  'https://raw.communitydragon.org/latest/game/data/characters/ahri/ahri.bin.json',
  'https://raw.communitydragon.org/latest/game/data/characters/ahri/skins/skin0.bin.json',
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
  const path = join(__dirname, 'work', name)
  writeFileSync(path, JSON.stringify(json, null, 0))
  console.log('OK', path, `(${(JSON.stringify(json).length / 1024).toFixed(0)} KB)`)
}

// Also write merged search helper output
const main = await fetch(
  'https://raw.communitydragon.org/latest/game/data/characters/ahri/ahri.bin.json',
).then((r) => (r.ok ? r.json() : null))

if (main) {
  writeFileSync(OUT, JSON.stringify(main))
  const text = JSON.stringify(main)
  const re = /Ahri[^"\\]{0,80}(?:Mis|Ba|Q|W|E|R|Attack|Basic|Orb|Charm|Fox|Spirit)[^"\\]{0,80}/gi
  const hits = [...new Set(text.match(re) ?? [])].sort()
  console.log('\nVFX-related strings (' + hits.length + '):')
  for (const h of hits.slice(0, 120)) console.log(' ', h)
  if (hits.length > 120) console.log(' ...', hits.length - 120, 'more')
}
