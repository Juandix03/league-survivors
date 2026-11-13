/**
 * E — sheet top-down (expo_cylinder + sphere_e_01), kugel en vuelo y zona.
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
const OUT = '../../public/assets/vfx/lux/baked/lux_e_kugel_top_sheet.png'
const TMP = join(__dirname, 'work/e-kugel-top-sheet-frames')

function runFrame(i, rotY) {
  const out = join(TMP, `frame_${i}.png`)
  const r = spawnSync(
    'node',
    [
      'bake-mesh-sprite.mjs',
      '--obj',
      'work/lux_base_expo_cylinder.obj',
      '--tex',
      `${SPELL}/sphere_e_01.png`,
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
  const tiles = []
  for (let i = 0; i < FRAMES; i += 1) {
    const p = join(TMP, `frame_${i}.png`)
    tiles.push({ input: p, left: (i % COLS) * FW, top: Math.floor(i / COLS) * FH })
  }
  await sharp({
    create: {
      width: COLS * FW,
      height: ROWS * FH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(tiles)
    .png()
    .toFile(join(__dirname, OUT))
}

if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true })
mkdirSync(TMP, { recursive: true })

for (let i = 0; i < FRAMES; i += 1) {
  runFrame(i, (i / FRAMES) * Math.PI * 2)
}

await compositeSheet()
console.log('Wrote', OUT)
