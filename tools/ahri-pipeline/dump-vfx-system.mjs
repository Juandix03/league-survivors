/**
 * Find VfxSystemDefinition-like entries referencing Ahri_Base_* in skin0 bin JSON.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const path = join(__dirname, 'work/skins_skin0.bin.json')
const root = JSON.parse(readFileSync(path, 'utf8'))

const TARGETS = [
  'Ahri_Base_BA_mis',
  'Ahri_Base_Q_mis',
  'Ahri_Base_Q_mis_02',
  'Ahri_Base_W_mis',
  'Ahri_Base_E_mis',
  'Ahri_Base_R_mis',
]

function collectRefs(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out
  if (Array.isArray(obj)) {
    for (const v of obj) collectRefs(v, out)
    return out
  }
  const blob = JSON.stringify(obj)
  for (const t of TARGETS) {
    if (blob.includes(t)) out.push({ needle: t, snippet: blob.slice(0, 4000) })
  }
  for (const v of Object.values(obj)) collectRefs(v, out)
  return out
}

const refs = collectRefs(root)
const byNeedle = new Map()
for (const r of refs) {
  if (!byNeedle.has(r.needle)) byNeedle.set(r.needle, r.snippet)
}

for (const t of TARGETS) {
  console.log('\n====', t, '====')
  const sn = byNeedle.get(t)
  if (!sn) {
    console.log('(not found in nested JSON blobs)')
    continue
  }
  // extract .tex / .png / texture-like strings
  const tex = [...sn.matchAll(/[A-Za-z0-9_]+\.(?:tex|png|scb)/gi)].map((m) => m[0])
  const ahri = [...sn.matchAll(/ahri_[a-z0-9_]+/gi)].map((m) => m[0])
  console.log('textures:', [...new Set(tex)].slice(0, 30).join(', '))
  console.log('ahri_*:', [...new Set(ahri)].slice(0, 30).join(', '))
}

writeFileSync(
  join(__dirname, 'work/vfx-system-snippets.json'),
  JSON.stringify(Object.fromEntries(byNeedle), null, 2),
)
console.log('\nWrote work/vfx-system-snippets.json')
