#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))))

const required = [
  'minion-preview.html',
  'src/minionPreview/main.ts',
  'src/minionPreview/MinionPreviewScene.ts',
  'src/minionPreview/inspiredMinionTextures.ts',
  'tools/minions/minion-assets-research.md',
]

let ok = true
for (const rel of required) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) {
    console.error('MISSING', rel)
    ok = false
  }
}

const vite = fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8')
if (!vite.includes('minionPreview')) {
  console.error('vite.config.ts: falta entrada minionPreview')
  ok = false
}

if (ok) {
  console.log('minion-preview: archivos OK')
  process.exit(0)
}
process.exit(1)
