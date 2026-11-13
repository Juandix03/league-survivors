/**
 * Build a single-sprite PNG from Riot's jinx_base_w_lightning01 (CommunityDragon).
 * Top bolt region + black → alpha (not a 3D missile export).
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dirname, '../../public/assets/vfx/jinx/spells/jinx_base_w_lightning01.png')
const OUT_DIR = join(__dirname, '../../public/assets/vfx/jinx/w-projectile')
const OUT = join(OUT_DIR, 'jinx_w_zap_sprite.png')

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .extract({ left: 0, top: 0, width: 256, height: 150 })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const out = Buffer.alloc(info.width * info.height * 4)
  let minX = info.width
  let minY = info.height
  let maxX = 0
  let maxY = 0

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const lum = (r + g + b) / 3
      const a = lum > 18 ? Math.min(255, Math.floor(lum * 1.1)) : 0
      const o = (y * info.width + x) * 4
      out[o] = r
      out[o + 1] = g
      out[o + 2] = b
      out[o + 3] = a
      if (a > 12) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  const cw = maxX - minX + 1
  const ch = maxY - minY + 1
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left: minX, top: minY, width: cw, height: ch })
    .png()
    .toFile(OUT)

  console.log('Wrote', OUT, `${cw}x${ch}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
