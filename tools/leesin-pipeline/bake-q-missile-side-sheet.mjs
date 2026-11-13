/**
 * Lee Sin Q — vista lateral (como en cliente isométrico), no top-down blob.
 */
import { copyFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LUX = join(__dirname, '../lux-pipeline')
const FRAMES = 8
const FW = 192
const FH = 96
const COLS = 4
const ROWS = 2
const SPELL = '../../public/assets/vfx/leesin/spells'
const OUT = '../../public/assets/vfx/leesin/baked/leesin_q_missile_side_sheet.png'
const TMP = join(__dirname, 'work/q-missile-side-frames')

const SPELL_ABS = resolve(__dirname, SPELL)
const LAYERS = [
  {
    obj: resolve(__dirname, 'work/leesin_q_mis_cone.obj'),
    tex: join(SPELL_ABS, 'base_leesin_q_mis_front_02.png'),
    fill: 0.94,
  },
  {
    obj: resolve(__dirname, 'work/leesin_q_energyflame.obj'),
    tex: join(SPELL_ABS, 'leesin_base_q_magicalwisp.png'),
    fill: 0.9,
  },
  {
    obj: resolve(__dirname, 'work/leesin_q_wave_front.obj'),
    tex: join(SPELL_ABS, 'leesin_base_q_waves.png'),
    fill: 0.86,
  },
]

function stageObjForLux(objPath) {
  const name = objPath.split(/[/\\]/).pop()
  mkdirSync(join(LUX, 'work'), { recursive: true })
  copyFileSync(objPath, join(LUX, 'work', name))
}

function runFrame(i, rotY, layerIndex) {
  const layer = LAYERS[layerIndex]
  stageObjForLux(layer.obj)
  const out = join(TMP, `frame_${i}_L${layerIndex}.png`)
  const r = spawnSync(
    'node',
    [
      join(LUX, 'bake-mesh-sprite.mjs'),
      '--obj',
      layer.obj,
      '--tex',
      layer.tex,
      '--out',
      resolve(out),
      '--w',
      String(FW),
      '--h',
      String(FH),
      '--rotY',
      String(rotY),
      '--fill',
      String(layer.fill),
      '--cam',
      'side',
      '--noTrim',
      '1',
    ],
    { cwd: __dirname, stdio: 'inherit' },
  )
  if (r.status !== 0) process.exit(r.status ?? 1)
}

async function compositeFrame(i) {
  const out = join(TMP, `frame_${i}.png`)
  const layers = []
  for (let li = 0; li < LAYERS.length; li += 1) {
    layers.push({ input: join(TMP, `frame_${i}_L${li}.png`), blend: 'over' })
  }
  await sharp(layers[0].input).composite(layers.slice(1)).png().toFile(out)
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
  console.log('Wrote', outPath, `${sheetW}x${sheetH}`)
}

if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true })
mkdirSync(TMP, { recursive: true })

for (let i = 0; i < FRAMES; i += 1) {
  const rotY = (i / FRAMES) * Math.PI * 2
  console.log('\n== side frame', i)
  for (let li = 0; li < LAYERS.length; li += 1) runFrame(i, rotY, li)
  await compositeFrame(i)
}

await compositeSheet()
