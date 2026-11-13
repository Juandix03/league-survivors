/**
 * W Prismatic Wave — 8 frames top-down (expo + w_prism).
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRAMES = 8
const FW = 128
const FH = 128
const COLS = 4
const ROWS = 2
const SPELL = '../../public/assets/vfx/lux/spells'
const OUT = '../../public/assets/vfx/lux/baked/lux_w_wave_top_sheet.png'
const TMP = join(__dirname, 'work/w-top-sheet-frames')

function runFrame(i, rotY) {
  const out = join(TMP, `frame_${i}.png`)
  const r = spawnSync(
    'node',
    [
      'bake-mesh-sprite.mjs',
      '--obj',
      'work/lux_base_expo_cylinder.obj',
      '--tex',
      `${SPELL}/lux_base_w_prism.png`,
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
      'top',
      '--noTrim',
      '1',
    ],
    { cwd: __dirname, stdio: 'inherit' },
  )
  if (r.status !== 0) process.exit(r.status ?? 1)
}

async function compositeSheet() {
  const sheetW = FW * COLS
  const sheetH = FH * ROWS
  const composites = []
  for (let i = 0; i < FRAMES; i += 1) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const framePath = join(TMP, `frame_${i}.png`)
    composites.push({
      input: await sharp(framePath)
        .resize(FW, FH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
      left: col * FW,
      top: row * FH,
    })
  }
  const outPath = join(__dirname, OUT)
  mkdirSync(dirname(outPath), { recursive: true })
  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(outPath)
  console.log('Wrote', outPath)
}

if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true })
mkdirSync(TMP, { recursive: true })
for (let i = 0; i < FRAMES; i += 1) {
  runFrame(i, (i / FRAMES) * Math.PI * 2)
}
await compositeSheet()
