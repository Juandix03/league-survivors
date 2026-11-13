/**
 * Bake windwall mesh face-on (camera sees the wall plane — like LoL).
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
const OUT = resolve(ROOT, '../../public/assets/champions/yasuo/w_wall_face_sheet.png')
const OBJ = join(WORK, 'yasuo_w_windwall_mesh.obj')
const SIDE = join(WORK, 'yasuo_w_windwall_side_mesh.obj')
const FRAME_W = 768
const FRAME_H = 384

function serveStatic(port) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const url = req.url?.split('?')[0] ?? '/'
      const rel = url === '/' ? '/bake-windwall-face.html' : url
      const safe = rel.replace(/^\//, '').replace(/\.\./g, '')
      let filePath
      if (safe.startsWith('work/')) filePath = join(WORK, safe.slice('work/'.length))
      else if (safe.startsWith('assets/')) filePath = resolve(ROOT, '../../public', safe)
      else filePath = join(ROOT, safe)
      try {
        const data = readFileSync(filePath)
        const ext = filePath.split('.').pop()?.toLowerCase()
        const types = { html: 'text/html', obj: 'text/plain', png: 'image/png' }
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

async function alphaFromLum(pngBuffer) {
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const out = Buffer.alloc(data.length)
  for (let i = 0; i < info.width * info.height; i += 1) {
    const o = i * 4
    const lum = (data[o] + data[o + 1] + data[o + 2]) / 3
    const a = lum > 8 ? Math.min(255, Math.floor(lum * 1.1)) : 0
    out[o] = data[o]
    out[o + 1] = data[o + 1]
    out[o + 2] = data[o + 2]
    out[o + 3] = a
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
}

async function main() {
  if (!existsSync(OBJ)) throw new Error('Missing mesh OBJ — run yasuo:extract-wad && yasuo:export-windwall-scb')
  mkdirSync(dirname(OUT), { recursive: true })
  const texRel = '/assets/vfx/yasuo/spells/yasuo_w_windwall_main.png'
  const port = 8910 + Math.floor(Math.random() * 15)
  const server = await serveStatic(port)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: FRAME_W, height: FRAME_H })
  const pageUrl =
    `http://127.0.0.1:${port}/bake-windwall-face.html` +
    `?obj=${encodeURIComponent('/work/yasuo_w_windwall_mesh.obj')}` +
    (existsSync(SIDE) ? `&sideObj=${encodeURIComponent('/work/yasuo_w_windwall_side_mesh.obj')}` : '') +
    `&tex=${encodeURIComponent(texRel)}&w=${FRAME_W}&h=${FRAME_H}`
  await page.goto(pageUrl, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.__yasuoWallFaceBake?.ready === true, null, { timeout: 120_000 })
  const dataUrl = await page.evaluate(() => window.__yasuoWallFaceBake.exportPng())
  await browser.close()
  server.close()
  const raw = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64')
  writeFileSync(OUT, await alphaFromLum(raw))
  console.log('Wrote', OUT)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
