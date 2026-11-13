/**
 * Extrae tiles de pasto desde las imágenes de referencia (top-down LoL-style).
 * Salida: public/assets/arena/grass-tile-a.jpg, grass-tile-b.jpg
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from '../jinx-pipeline/node_modules/sharp/lib/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

const refPng = path.join(repoRoot, 'public/assets/arena/reference/ref-topdown-grass-path.png')

const outDir = path.join(repoRoot, 'public/assets/arena')
const refOutDir = path.join(outDir, 'reference')

const TILE = 512
const FEATHER = Math.floor(TILE * 0.11)

function seamBlendHorizontal(data, w, h, channels, band) {
  const out = Buffer.from(data)
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < band; x += 1) {
      const t = x / band
      const xOpp = w - band + x
      for (let c = 0; c < 3; c += 1) {
        const iA = (y * w + x) * channels + c
        const iB = (y * w + xOpp) * channels + c
        const a = data[iA]
        const b = data[iB]
        out[iA] = Math.round(a * (1 - t) + b * t)
        out[iB] = Math.round(b * (1 - t) + a * t)
      }
    }
  }
  return out
}

function seamBlendVertical(buf, w, h, channels, band) {
  const out = Buffer.from(buf)
  for (let x = 0; x < w; x += 1) {
    for (let y = 0; y < band; y += 1) {
      const t = y / band
      const yOpp = h - band + y
      for (let c = 0; c < 3; c += 1) {
        const iA = (y * w + x) * channels + c
        const iB = (yOpp * w + x) * channels + c
        const a = buf[iA]
        const b = buf[iB]
        out[iA] = Math.round(a * (1 - t) + b * t)
        out[iB] = Math.round(b * (1 - t) + a * t)
      }
    }
  }
  return out
}

async function cropSeamlessTile(source, left, top, width, height, outPath, hueShift = 0) {
  let img = source.clone().extract({ left, top, width, height }).resize(TILE, TILE)
  if (hueShift !== 0) {
    img = img.modulate({ hue: hueShift, saturation: 1.02, brightness: 1.01 })
  }

  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let blended = seamBlendHorizontal(data, info.width, info.height, info.channels, FEATHER)
  blended = seamBlendVertical(blended, info.width, info.height, info.channels, FEATHER)

  await sharp(blended, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outPath)
}

async function main() {
  if (!fs.existsSync(refPng)) {
    console.error('Missing reference PNG:', refPng)
    process.exit(1)
  }

  fs.mkdirSync(refOutDir, { recursive: true })

  const source = sharp(refPng)
  const meta = await source.metadata()

  /** Mitad superior de la referencia: pasto + flores, sin losas del borde inferior. */
  const cropA = {
    left: 260,
    top: 0,
    width: Math.min(500, meta.width - 260),
    height: Math.min(300, meta.height),
  }
  const cropB = {
    left: 680,
    top: 0,
    width: Math.min(300, meta.width - 680),
    height: Math.min(280, meta.height),
  }

  fs.mkdirSync(outDir, { recursive: true })

  await cropSeamlessTile(
    source,
    cropA.left,
    cropA.top,
    cropA.width,
    cropA.height,
    path.join(outDir, 'grass-tile-a.jpg'),
  )
  await cropSeamlessTile(
    source,
    cropB.left,
    cropB.top,
    cropB.width,
    cropB.height,
    path.join(outDir, 'grass-tile-b.jpg'),
    8,
  )

  console.log('Wrote grass tiles to', outDir)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
