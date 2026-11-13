/**
 * Rehornea los 8 tipos de súbdito con --8dir (64×64, 9–10 filas).
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const script = join(root, 'tools/minions-pipeline/render-minion-sheet.mjs')

const ALIASES = [
  'order-melee',
  'chaos-melee',
  'order-ranged',
  'chaos-ranged',
  'order-siege',
  'chaos-siege',
  'order-super',
  'chaos-super',
]

for (const alias of ALIASES) {
  console.log('\n=== minion', alias, '8dir ===')
  const r = spawnSync('node', [script, alias, '--8dir'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (r.status !== 0) {
    console.error(`Falló ${alias} (exit ${r.status})`)
    process.exit(r.status ?? 1)
  }
}

console.log('\nListo: minions en public/assets/minions-preview/baked/')
