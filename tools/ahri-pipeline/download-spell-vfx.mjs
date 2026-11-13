/**
 * Curated Ahri spell VFX (CommunityDragon PNG + Data Dragon HUD).
 * See docs/ahri-*-investigation.md for emitter mapping.
 */
import { createWriteStream, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL_OUT = join(__dirname, '../../public/assets/vfx/ahri/spells')
const BA_OUT = join(__dirname, '../../public/assets/vfx/ahri')
const HUD_OUT = join(__dirname, '../../public/assets/hud/ahri')
const PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/characters/ahri/skins/base/particles'
const DDRAGON = 'https://ddragon.leagueoflegends.com/cdn/15.1.1/img/spell'

/** Ahri_Base_BA_mis — quads + trails (no dedicated *_mis.png on mirror). */
const AHRI_BA_PARTICLES = [
  'ahri_base_ba_orbbackground.png',
  'ahri_base_ba_mote_01.png',
  'ahri_base_ba_trail2.png',
  'ahri_base_ba_trail_erode.png',
  'ahri_base_ba_glow_corona.png',
  'ahri_base_ba_hit_tar_sparks.png',
  'ahri_base_ba_speed_flash.png',
  'ahri_base_ba_ringflare.png',
  'ahri_base_ba_smoketrail_03.png',
]

/** Ahri_Base_Q_mis / Ahri_Base_Q_mis_02 — mesh ahri_base_q_sphere_01.scb + orb textures. */
const AHRI_Q_PARTICLES = [
  'ahri_base_q_orbbackground.png',
  'ahri_base_q_orbedge.png',
  'ahri_base_q_orbedge_3.png',
  'ahri_q_shape.png',
  'ahri_base_q_trail_01.png',
  'ahri_base_q_trail_02.png',
  'ahri_base_q_speed.png',
  'ahri_base_q_smoke_erode.png',
  'ahri_base_q_smoke_erode_2.png',
  'ahri_base_q_rainbowray.png',
  'ahri_base_q_groundshockwaves_1.png',
  'ahri_base_primary_q_tar_02_exit_smoke.png',
]

/** Ahri_Base_W_mis / W_mis_02 — fox fire swirls + fire atlas. */
const AHRI_W_PARTICLES = [
  'ahri_base_w_fire2x2.png',
  'ahri_base_w_ringflare.png',
  'ahri_base_w_smoke_2x2.png',
  'ahri_base_w_trail_erode.png',
  'ahri_base_w_smallstartrail.png',
  'ahri_w_rays_mult.png',
  'ahri_base_orb_fox_01.png',
  'ahri_base_orb_fox_03.png',
]

/** Ahri_Base_E_mis — heart mesh + ribbon/trail. */
const AHRI_E_PARTICLES = [
  'ahri_base_e_heart_01.png',
  'ahri_base_e_heart_02.png',
  'ahri_e_heart.png',
  'ahri_base_e_trail_01.png',
  'ahri_base_e_smoke_2x2.png',
  'ahri_e_rays_mult.png',
  'ahri_base_e_distort.png',
]

/** Ahri_Base_R_mis / R_mis_02 — dash capsule + aura. */
const AHRI_R_PARTICLES = [
  'ahri_base_r_airbullet.png',
  'ahri_base_r_aura_glow.png',
  'ahri_base_r_trail2.png',
  'ahri_base_r_smoketrail_03.png',
  'ahri_base_r_shockblasts.png',
  'ahri_base_r_glow_test.png',
  'ahri_r_eyemask.png',
  'ahridash.png',
]

const SPELL_VFX = [
  ...new Set([
    ...AHRI_BA_PARTICLES,
    ...AHRI_Q_PARTICLES,
    ...AHRI_W_PARTICLES,
    ...AHRI_E_PARTICLES,
    ...AHRI_R_PARTICLES,
  ]),
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
    const dest = AHRI_BA_PARTICLES.includes(file)
      ? join(BA_OUT, file)
      : join(SPELL_OUT, file)
    const ok = await downloadOne(`${PARTICLES}/${file}`, dest)
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
