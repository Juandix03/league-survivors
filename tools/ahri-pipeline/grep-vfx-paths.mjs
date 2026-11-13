/**
 * Grep ahri.bin.json for particle / VFX resource paths.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const path = join(__dirname, 'work/ahri-skin0-data.json')
if (!existsSync(path)) {
  console.error('Run: node fetch-skin0-data.mjs first')
  process.exit(1)
}

const text = readFileSync(path, 'utf8')
const patterns = [
  /Ahri_Base_[A-Za-z0-9_]+/g,
  /ahri_base_[a-z0-9_]+\.png/g,
  /Characters\/Ahri[^"]+/g,
]

const all = new Set()
for (const re of patterns) {
  for (const m of text.matchAll(re)) all.add(m[0])
}

const sorted = [...all].sort()
const buckets = {
  ba: sorted.filter((s) => /ba|basic|attack|_p_/i.test(s)),
  q: sorted.filter((s) => /\bq|orb|deception/i.test(s)),
  w: sorted.filter((s) => /\bw|fox|fire/i.test(s)),
  e: sorted.filter((s) => /\be|charm|heart|seduce/i.test(s)),
  r: sorted.filter((s) => /\br|rush|spirit|dash/i.test(s)),
}

for (const [k, v] of Object.entries(buckets)) {
  console.log(`\n=== ${k.toUpperCase()} (${v.length}) ===`)
  for (const line of v.slice(0, 40)) console.log(line)
  if (v.length > 40) console.log(`... +${v.length - 40}`)
}

console.log('\nTotal unique tokens:', sorted.length)
