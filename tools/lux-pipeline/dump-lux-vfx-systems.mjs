/**
 * Snippets from lux skin0 bin for spell missile / particle system names.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const paths = [
  join(__dirname, 'work/skins_skin0.bin.json'),
  join(__dirname, 'work/lux-skin0-data.json'),
]

const TARGETS = [
  'LuxLightBindingMis',
  'Lux_Base_Q',
  'LuxLightBinding',
  'LuxPrismaticWaveMissile',
  'LuxPrismaticWave',
  'LuxLightStrikeKugel',
  'LuxRVfxMis',
  'LuxRMis',
  'Lux_Base_R',
  'LuxBasicAttack',
]

function collectRefs(obj, needle, snippets) {
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj)) {
    for (const v of obj) collectRefs(v, needle, snippets)
    return
  }
  const blob = JSON.stringify(obj)
  if (blob.includes(needle)) snippets.push(blob.slice(0, 8000))
  for (const v of Object.values(obj)) collectRefs(v, needle, snippets)
}

const out = {}
for (const t of TARGETS) {
  const snippets = []
  for (const p of paths) {
    if (!existsSync(p)) continue
    collectRefs(JSON.parse(readFileSync(p, 'utf8')), t, snippets)
  }
  out[t] = snippets[0] ?? null
  console.log('\n====', t, '====')
  if (!snippets.length) {
    console.log('(not found — run npm run lux:fetch-skin0)')
    continue
  }
  const sn = snippets[0]
  const assets = [
    ...sn.matchAll(/(?:lux|Lux)[a-zA-Z0-9_/-]+\.(?:scb|tex|png)/g),
    ...sn.matchAll(/assets\/characters\/lux[^"\\]+/g),
  ].map((m) => m[0])
  console.log('assets:', [...new Set(assets)].slice(0, 40).join('\n  '))
}

writeFileSync(join(__dirname, 'work/lux-vfx-system-snippets.json'), JSON.stringify(out, null, 2))
console.log('\nWrote work/lux-vfx-system-snippets.json')
