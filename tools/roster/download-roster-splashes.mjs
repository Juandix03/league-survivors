/**
 * Descarga splashes de roster a public/assets/champions/<id>/splash.jpg
 * (misma URL que pipelines de Lee Sin / Miss Fortune — no hotlink en prod).
 */
import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')
const PUBLIC = join(ROOT, 'public/assets/champions')

/** folder → DDragon champion key */
const ROSTER = [
  ['jinx', 'Jinx'],
  ['ezreal', 'Ezreal'],
  ['ahri', 'Ahri'],
  ['lux', 'Lux'],
  ['missfortune', 'MissFortune'],
  ['yasuo', 'Yasuo'],
  ['leesin', 'LeeSin'],
]

async function download(url, dest, { force = false } = {}) {
  if (existsSync(dest) && !force) {
    console.log('SKIP', dest.split(/[/\\]/).pop())
    return true
  }
  const res = await fetch(url)
  if (!res.ok) {
    console.error('FAIL', res.status, url)
    return false
  }
  mkdirSync(dirname(dest), { recursive: true })
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  console.log('OK  ', dest.split(/[/\\]/).pop())
  return true
}

let failed = 0
for (const [folder, key] of ROSTER) {
  const url = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${key}_0.jpg`
  const dest = join(PUBLIC, folder, 'splash.jpg')
  const ok = await download(url, dest)
  if (!ok) failed += 1
}

if (failed > 0) {
  console.error(`\n${failed} splash(es) fallaron`)
  process.exit(1)
}
console.log('\nRoster splashes OK')
