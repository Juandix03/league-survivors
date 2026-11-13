import { createWriteStream, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL_OUT = join(__dirname, '../../public/assets/vfx/missfortune/spells')
const BA_OUT = join(__dirname, '../../public/assets/vfx/missfortune')
const HUD_OUT = join(__dirname, '../../public/assets/hud/missfortune')
const PARTICLES =
  'https://raw.communitydragon.org/latest/game/assets/characters/missfortune/skins/base/particles'
const HUD_CDRAGON =
  'https://raw.communitydragon.org/latest/game/assets/characters/missfortune/hud/icons2d'

const FILES = [
  'missfortune_base_musketball.png',
  'missfortune_base_musketball_fire.png',
  'missfortune_base_musketball_blur.png',
  'missfortune_base_z_muzzleflash_2x3.png',
  'missfortune_base_aa_glow_cone.png',
  'missfortune_base_aa_smoke_trail.png',
  'missfortune_base_ba_embers.png',
  'missfortune_base_q_flash_sharp_01.png',
  'missfortune_base_q_ground.png',
  'missfortune_base_q_tar_light01.png',
  'missfortune_base_q_flames_4x4.png',
  'missfortune_base_w_attackbuff02.png',
  'missfortune_base_w_buf_muzzleglow.png',
  'missfortune_base_w_smoketrail.png',
  'missfortune_base_w_swirl.png',
  'missfortune_base_e_musketball_blur_03.png',
  'missfortune_base_e_hit_water_splash_2.png',
  'missfortune_base_e_hit_shockwave_colorwhite.png',
  'missfortune_base_e_teamring_red.png',
  'missfortune_base_r_mis_projectile.png',
  'missfortune_base_r_cas_flash_glow.png',
  'missfortune_base_r_aoe_indicator_projection.png',
  'missfortune_base_p_mark.png',
  'missfortune_base_smoke_4x4.png',
  'missfortune_base_spark.png',
  'missfortune_base_q_tar_dustcone_streak.png',
  'missfortune_base_impactsparks_4x4.png',
  'missfortune_e_bullet_add.png',
  'missfortune_base_z_heart01.png',
  'missfortune_base_w_buf_starstreaks_4x2.png',
  'missfortune_base_w_buf_muzzleglow_mult.png',
  'missfortune_base_r_frame.png',
  'missfortune_base_w_attackbuff.png',
  'missfortune_base_e_hit_shockwavering.png',
  'missfortune_base_e_hit_domealphafade.png',
  'missfortune_base_r_aoe_indicator_rampdown.png',
  'missfortune_base_r_aoe_indicator_projection_enemy.png',
]

const HUD = [
  { file: 'MissFortuneQ.png', url: `${HUD_CDRAGON}/missfortune_q.png` },
  { file: 'MissFortuneW.png', url: `${HUD_CDRAGON}/missfortune_w.png` },
  { file: 'MissFortuneE.png', url: `${HUD_CDRAGON}/missfortune_e.png` },
  { file: 'MissFortuneR.png', url: `${HUD_CDRAGON}/missfortune_r.png` },
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
mkdirSync(BA_OUT, { recursive: true })
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
console.log('Miss Fortune spell + HUD OK')
