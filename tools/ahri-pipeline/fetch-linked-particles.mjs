/**
 * Follow __linked entries in skins_skin0.bin.json and find Ahri_Base_* VFX defs.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CD = 'https://raw.communitydragon.org/latest/game'
const skin0 = JSON.parse(
  readFileSync(join(__dirname, 'work/skins_skin0.bin.json'), 'utf8'),
)
const linked = skin0.__linked ?? {}
console.log('Linked entries:', Object.keys(linked).length)

const TARGET = /Ahri_Base_(BA_mis|Q_mis|E_mis|W_mis|R_mis)/

async function fetchJson(rel) {
  const url = `${CD}/${rel.replace(/^\/+/, '')}`
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

const hits = []
for (const [hash, rel] of Object.entries(linked)) {
  if (!String(rel).includes('particle') && !String(rel).includes('Particle')) continue
  const json = await fetchJson(rel)
  if (!json) continue
  const text = JSON.stringify(json)
  if (TARGET.test(text) || text.includes('Ahri_Base_BA_mis')) {
    hits.push({ hash, rel, json })
  }
}

console.log('Particle-linked hits:', hits.length)
for (const h of hits.slice(0, 5)) {
  console.log(h.rel)
}

if (hits.length === 0) {
  // brute: grep all linked for Ahri_Base_BA_mis string
  let checked = 0
  for (const [hash, rel] of Object.entries(linked)) {
    checked += 1
    if (checked > 80) break
    const res = await fetch(`${CD}/${String(rel).replace(/^\/+/, '')}`)
    if (!res.ok) continue
    const text = await res.text()
    if (text.includes('Ahri_Base_Q_mis')) {
      console.log('FOUND in', rel)
      writeFileSync(join(__dirname, 'work/sample-particle-link.json'), text)
      break
    }
  }
  console.log('Checked', checked, 'linked files')
}
