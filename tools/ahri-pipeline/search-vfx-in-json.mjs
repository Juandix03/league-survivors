import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const work = join(__dirname, 'work')
const needles = [
  'Ahri_BA',
  'Ahri_Q',
  'Ahri_W',
  'Ahri_E',
  'Ahri_R',
  'Ahri_Base',
  'BasicAttack',
  'QMissile',
  'Particles/Ahri',
  'VfxSystem',
]

function walk(obj, path, fn) {
  if (typeof obj === 'string') {
    fn(path, obj)
    return
  }
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walk(v, `${path}[${i}]`, fn))
    return
  }
  for (const [k, v] of Object.entries(obj)) {
    walk(v, path ? `${path}.${k}` : k, fn)
  }
}

for (const file of readdirSync(work).filter((f) => f.endsWith('.json'))) {
  const root = JSON.parse(readFileSync(join(work, file), 'utf8'))
  console.log('\n#', file)
  const hits = []
  walk(root, '', (path, str) => {
    for (const n of needles) {
      if (str.includes(n)) hits.push({ path, str: str.slice(0, 200) })
    }
  })
  const uniq = [...new Map(hits.map((h) => [h.str, h])).values()]
  for (const h of uniq.slice(0, 80)) {
    console.log(h.str)
  }
  console.log('(...', uniq.length, 'unique strings)')
}
