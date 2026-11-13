/**
 * Pre-compose CD windwall masks → one scrolling strip (no ADD stack in-game).
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPELL = resolve(__dirname, '../../public/assets/vfx/yasuo/spells')
const OUT = resolve(__dirname, '../../public/assets/champions/yasuo/w_wall_curtain_strip.png')

const W = 512
const H = 128

async function load(path) {
  if (!existsSync(path)) throw new Error('Missing ' + path)
  return sharp(path).ensureAlpha().resize(W, H, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true })
}

function screenBlend(bg, fg, info) {
  const out = Buffer.from(bg)
  for (let i = 0; i < info.width * info.height; i += 1) {
    const o = i * 4
    const aF = fg[o + 3] / 255
    if (aF <= 0) continue
    for (let c = 0; c < 3; c += 1) {
      const b = bg[o + c] / 255
      const f = fg[o + c] / 255
      const s = 1 - (1 - b) * (1 - f)
      out[o + c] = Math.round((b * (1 - aF) + s * aF) * 255)
    }
    out[o + 3] = Math.min(255, Math.round(bg[o + 3] + fg[o + 3] * (1 - bg[o + 3] / 255)))
  }
  return out
}

async function main() {
  mkdirSync(dirname(OUT), { recursive: true })
  const main = await load(join(SPELL, 'yasuo_w_windwall_main.png'))
  const main02 = await load(join(SPELL, 'yasuo_w_windwall_main_02.png'))
  const mult = await load(join(SPELL, 'yasuo_w_windwall_distort.png'))

  let buf = main.data
  buf = screenBlend(buf, main02.data, main.info)
  buf = screenBlend(buf, mult.data, main.info)

  for (let i = 0; i < main.info.width * main.info.height; i += 1) {
    const o = i * 4
    const lum = (buf[o] + buf[o + 1] + buf[o + 2]) / 3
    const a = lum > 12 ? Math.min(255, Math.floor(lum * 1.05)) : 0
    buf[o] = Math.min(255, Math.floor(buf[o] * 0.55 + lum * 0.45))
    buf[o + 1] = Math.min(255, Math.floor(buf[o + 1] * 0.65 + lum * 0.55))
    buf[o + 2] = Math.min(255, Math.floor(buf[o + 2] * 0.85 + lum * 0.35))
    buf[o + 3] = a
  }

  writeFileSync(
    OUT,
    await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer(),
  )
  console.log('Wrote', OUT)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
