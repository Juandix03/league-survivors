/**
 * Ezreal spell VFX + HUD — CommunityDragon (latest).
 */
import { createWriteStream, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL_OUT = join(__dirname, '../../public/assets/vfx/ezreal/spells')
const HUD_OUT = join(__dirname, '../../public/assets/hud/ezreal')
const PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/characters/ezreal/skins/base/particles'
const HUD_CDRAGON =
  'https://raw.communitydragon.org/latest/game/assets/characters/ezreal/hud/icons2d'

const FILES = [
  'common_aura_self.png',
  'common_color-hold.png',
  'common_crystal-flash.png',
  'common_flare-rainbow_blue_green_02.png',
  'common_glow-soft.png',
  'ezreal_base_ba_glow.png',
  'ezreal_base_ba_mis.png',
  'ezreal_base_ba_whisps.png',
  'ezreal_base_q_erode.png',
  'ezreal_base_q_hit_spark.png',
  'ezreal_base_q_mis_trail.png',
  'ezreal_base_w_cas_tex.png',
  'ezreal_base_w_meshlines.png',
  'ezreal_base_w_orb.png',
  'ezreal_base_w_ringglow.png',
  'ezreal_base_w_spintex.png',
  'ezreal_base_r_bow_arrow.png',
  'ezreal_base_r_bow_tex.png',
  'ezreal_base_r_mis_glow.png',
  'ezreal_base_r_tail_tex.png',
  'ezreal_base_r_trail.png',
  'ezreal_r_cas_pulse.png',
  'ezreal_base_z_ball01.png',
  'ezreal_base_z_color-beacontrail.png',
  'ezreal_base_z_flare-sun.png',
  'ezreal_base_z_glow.png',
  'ezreal_base_z_glowflare.png',
  'ezreal_base_z_ring.png',
  'ezreal_base_z_sliver.png',
  'ezreal_base_z_solar_tag.png',
]

const HUD = [
  { file: 'EzrealMysticShot.png', url: `${HUD_CDRAGON}/ezreal_q.png` },
  { file: 'EzrealEssenceFlux.png', url: `${HUD_CDRAGON}/ezreal_w.png` },
  { file: 'EzrealArcaneShift.png', url: `${HUD_CDRAGON}/ezreal_e.png` },
  { file: 'EzrealTrueshotBarrage.png', url: `${HUD_CDRAGON}/ezreal_r.png` },
]

function isPng(buffer) {
  return buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50
}

async function downloadOne(url, dest) {
  if (existsSync(dest)) {
    const existing = readFileSync(dest)
    if (isPng(existing) && existing.length > 200) {
      console.log('SKIP', dest.split(/[/\\]/).pop())
      return true
    }
  }
  const res = await fetch(url)
  if (!res.ok) {
    console.error('FAIL', res.status, url)
    return false
  }
  mkdirSync(dirname(dest), { recursive: true })
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  console.log('OK', dest.split(/[/\\]/).pop())
  return true
}

mkdirSync(SPELL_OUT, { recursive: true })
mkdirSync(HUD_OUT, { recursive: true })

let fail = 0
for (const file of FILES) {
  const dest = join(SPELL_OUT, file)
  if (!(await downloadOne(`${PARTICLES}/${file}`, dest))) fail += 1
}
for (const { file, url } of HUD) {
  if (!(await downloadOne(url, join(HUD_OUT, file)))) fail += 1
}
if (fail > 0) process.exit(1)
console.log('Ezreal spell + HUD OK')
