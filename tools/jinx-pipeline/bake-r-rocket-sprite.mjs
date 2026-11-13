/**
 * Orthographic bake: Jinx_R_Mis.scb → OBJ + jinx_r_mis.png → PNG sprite.
 * Requires: work/jinx_r_mis.obj (scb-export-obj.py + local Jinx.wad.client extract).
 */
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = __dirname
const WORK = join(ROOT, 'work')
const OBJ = join(WORK, 'jinx_r_mis.obj')
const TEX = resolve(ROOT, '../../public/assets/vfx/jinx/spells/jinx_r_mis.png')
const OUT_DIR = resolve(ROOT, '../../public/assets/vfx/jinx/r-projectile')
const OUT = join(OUT_DIR, 'jinx_r_rocket_sprite.png')

function serveStatic(port) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const url = req.url?.split('?')[0] ?? '/'
      const rel = url === '/' ? '/bake-r-rocket.html' : url
      const safe = rel.replace(/^\//, '').replace(/\.\./g, '')
      let filePath
      if (safe.startsWith('work/')) {
        filePath = join(WORK, safe.slice('work/'.length))
      } else if (safe.startsWith('assets/')) {
        filePath = resolve(ROOT, '../../public', safe)
      } else {
        filePath = join(ROOT, safe)
      }
      try {
        const data = readFileSync(filePath)
        const ext = filePath.split('.').pop()?.toLowerCase()
        const types = {
          html: 'text/html',
          js: 'text/javascript',
          mjs: 'text/javascript',
          obj: 'text/plain',
          png: 'image/png',
        }
        res.writeHead(200, { 'Content-Type': types[ext ?? ''] ?? 'application/octet-stream' })
        res.end(data)
      } catch {
        res.writeHead(404)
        res.end('not found')
      }
    })
    server.listen(port, () => resolvePromise(server))
  })
}

/** Crop to non-transparent bounds (uses alpha, not RGB). */
async function trimTransparentBounds(pngBuffer) {
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let minX = info.width
  let minY = info.height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const a = data[(y * info.width + x) * 4 + 3]
      if (a > 8) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  if (maxX <= minX) return pngBuffer
  const pad = 4
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(info.width - 1, maxX + pad)
  maxY = Math.min(info.height - 1, maxY + pad)
  return sharp(pngBuffer)
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toBuffer()
}

function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
  return Buffer.from(base64, 'base64')
}

async function main() {
  if (!existsSync(OBJ)) {
    throw new Error(`Missing ${OBJ}. Run scb-export-obj.py after wad-extract.`)
  }
  if (!existsSync(TEX)) {
    throw new Error(`Missing ${TEX}. Run npm run jinx:download-spells in repo root.`)
  }

  mkdirSync(OUT_DIR, { recursive: true })
  const port = 8770 + Math.floor(Math.random() * 50)
  const server = await serveStatic(port)
  const pageUrl =
    `http://127.0.0.1:${port}/bake-r-rocket.html` +
    `?obj=${encodeURIComponent('/work/jinx_r_mis.obj')}` +
    `&tex=${encodeURIComponent('/assets/vfx/jinx/spells/jinx_r_mis.png')}` +
    '&w=640&h=256'

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 640, height: 256 })
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.__jinxRBake?.ready === true, null, { timeout: 120_000 })
  const dataUrl = await page.evaluate(() => window.__jinxRBake.exportPng())
  await browser.close()
  server.close()

  const raw = dataUrlToBuffer(dataUrl)
  const trimmed = await trimTransparentBounds(raw)
  const rgba = await sharp(trimmed).ensureAlpha().png().toBuffer()
  writeFileSync(OUT, rgba)
  const meta = await sharp(rgba).metadata()
  const { data, info } = await sharp(rgba).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let transparent = 0
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 10) transparent += 1
  }
  console.log(
    `Wrote ${OUT} (${meta.width}x${meta.height}) channels=${meta.channels} hasAlpha=${meta.hasAlpha} transparentPx=${transparent}/${info.width * info.height}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
