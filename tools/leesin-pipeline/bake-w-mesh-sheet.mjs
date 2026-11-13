/**
 * 3 facing bakes of Riot windwall mesh → one spritesheet for arena aim.
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
const PUBLIC_YASUO = resolve(ROOT, '../../public/assets/champions/yasuo')

const FRAME_W = 640
const FRAME_H = 320
const ROWS = [
  { label: 'down', rotY: Math.PI / 2 },
  { label: 'up', rotY: -Math.PI / 2 },
  { label: 'side', rotY: 0 },
]

const OBJ = join(WORK, 'yasuo_w_windwall_mesh.obj')
const SIDE = join(WORK, 'yasuo_w_windwall_side_mesh.obj')
const OUT = join(PUBLIC_YASUO, 'w_wall_mesh_sheet.png')

function serveStatic(port) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const url = req.url?.split('?')[0] ?? '/'
      const rel = url === '/' ? '/bake-windwall-mesh.html' : url
      const safe = rel.replace(/^\//, '').replace(/\.\./g, '')
      let filePath
      if (safe.startsWith('work/')) filePath = join(WORK, safe.slice('work/'.length))
      else if (safe.startsWith('assets/')) filePath = resolve(ROOT, '../../public', safe)
      else filePath = join(ROOT, safe)
      try {
        const data = readFileSync(filePath)
        const ext = filePath.split('.').pop()?.toLowerCase()
        const types = { html: 'text/html', obj: 'text/plain', png: 'image/png', tex: 'application/octet-stream' }
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

async function emissiveLuminanceAlpha(pngBuffer) {
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const out = Buffer.alloc(data.length)
  for (let i = 0; i < info.width * info.height; i += 1) {
    const o = i * 4
    const r = data[o]
    const g = data[o + 1]
    const b = data[o + 2]
    const lum = (r + g + b) / 3
    const a = lum > 10 ? Math.min(255, Math.floor(lum * 1.15)) : 0
    const boost = 1.08
    out[o] = Math.min(255, Math.floor(r * boost))
    out[o + 1] = Math.min(255, Math.floor(g * boost))
    out[o + 2] = Math.min(255, Math.floor(Math.max(b, lum * 0.35) * 1.2))
    out[o + 3] = a
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
}

async function trimTransparentBounds(pngBuffer) {
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let minX = info.width
  let minY = info.height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const a = data[(y * info.width + x) * 4 + 3]
      if (a > 10) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  if (maxX <= minX) return pngBuffer
  const pad = 8
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(info.width - 1, maxX + pad)
  maxY = Math.min(info.height - 1, maxY + pad)
  const cropped = await sharp(pngBuffer)
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toBuffer()
  return sharp(cropped)
    .resize(FRAME_W, FRAME_H, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

async function prepareTex() {
  return '/assets/vfx/yasuo/spells/yasuo_w_windwall_main.png'
}

async function main() {
  if (!existsSync(OBJ)) throw new Error('Run yasuo:extract-wad && yasuo:export-windwall-scb first')
  mkdirSync(PUBLIC_YASUO, { recursive: true })
  const texRel = await prepareTex()
  const objRel = '/work/yasuo_w_windwall_mesh.obj'
  const sideRel = existsSync(SIDE) ? '/work/yasuo_w_windwall_side_mesh.obj' : ''

  const port = 8900 + Math.floor(Math.random() * 20)
  const server = await serveStatic(port)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: FRAME_W, height: FRAME_H })

  const composites = []
  for (let row = 0; row < ROWS.length; row += 1) {
    const { label, rotY } = ROWS[row]
    const pageUrl =
      `http://127.0.0.1:${port}/bake-windwall-mesh.html` +
      `?obj=${encodeURIComponent(objRel)}` +
      (sideRel ? `&sideObj=${encodeURIComponent(sideRel)}` : '') +
      `&tex=${encodeURIComponent(texRel)}` +
      `&w=${FRAME_W}&h=${FRAME_H}&fill=0.95&rotY=${rotY}`
    await page.goto(pageUrl, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => window.__yasuoWallBake?.ready === true, null, { timeout: 120_000 })
    const dataUrl = await page.evaluate(() => window.__yasuoWallBake.exportPng())
    const raw = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64')
    let frame = await emissiveLuminanceAlpha(raw)
    frame = await trimTransparentBounds(frame)
    composites.push({ input: frame, left: 0, top: row * FRAME_H })
    process.stdout.write(`\rbake row ${row + 1}/${ROWS.length} (${label})`)
  }
  console.log()

  const sheetH = FRAME_H * ROWS.length
  const base = await sharp({
    create: { width: FRAME_W, height: sheetH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer()
  writeFileSync(OUT, await sharp(base).composite(composites).png().toBuffer())
  console.log('Wrote', OUT, `${FRAME_W}x${sheetH}`)
  await browser.close()
  server.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
