/**
 * Hornea spritesheet hd8 para todos los campeones con pipeline Khada.
 * Requiere GLB en cada pipeline work/ (npm run champ:download).
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const PIPELINES = [
  { name: 'jinx', cwd: 'tools/jinx-pipeline' },
  { name: 'ahri', cwd: 'tools/ahri-pipeline' },
  { name: 'lux', cwd: 'tools/lux-pipeline' },
  { name: 'leesin', cwd: 'tools/leesin-pipeline' },
  { name: 'yasuo', cwd: 'tools/yasuo-pipeline' },
  { name: 'missfortune', cwd: 'tools/missfortune-pipeline' },
  { name: 'ezreal', cwd: 'tools/ezreal-pipeline' },
]

for (const p of PIPELINES) {
  console.log('\n===', p.name, 'hd8 ===')
  const r = spawnSync('node', ['render-sheet.mjs', 'hd8'], {
    cwd: join(root, p.cwd),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (r.status !== 0) {
    console.error(`Falló ${p.name} (exit ${r.status})`)
    process.exit(r.status ?? 1)
  }
}

console.log('\nListo: todos los hd8 en public/assets/champions/*/')
