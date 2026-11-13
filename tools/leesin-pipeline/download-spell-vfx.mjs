/**
 * Lee Sin spell VFX — CommunityDragon base particles + Data Dragon HUD.
 */
import { createWriteStream, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL_OUT = join(__dirname, '../../public/assets/vfx/leesin/spells')
const BA_OUT = join(__dirname, '../../public/assets/vfx/leesin')
const HUD_OUT = join(__dirname, '../../public/assets/hud/leesin')
const PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/characters/leesin/skins/base/particles'
const DDRAGON = 'https://ddragon.leagueoflegends.com/cdn/15.1.1/img/spell'

const BA = [
  'leesin_base_ba_hiteffect.png',
  'leesin_base_ba_blast_nova_bunny_04.png',
  'leesin_base_blastring.png',
  'leesin_base_air_swoosh.png',
]

const Q = [
  'base_leesin_q_mis_front.png',
  'base_leesin_q_mis_front_02.png',
  'base_leesin_q_mis_orb_02.png',
  'base_leesin_q_mis_trail.png',
  'leesin_base_q_ball01.png',
  'leesin_base_q_bluesphere.png',
  'leesin_base_q_smoketrail_02.png',
  'leesin_base_q_shockwave.png',
  'leesin_base_q_glow-soft.png',
  'leesin_base_q_cast_shockwave.png',
  'leesin_base_q_fluid.png',
  'leesin_base_q_waves.png',
  'leesin_base_q_magicalwisp.png',
  'leesin_base_q_ring_02.png',
  'base_leesin_q_mark_01.png',
  'base_leesin_q_mark_outline_01.png',
  'base_leesin_q_mark_floor_01.png',
]

const W = [
  'leesin_base_w_shield_1.png',
  'leesin_base_shield.png',
  'base_leesin_w_shield_magic.png',
  'leesin_base_w_trail.png',
  'leesin_base_w_bigring_02.png',
  'leesin_base_w_ironwill_glow.png',
  'leesin_base_w_glow_outer.png',
  'base_leesin_w_cas_floor.png',
]

const E = [
  'leesin_base_e_symbol_01.png',
  'leesin_base_e_sparks.png',
  'leesin_base_e_shockring.png',
  'leesin_base_e_flash_ring.png',
  'leesin_base_e_impact_flash.png',
  'base_leesin_e_magicdragon.png',
  'base_leesin_e_cas_01.png',
]

const R = [
  'leesin_base_r_kick_trail.png',
  'leesin_base_r_flametrail_big.png',
  'leesin_base_r_hit_bolts.png',
  'leesin_base_r_glow_01.png',
  'leesin_base_r_smokeclouds_02.png',
  'leesin_base_r_flamehead.png',
  'base_leesin_r_trail03.png',
]

const SPELL_VFX = [...new Set([...BA, ...Q, ...W, ...E, ...R])]
const HUD_ICONS = ['LeeSinQOne.png', 'LeeSinWOne.png', 'LeeSinEOne.png', 'LeeSinR.png']

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
    if (isPng(existing) && existing.length > 200) {
      console.log(`SKIP ${dest.split(/[/\\]/).pop()}`)
      return true
    }
  }
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`FAIL HTTP ${res.status} ${url}`)
    return false
  }
  mkdirSync(dirname(dest), { recursive: true })
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  const buf = readFileSync(dest)
  if (!isPng(buf) || buf.length < 200) {
    console.error(`FAIL bad PNG ${dest} (${buf.length}b)`)
    return false
  }
  console.log(`OK   ${dest.split(/[/\\]/).pop()} (${buf.length}b)`)
  return true
}

let fail = 0
mkdirSync(SPELL_OUT, { recursive: true })
mkdirSync(BA_OUT, { recursive: true })
mkdirSync(HUD_OUT, { recursive: true })

for (const file of SPELL_VFX) {
  const dest = BA.includes(file) ? join(BA_OUT, file) : join(SPELL_OUT, file)
  const ok = await downloadOne(`${PARTICLES}/${file}`, dest)
  if (!ok) fail += 1
}

for (const file of HUD_ICONS) {
  const ok = await downloadOne(`${DDRAGON}/${file}`, join(HUD_OUT, file))
  if (!ok) fail += 1
}

if (fail > 0) process.exit(1)
console.log('Lee Sin spell + HUD assets OK')
