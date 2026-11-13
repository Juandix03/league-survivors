/**
 * Download authentic Ahri VFX + HUD spell icons (CommunityDragon + Data Dragon).
 * Run: node tools/ahri-pipeline/download-vfx.mjs
 */
import { createWriteStream, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VFX_OUT = join(__dirname, '../../public/assets/vfx/ahri')
const SPELL_OUT = join(__dirname, '../../public/assets/vfx/ahri/spells')
const HUD_OUT = join(__dirname, '../../public/assets/hud/ahri')

const PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/characters/ahri/skins/base/particles'
const DDRAGON = 'https://ddragon.leagueoflegends.com/cdn/15.1.1/img/spell'

const BA_VFX = [
  'ahri_base_orb_fox_01.png',
  'ahri_base_ba_orbbackground.png',
  'ahri_base_ba_glow_corona.png',
  'ahri_base_ba_hit_tar_sparks.png',
  'ahri_base_ba_trail2.png',
  'ahri_base_ba_speed_flash.png',
]

const SPELL_VFX = [
  'ahri_base_w_ringflare.png',
  'ahri_base_w_fire2x2.png',
  'ahri_w_rays_mult.png',
  'ahri_e_heart.png',
  'ahri_base_e_trail_01.png',
  'ahri_base_e_heart_01.png',
  'ahri_base_r_airbullet.png',
  'ahri_base_r_aura_glow.png',
  'ahri_q_shape.png',
  'ahri_base_q_orbbackground.png',
  'ahri_base_q_orbedge.png',
]

const HUD_ICONS = ['AhriQ.png', 'AhriW.png', 'AhriE.png', 'AhriR.png']

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
    if (isPng(existing) && existing.length > 500) {
      console.log(`SKIP ${dest.split(/[/\\]/).pop()} (${existing.length}b)`)
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
  if (!isPng(buf) || buf.length < 500) {
    console.error(`FAIL bad PNG ${dest} (${buf.length}b)`)
    return false
  }
  console.log(`OK   ${dest.split(/[/\\]/).pop()} (${buf.length}b)`)
  return true
}

async function main() {
  mkdirSync(VFX_OUT, { recursive: true })
  mkdirSync(SPELL_OUT, { recursive: true })
  mkdirSync(HUD_OUT, { recursive: true })
  let fail = 0
  for (const file of BA_VFX) {
    const ok = await downloadOne(`${PARTICLES}/${file}`, join(VFX_OUT, file))
    if (!ok) fail += 1
  }
  for (const file of SPELL_VFX) {
    const ok = await downloadOne(`${PARTICLES}/${file}`, join(SPELL_OUT, file))
    if (!ok) fail += 1
  }
  for (const file of HUD_ICONS) {
    const ok = await downloadOne(`${DDRAGON}/${file}`, join(HUD_OUT, file))
    if (!ok) fail += 1
  }
  console.log(`\nDone (${fail} failed)`)
  if (fail > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
