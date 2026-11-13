/**
 * Mystic Shot — q_mis_trail + núcleo q_erode (horizontal, +X).
 */
import sharp from 'sharp'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL = join(__dirname, '../../public/assets/vfx/ezreal/spells')
const OUT = join(__dirname, '../../public/assets/vfx/ezreal/baked')

const TRAIL_SRC = join(SPELL, 'ezreal_base_q_mis_trail.png')
const CORE_SRC = join(SPELL, 'ezreal_base_q_erode.png')

const FRAME_W = 132
const FRAME_H = 34
const FRAMES = 6
const STRIP_H = 9
const OUT_SHEET = join(OUT, 'ezreal_q_bolt_sheet.png')
const OUT_SINGLE = join(OUT, 'ezreal_q_bolt_sprite.png')

function rowScore(data, width, y) {
  let score = 0
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4
    score += Math.max(data[i], data[i + 1], data[i + 2])
  }
  return score
}

function pickStripRows(data, width, height) {
  const rows = []
  for (let y = 0; y < height - STRIP_H; y += 2) {
    rows.push({ y, score: rowScore(data, width, y + Math.floor(STRIP_H / 2)) })
  }
  rows.sort((a, b) => b.score - a.score)
  const picked = []
  for (const row of rows) {
    if (picked.some((p) => Math.abs(p.y - row.y) < STRIP_H * 2)) continue
    picked.push(row)
    if (picked.length >= FRAMES) break
  }
  picked.sort((a, b) => a.y - b.y)
  while (picked.length < FRAMES) {
    picked.push(picked[picked.length - 1] ?? { y: Math.floor(height / 3), score: 0 })
  }
  return picked.slice(0, FRAMES)
}

async function stripFromTrail(y0, srcWidth) {
  return sharp(TRAIL_SRC)
    .extract({ left: 0, top: y0, width: Math.min(srcWidth, 512), height: STRIP_H })
    .resize(88, 9, { fit: 'fill' })
    .ensureAlpha()
    .png()
    .toBuffer()
}

async function coreBlob() {
  const meta = await sharp(CORE_SRC).metadata()
  const w = meta.width ?? 128
  const h = meta.height ?? 128
  const size = Math.min(48, w, h)
  const left = Math.floor((w - size) / 2)
  const top = Math.floor((h - size) / 3)
  return sharp(CORE_SRC)
    .extract({ left, top, width: size, height: size })
    .resize(24, 24, { fit: 'inside' })
    .ensureAlpha()
    .png()
    .toBuffer()
}

async function composeFrame(stripBuf, coreBuf, frameIndex) {
  const base = await sharp({
    create: {
      width: FRAME_W,
      height: FRAME_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer()

  const glow = await sharp(coreBuf)
    .resize(20 + frameIndex, 20 + frameIndex)
    .ensureAlpha()
    .png()
    .toBuffer()

  return sharp(base)
    .composite([
      { input: stripBuf, left: 10, top: 13 },
      { input: glow, left: FRAME_W - 32, top: 6, blend: 'screen' },
      { input: coreBuf, left: FRAME_W - 30, top: 7, blend: 'screen' },
    ])
    .png()
    .toBuffer()
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  for (const p of [TRAIL_SRC, CORE_SRC]) readFileSync(p)

  const trailMeta = await sharp(TRAIL_SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const rows = pickStripRows(trailMeta.data, trailMeta.info.width, trailMeta.info.height)
  const coreBuf = await coreBlob()

  const frames = []
  for (let i = 0; i < FRAMES; i += 1) {
    const stripBuf = await stripFromTrail(rows[i].y, trailMeta.info.width)
    frames.push(await composeFrame(stripBuf, coreBuf, i))
  }

  const sheetW = FRAME_W * FRAMES
  await sharp({
    create: {
      width: sheetW,
      height: FRAME_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(frames.map((buf, i) => ({ input: buf, left: i * FRAME_W, top: 0 })))
    .png()
    .toFile(OUT_SHEET)

  await sharp(frames[0]).png().toFile(OUT_SINGLE)

  writeFileSync(
    join(OUT, 'ezreal_q_bolt_meta.json'),
    JSON.stringify({ frameWidth: FRAME_W, frameHeight: FRAME_H, frames: FRAMES }, null, 2),
  )
  console.log('Wrote', OUT_SHEET, `${sheetW}x${FRAME_H}`)
  console.log('Wrote', OUT_SINGLE)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
