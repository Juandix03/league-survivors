/**
 * Yasuo spell VFX (CommunityDragon base particles + Data Dragon HUD).
 */
import {
  copyFileSync,
  createWriteStream,
  mkdirSync,
  readFileSync,
  existsSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL_OUT = join(__dirname, '../../public/assets/vfx/yasuo/spells')
const BA_OUT = join(__dirname, '../../public/assets/vfx/yasuo')
const HUD_OUT = join(__dirname, '../../public/assets/hud/yasuo')
const PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/characters/yasuo/skins/base/particles'
const DDRAGON = 'https://ddragon.leagueoflegends.com/cdn/15.1.1/img/spell'

const YASUO_BA = [
  'yasuo_basic_attack_trail.png',
  'yasuo_basic_attack_wind_ring_02.png',
  'yasuo_basic_attack_impact_slash.png',
  'yasuo_base_ba_hit_flash.png',
  'yasuo_base_ba_crit_flare.png',
  'yasuo_q_sword.png',
  'yasuo_q_sword_normal.png',
]

const YASUO_Q = [
  'yasuo_base_q_tornado_blade.png',
  'yasuo_base_q_tonado_wind_cas.png',
  'yasuo_base_q_wind_hit_tar.png',
  'yasuo_base_q_hit_spark_tar.png',
  'yasuo_q_tornado_ground_shape_cas.png',
  'yasuo_q_tornado_blast.png',
  'yasuo_q_smoke.png',
  'color_yasuo_q_wind.png',
  'yasuo_base_q_second_swirl.png',
]

const YASUO_W = [
  'yasuo_w_windwall_main.png',
  'yasuo_w_windwall_main_02.png',
  'yasuo_w_wind_wispy.png',
  'yasuo_base_w_windwall_indicator.png',
  'yasuo_base_w_windwall_steam.png',
  'color_yasuo_w_windwall_dust.png',
  'yasuo_w_wind_wall_mult.png',
]

const YASUO_E = [
  'yasuo_base_e_dash_white.png',
  'yasuo_base_e_dash_ring.png',
  'yasuo_base_e_dash_spark.png',
  'yasuo_e_dash_smoke.png',
  'yasuo_e_dash_flash.png',
  'color_yasuo_base_e_afterimage.png',
]

const YASUO_R = [
  'yasuo_base_r_wind_blast.png',
  'yasuo_base_r_land_exp_ring.png',
  'yasuo_base_r_sword_shape.png',
  'yasuo_base_r_hit_streak_tar.png',
  'color_yasuo_r_sword_glow.png',
  'yasuo_base_r_ground_crack.png',
]

const SPELL_VFX = [
  ...new Set([...YASUO_BA, ...YASUO_Q, ...YASUO_W, ...YASUO_E, ...YASUO_R]),
]

const HUD_ICONS = ['YasuoQ1.png', 'YasuoW.png', 'YasuoE.png', 'YasuoR.png']

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
    if (isPng(existing) && existing.length > 400) {
      console.log(`SKIP ${dest.split(/[/\\]/).pop()}`)
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
  if (!isPng(buf) || buf.length < 400) {
    console.error(`FAIL bad PNG ${dest} (${buf.length}b)`)
    return false
  }
  console.log(`OK   ${dest.split(/[/\\]/).pop()} (${buf.length}b)`)
  return true
}

async function main() {
  mkdirSync(SPELL_OUT, { recursive: true })
  mkdirSync(BA_OUT, { recursive: true })
  mkdirSync(HUD_OUT, { recursive: true })
  let fail = 0
  for (const file of SPELL_VFX) {
    const dest = YASUO_BA.includes(file) ? join(BA_OUT, file) : join(SPELL_OUT, file)
    const ok = await downloadOne(`${PARTICLES}/${file}`, dest)
    if (!ok) fail += 1
  }
  for (const file of HUD_ICONS) {
    const dest = join(HUD_OUT, file)
    let ok = await downloadOne(`${DDRAGON}/${file}`, dest)
    if (!ok && file === 'YasuoQ1.png') {
      const fallback = join(BA_OUT, 'yasuo_q_sword.png')
      if (existsSync(fallback)) {
        copyFileSync(fallback, dest)
        console.log(`OK   ${file} (fallback from yasuo_q_sword.png)`)
        ok = true
      }
    }
    if (!ok) fail += 1
  }
  console.log(`\nDone (${fail} failed)`)
  if (fail > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
