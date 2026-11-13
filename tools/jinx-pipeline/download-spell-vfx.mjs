/**
 * Download Jinx W/E/R particle PNGs (CommunityDragon, base skin .tex → .png)
 * and ability HUD icons (Riot Data Dragon).
 */
import { createWriteStream, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VFX_OUT = join(__dirname, '../../public/assets/vfx/jinx/spells')
const HUD_OUT = join(__dirname, '../../public/assets/hud/jinx')
const PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/characters/jinx/skins/base/particles'
const DDRAGON = 'https://ddragon.leagueoflegends.com/cdn/15.1.1/img/spell'

const SPELL_VFX = [
  'jinx_lightning.png',
  'jinx_base_w_lightning01.png',
  'jinx_base_w_lightning02.png',
  'jinx_base_w_mis_flash.png',
  'jinx_base_w_mis_bullet_rgb.png',
  'jinx_base_w_trail02.png',
  'jinx_base_w_sparks.png',
  'jinx_w_hit_rgb.png',
  'jinx_base_w_cas_flash.png',
  'jinx_base_e_mis_grenade.png',
  'jinx_base_e_mis_grenade_blur.png',
  'jinx_base_e_mis_trail.png',
  'jinx_base_e_splat_01.png',
  'jinx_r_mis.png',
  'jinx_base_r_rocketfire_revision.png',
  'jinx_base_r_energy_01.png',
  'jinx_base_r_groundsmoke02.png',
  'jinx_r_shape.png',
  'aura_self.png',
]

const HUD_ICONS = ['JinxQ.png', 'JinxW.png', 'JinxE.png', 'JinxR.png']

const CDRAGON_PATCH = '15.24'
const CDRAGON_Q_ICONS = [
  {
    url: `https://raw.communitydragon.org/${CDRAGON_PATCH}/game/assets/characters/jinx/hud/icons2d/jinx_q1.png`,
    file: 'JinxQPowPow.png',
  },
  {
    url: `https://raw.communitydragon.org/${CDRAGON_PATCH}/game/assets/characters/jinx/hud/icons2d/jinx_q2.png`,
    file: 'JinxQFishbones.png',
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

async function downloadOne(url, dest) {
  if (existsSync(dest)) {
    const existing = readFileSync(dest)
    if (isPng(existing)) {
      console.log(`SKIP ${dest.split(/[/\\]/).pop()} (valid PNG)`)
      return true
    }
  }
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`FAIL HTTP ${res.status} ${url}`)
    return false
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  const buf = readFileSync(dest)
  if (!isPng(buf)) {
    console.error(`FAIL not PNG ${dest}`)
    return false
  }
  console.log(`OK   ${dest.split(/[/\\]/).pop()} (${buf.length} bytes)`)
  return true
}

async function main() {
  mkdirSync(VFX_OUT, { recursive: true })
  mkdirSync(HUD_OUT, { recursive: true })
  let fail = 0
  for (const file of SPELL_VFX) {
    const ok = await downloadOne(`${PARTICLES}/${file}`, join(VFX_OUT, file))
    if (!ok) fail += 1
  }
  for (const file of HUD_ICONS) {
    const ok = await downloadOne(`${DDRAGON}/${file}`, join(HUD_OUT, file))
    if (!ok) fail += 1
  }
  for (const { url, file } of CDRAGON_Q_ICONS) {
    const ok = await downloadOne(url, join(HUD_OUT, file))
    if (!ok) fail += 1
  }
  console.log(`\nDone (${fail} failed)`)
  if (fail > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
