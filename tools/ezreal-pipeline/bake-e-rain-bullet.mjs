/**
 * Make It Rain — franjas de missfortune_base_e_musketball_blur_03 (lluvia real del cliente).
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dirname, '../../public/assets/vfx/missfortune/spells/missfortune_base_e_musketball_blur_03.png')
const OUT_DIR = join(__dirname, '../../public/assets/vfx/missfortune/baked')
const OUT_SHEET = join(OUT_DIR, 'mf_e_rain_streak_sheet.png')
const OUT_SINGLE = join(OUT_DIR, 'mf_e_rain_streak.png')

const STRIP_H = 10
const STRIPS = 8

function rowScore(data, width, y) {
  let score = 0
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r > 40 && r >= g) score += r - g * 0.5 + b * 0.1
  }
  return score
}

function stripToRgba(data, width, y0, stripH) {
  const out = Buffer.alloc(width * stripH * 4)
  for (let dy = 0; dy < stripH; dy += 1) {
    const y = y0 + dy
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const mx = Math.max(r, g, b)
      const a = mx > 12 ? Math.min(255, Math.floor(mx * 1.05)) : 0
      const o = (dy * width + x) * 4
      out[o] = r
      out[o + 1] = g
      out[o + 2] = b
      out[o + 3] = a
    }
  }
  return out
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info

  const rows = []
  for (let y = 0; y < height - STRIP_H; y += 2) {
    rows.push({ y, score: rowScore(data, width, y + STRIP_H / 2) })
  }
  rows.sort((a, b) => b.score - a.score)
  const picked = []
  for (const row of rows) {
    if (picked.some((p) => Math.abs(p.y - row.y) < STRIP_H * 2)) continue
    picked.push(row)
    if (picked.length >= STRIPS) break
  }
  picked.sort((a, b) => a.y - b.y)

  const composites = []
  for (let i = 0; i < picked.length; i += 1) {
    const y0 = picked[i].y
    const strip = stripToRgba(data, width, y0, STRIP_H)
    const png = await sharp(strip, { raw: { width, height: STRIP_H, channels: 4 } }).png().toBuffer()
    composites.push({ input: png, left: 0, top: i * STRIP_H })
  }

  const sheetH = STRIP_H * picked.length
  const base = await sharp({
    create: { width, height: sheetH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer()

  await sharp(base).composite(composites).png().toFile(OUT_SHEET)

  const best = picked[0]?.y ?? 200
  const single = stripToRgba(data, width, best, STRIP_H)
  await sharp(single, { raw: { width, height: STRIP_H, channels: 4 } }).png().toFile(OUT_SINGLE)

  writeFileSync(
    join(OUT_DIR, 'mf_e_rain_streak_meta.json'),
    JSON.stringify({ frameWidth: width, frameHeight: STRIP_H, frames: picked.length }, null, 2),
  )
  console.log('Wrote', OUT_SHEET, `${width}x${sheetH}`, 'frames', picked.length)
  console.log('Wrote', OUT_SINGLE)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
