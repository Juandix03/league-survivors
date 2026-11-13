/**
 * Descarga PNGs de proyectil BA de minions SR (CommunityDragon).
 * Uso: npm run minions:download-projectile-vfx
 */
import { createWriteStream, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../../public/assets/vfx/minions/projectiles')
const CDN =
  'https://raw.communitydragon.org/latest/game/assets/characters'

const FILES = [
  [
    'order_caster_ba_mis.png',
    'sru_orderminionranged/skins/base/particles/sru_order_cm_ba_mis_tex_blue.png',
  ],
  [
    'chaos_caster_ba_mis.png',
    'sru_chaosminionranged/skins/base/particles/sru_chaos_cm_ba_mis_tex.png',
  ],
  [
    'order_siege_ba_sparks.png',
    'sru_orderminionsiege/skins/base/particles/sru_bluebuff_sparks.png',
  ],
  [
    'chaos_siege_ba_sparks.png',
    'sru_chaosminionsiege/skins/base/particles/sru_redbuff_sparks.png',
  ],
]

function isPng(buffer) {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
}

async function downloadOne(localName, cdragonPath) {
  const dest = join(OUT, localName)
  const url = `${CDN}/${cdragonPath}`
  if (existsSync(dest)) {
    const existing = readFileSync(dest)
    if (isPng(existing)) {
      console.log(`SKIP ${localName}`)
      return true
    }
  }
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`FAIL ${res.status} ${url}`)
    return false
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  const buf = readFileSync(dest)
  if (!isPng(buf)) {
    console.error(`FAIL not PNG ${localName}`)
    return false
  }
  console.log(`OK   ${localName} (${buf.length} bytes)`)
  return true
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  let fail = 0
  for (const [local, remote] of FILES) {
    const ok = await downloadOne(local, remote)
    if (!ok) fail += 1
  }
  console.log(`\nDone (${fail} failed)`)
  if (fail > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
