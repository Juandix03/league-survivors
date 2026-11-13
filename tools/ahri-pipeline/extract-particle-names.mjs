/**
 * From skins_skin0.bin.json, list Ahri_Base_* particle VFX names (Skin0).
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const path = join(__dirname, 'work/skins_skin0.bin.json')
const root = JSON.parse(readFileSync(path, 'utf8'))
const names = new Set()

function walk(obj) {
  if (typeof obj === 'string') {
    if (/Characters\/Ahri\/Skins\/Skin0\/Particles\/Ahri_Base_/.test(obj)) {
      names.add(obj.split('/').pop())
    }
    return
  }
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj)) obj.forEach(walk)
  else Object.values(obj).forEach(walk)
}

walk(root)
console.log([...names].sort().join('\n'))
console.log('\nTotal:', names.size)
