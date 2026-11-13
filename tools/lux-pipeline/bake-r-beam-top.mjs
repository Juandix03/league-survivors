/**
 * R Final Spark — tiras top-down (expo + lazurbeam / core_mult) + sheet de pulso.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL = '../../public/assets/vfx/lux/spells'
const OUT_DIR = '../../public/assets/vfx/lux/baked'

const STRIP_W = 768
const STRIP_H = 112

function bakeStrip(label, tex, outName, rotY = '1.5708') {
  console.log('\n== R strip', label)
  const r = spawnSync(
    'node',
    [
      'bake-mesh-sprite.mjs',
      '--obj',
      'work/lux_base_expo_cylinder.obj',
      '--tex',
      `${SPELL}/${tex}`,
      '--out',
      `${OUT_DIR}/${outName}`,
      '--w',
      String(STRIP_W),
      '--h',
      String(STRIP_H),
      '--rotY',
      rotY,
      '--fill',
      '0.93',
      '--cam',
      'side',
      '--noTrim',
      '1',
    ],
    { cwd: __dirname, stdio: 'inherit' },
  )
  if (r.status !== 0) process.exit(r.status ?? 1)
}

bakeStrip('prism (rainbow mult)', 'lux_base_rainbowmult.png', 'lux_r_beam_top_prism.png')
bakeStrip('glow', 'lux_base_r_lazurbeamglow.png', 'lux_r_beam_top_glow.png')
bakeStrip('core', 'lux_base_r_lazurbeam01.png', 'lux_r_beam_top_core.png')

const FRAMES = 8
const FW = 128
const FH = 80
const COLS = 4
const ROWS = 2
const TMP = join(__dirname, 'work/r-beam-top-sheet-frames')
const OUT_SHEET = join(__dirname, `${OUT_DIR}/lux_r_beam_top_sheet.png`)

function runFrame(i, rotY) {
  const out = join(TMP, `frame_${i}.png`)
  const r = spawnSync(
    'node',
    [
      'bake-mesh-sprite.mjs',
      '--obj',
      'work/lux_base_expo_cylinder.obj',
      '--tex',
      `${SPELL}/lux_base_rainbowmult.png`,
      '--out',
      out,
      '--w',
      String(FW),
      '--h',
      String(FH),
      '--rotY',
      String(rotY),
      '--fill',
      '0.9',
      '--cam',
      'side',
      '--noTrim',
      '1',
    ],
    { cwd: __dirname, stdio: 'inherit' },
  )
  if (r.status !== 0) process.exit(r.status ?? 1)
}

if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true })
mkdirSync(TMP, { recursive: true })

for (let i = 0; i < FRAMES; i += 1) {
  runFrame(i, (i / FRAMES) * Math.PI * 2)
}

const composites = []
for (let i = 0; i < FRAMES; i += 1) {
  const col = i % COLS
  const row = Math.floor(i / COLS)
  composites.push({
    input: join(TMP, `frame_${i}.png`),
    left: col * FW,
    top: row * FH,
  })
}

await sharp({
  create: {
    width: FW * COLS,
    height: FH * ROWS,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .png()
  .toFile(OUT_SHEET)

console.log('Wrote R beam top assets →', OUT_DIR)
