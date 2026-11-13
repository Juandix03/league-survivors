/**
 * Lux spell VFX — CommunityDragon base particles + Data Dragon HUD.
 */
import { createWriteStream, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL_OUT = join(__dirname, '../../public/assets/vfx/lux/spells')
const HUD_OUT = join(__dirname, '../../public/assets/hud/lux')
const PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/characters/lux/skins/base/particles'
const DDRAGON = 'https://ddragon.leagueoflegends.com/cdn/15.1.1/img/spell'

const LUX_BA = [
  'lux_base_light_sparks.png',
  'lux_base_hiteffect.png',
  'lux_base_soft-glow.png',
  'lux_q_shape.png',
]

const LUX_Q = [
  'lux_base_q_trail.png',
  'lux_base_q_spark.png',
  'lux_base_q_tar_cap.png',
  'lux_base_q_gradient_1.png',
  'lux_base_q_buf_cylinder.png',
  'lux_base_p_rainbowray.png',
  'globalhit_blue_tar_lux_outerring_lux_p-rgba.png',
]

const LUX_W = [
  'lux_base_w_prism.png',
  'lux_base_w_bw_shield_2d.png',
  'lux_base_w_glow.png',
  'lux_base_w_glow_outer.png',
  'lux_base_w_flash.png',
  'lux_base_w_rainbowmult.png',
  'light-shield.png',
]

const LUX_E = [
  'lux_base_e_flare.png',
  'lux_base_e_glow.png',
  'lux_base_e_flame_ring.png',
  'lux_base_e_flash.png',
  'lux_base_e_mote.png',
  'sphere_e_01.png',
]

const LUX_R = [
  'lux_base_r_lazurbeam01.png',
  'lux_base_r_lazurbeamglow.png',
  'lux_base_r_beam_core_mult.png',
  'lux_base_r_flash.png',
  'lux_base_r_glow.png',
  'lux_base_r_spark.png',
]

const SPELL_VFX = [...new Set([...LUX_BA, ...LUX_Q, ...LUX_W, ...LUX_E, ...LUX_R])]
const HUD_ICONS = [
  'LuxLightBinding.png',
  'LuxPrismaticWave.png',
  'LuxLightStrikeKugel.png',
  'LuxR.png',
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

async function download(url, dest) {
  const res = await fetch(url)
  if (!res.ok) return false
  const buf = Buffer.from(await res.arrayBuffer())
  if (!isPng(buf)) return false
  mkdirSync(dirname(dest), { recursive: true })
  await pipeline(Readable.from(buf), createWriteStream(dest))
  return true
}

async function main() {
  mkdirSync(SPELL_OUT, { recursive: true })
  mkdirSync(HUD_OUT, { recursive: true })
  let ok = 0
  let fail = 0
  for (const name of SPELL_VFX) {
    const dest = join(SPELL_OUT, name)
    if (existsSync(dest)) {
      ok += 1
      continue
    }
    const got = await download(`${PARTICLES}/${name}`, dest)
    if (got) {
      ok += 1
      console.log('OK', name)
    } else {
      fail += 1
      console.warn('MISS', name)
    }
  }
  for (const icon of HUD_ICONS) {
    const dest = join(HUD_OUT, icon)
    if (!existsSync(dest)) await download(`${DDRAGON}/${icon}`, dest)
  }
  console.log(`Done. ok=${ok} miss=${fail}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
