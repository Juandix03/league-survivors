/**
 * Download authentic Jinx VFX PNGs from CommunityDragon (verified paths).
 * Output: public/assets/vfx/jinx/
 * Run: node tools/jinx-pipeline/download-vfx.mjs
 */
import { createWriteStream, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../../public/assets/vfx/jinx')

const BASE_PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/characters/jinx/skins/base/particles'
const GLOBAL_PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/particles'

/** @type {{ file: string, url: string }[]} */
const ASSETS = [
  { file: 'jinx_basic_bullet.png', url: `${BASE_PARTICLES}/jinx_basic_bullet.png` },
  { file: 'jinx_bullet_shell.png', url: `${BASE_PARTICLES}/jinx_bullet_shell.png` },
  { file: 'jinx_muzzle_flash.png', url: `${BASE_PARTICLES}/jinx_muzzle_flash.png` },
  { file: 'jinx_q_gun_hit.png', url: `${BASE_PARTICLES}/jinx_q_gun_hit.png` },
  { file: 'jinx_q_rocket.png', url: `${BASE_PARTICLES}/jinx_q_rocket.png` },
  { file: 'jinx_q_rocket_rgb.png', url: `${BASE_PARTICLES}/jinx_q_rocket_rgb.png` },
  {
    file: 'jinx_explosion_flat.png',
    url: `${GLOBAL_PARTICLES}/jinx_explosion_flat.png`,
  },
  {
    file: 'jinx_explosion_smoke.png',
    url: `${GLOBAL_PARTICLES}/jinx_explosion_smoke.png`,
  },
  {
    file: 'common_fb_rocket_groundaoe_centerflare.png',
    url: `${BASE_PARTICLES}/common_fb_rocket_groundaoe_centerflare.png`,
  },
  { file: 'jinx_base_crater_01.png', url: `${BASE_PARTICLES}/jinx_base_crater_01.png` },
  {
    file: 'jinx_base_ba_smoke_01.png',
    url: `${BASE_PARTICLES}/jinx_base_ba_smoke_01.png`,
  },
  {
    file: 'jinx_base_ba_shockring.png',
    url: `${BASE_PARTICLES}/jinx_base_ba_shockring.png`,
  },
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

async function downloadOne({ file, url }) {
  const dest = join(OUT_DIR, file)
  if (existsSync(dest)) {
    const existing = readFileSync(dest)
    if (isPng(existing)) {
      console.log(`SKIP ${file} (valid PNG, ${existing.length} bytes)`)
      return true
    }
  }
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`FAIL ${file}: HTTP ${res.status} ${url}`)
    return false
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  const buf = readFileSync(dest)
  if (!isPng(buf)) {
    console.error(`FAIL ${file}: not a valid PNG (${dest})`)
    return false
  }
  console.log(`OK   ${file} (${buf.length} bytes)`)
  return true
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  let ok = 0
  let fail = 0
  for (const asset of ASSETS) {
    const success = await downloadOne(asset)
    if (success) ok += 1
    else fail += 1
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed → ${OUT_DIR}`)
  if (fail > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
