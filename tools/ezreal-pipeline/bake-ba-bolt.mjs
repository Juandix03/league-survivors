/**
 * Autoataque Ezreal — compone estela (ba_mis) + cabeza (ba_glow) + wisps en sprite horizontal.
 * Salida: public/assets/vfx/ezreal/baked/
 */
import sharp from 'sharp'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL = join(__dirname, '../../public/assets/vfx/ezreal/spells')
const OUT = join(__dirname, '../../public/assets/vfx/ezreal/baked')

const MIS = join(SPELL, 'ezreal_base_ba_mis.png')
const GLOW = join(SPELL, 'ezreal_base_ba_glow.png')
const WHISPS = join(SPELL, 'ezreal_base_ba_whisps.png')

const FRAME_W = 112
const FRAME_H = 28
const FRAMES = 4
const OUT_SHEET = join(OUT, 'ezreal_ba_bolt_sheet.png')
const OUT_SINGLE = join(OUT, 'ezreal_ba_bolt_sprite.png')

const STRIP_H = 12

function rowScore(data, width, y) {
  let score = 0
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4
    const mx = Math.max(data[i], data[i + 1], data[i + 2])
    score += mx
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
    if (picked.some((p) => Math.abs(p.y - row.y) < STRIP_H * 3)) continue
    picked.push(row)
    if (picked.length >= FRAMES) break
  }
  picked.sort((a, b) => a.y - b.y)
  while (picked.length < FRAMES) {
    picked.push(picked[picked.length - 1] ?? { y: Math.floor(height / 2), score: 0 })
  }
  return picked.slice(0, FRAMES)
}

async function loadMeta(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

async function stripPng(srcPath, y0, width, extractW = width) {
  return sharp(srcPath)
    .extract({ left: 0, top: y0, width: Math.min(extractW, width), height: STRIP_H })
    .resize(78, 9, { fit: 'fill' })
    .ensureAlpha()
    .png()
    .toBuffer()
}

async function headPng(frame) {
  const scale = 0.92 + frame * 0.03
  const size = Math.floor(16 * scale)
  return sharp(GLOW)
    .resize(size, size, { fit: 'cover' })
    .ensureAlpha()
    .png()
    .toBuffer()
}

async function wispPng(frame) {
  const meta = await sharp(WHISPS).metadata()
  const w = meta.width ?? 64
  const h = meta.height ?? 64
  const cell = Math.min(w, h) / 2
  const col = frame % 2
  const row = Math.floor(frame / 2) % 2
  return sharp(WHISPS)
    .extract({
      left: Math.min(col * cell, w - cell),
      top: Math.min(row * cell, h - cell),
      width: Math.min(cell, w),
      height: Math.min(cell, h),
    })
    .resize(20, 12, { fit: 'inside' })
    .ensureAlpha()
    .png()
    .toBuffer()
}

async function composeFrame(frameIndex, stripBuf, headBuf, wispBuf) {
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

  const alphaWisp = 0.28 + frameIndex * 0.04
  const wispFaded = await sharp(wispBuf).ensureAlpha().linear(1, 0).png().toBuffer()

  return sharp(base)
    .composite([
      { input: stripBuf, left: 6, top: 10 },
      { input: wispFaded, left: 10, top: 9, blend: 'screen' },
      { input: headBuf, left: FRAME_W - 22, top: 6, blend: 'screen' },
    ])
    .png()
    .toBuffer()
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  for (const p of [MIS, GLOW, WHISPS]) {
    readFileSync(p)
  }

  const mis = await loadMeta(MIS)
  const rows = pickStripRows(mis.data, mis.width, mis.height)

  const frameBuffers = []
  for (let i = 0; i < FRAMES; i += 1) {
    const stripBuf = await stripPng(MIS, rows[i].y, mis.width)
    const headBuf = await headPng(i)
    const wispBuf = await wispPng(i)
    frameBuffers.push(await composeFrame(i, stripBuf, headBuf, wispBuf))
  }

  const sheetH = FRAME_H
  const sheetW = FRAME_W * FRAMES
  const sheetBase = await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer()

  await sharp(sheetBase)
    .composite(frameBuffers.map((buf, i) => ({ input: buf, left: i * FRAME_W, top: 0 })))
    .png()
    .toFile(OUT_SHEET)

  await sharp(frameBuffers[0]).png().toFile(OUT_SINGLE)

  writeFileSync(
    join(OUT, 'ezreal_ba_bolt_meta.json'),
    JSON.stringify({ frameWidth: FRAME_W, frameHeight: FRAME_H, frames: FRAMES }, null, 2),
  )
  console.log('Wrote', OUT_SHEET, `${sheetW}x${sheetH}`)
  console.log('Wrote', OUT_SINGLE)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
