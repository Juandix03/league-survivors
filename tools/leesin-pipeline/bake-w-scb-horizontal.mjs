/**
 * Yasuo W: mesh scb face-on + UV scroll → wide horizontal spritesheet (8×3).
 * In-game: one sprite stretched to wall span (no PNG tile seams).
 * Prereq: npm run yasuo:extract-wad && npm run yasuo:export-windwall-scb
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
const OUT = resolve(ROOT, '../../public/assets/champions/yasuo/w_wall_scb_horizontal_sheet.png')

const FRAME_W = 640
const FRAME_H = 168
const COLS = 8
const ROWS = [
  { label: 'down', rotY: Math.PI / 2 },
  { label: 'up', rotY: -Math.PI / 2 },
  { label: 'side', rotY: 0 },
]

const OBJ = join(WORK, 'yasuo_w_windwall_mesh.obj')
const SIDE = join(WORK, 'yasuo_w_windwall_side_mesh.obj')

function serveStatic(port) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const url = req.url?.split('?')[0] ?? '/'
      const rel = url === '/' ? '/bake-windwall-horizontal.html' : url
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

async function emissiveAlpha(pngBuffer) {
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

/** Recorta alpha vacío y estira el muro al frame completo (evita “wisp chico” al escalar). */
async function trimFillFrame(pngBuffer, targetW, targetH) {
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let minX = info.width
  let minY = info.height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const a = data[(y * info.width + x) * 4 + 3]
      if (a > 12) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  if (maxX <= minX) return pngBuffer
  const pad = 3
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(info.width - 1, maxX + pad)
  maxY = Math.min(info.height - 1, maxY + pad)
  return sharp(pngBuffer)
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .resize(targetW, targetH, { fit: 'fill' })
    .png()
    .toBuffer()
}

async function main() {
  if (!existsSync(OBJ)) {
    throw new Error('Missing mesh OBJ. Run: npm run yasuo:extract-wad && npm run yasuo:export-windwall-scb')
  }
  mkdirSync(dirname(OUT), { recursive: true })

  const texRel = '/assets/vfx/yasuo/spells/yasuo_w_windwall_main.png'
  const sideRel = existsSync(SIDE) ? encodeURIComponent('/work/yasuo_w_windwall_side_mesh.obj') : ''
  const port = 8935 + Math.floor(Math.random() * 15)
  const server = await serveStatic(port)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: FRAME_W, height: FRAME_H })

  const composites = []
  for (let row = 0; row < ROWS.length; row += 1) {
    const { label, rotY } = ROWS[row]
    const pageUrl =
      `http://127.0.0.1:${port}/bake-windwall-horizontal.html` +
      `?obj=${encodeURIComponent('/work/yasuo_w_windwall_mesh.obj')}` +
      (sideRel ? `&sideObj=${sideRel}` : '') +
      `&tex=${encodeURIComponent(texRel)}` +
      `&w=${FRAME_W}&h=${FRAME_H}&rotY=${rotY}`
    await page.goto(pageUrl, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => window.__yasuoWallHorizBake?.ready === true, null, { timeout: 120_000 })

    for (let col = 0; col < COLS; col += 1) {
      const uvOffset = col / COLS
      const dataUrl = await page.evaluate(
        (off) => window.__yasuoWallHorizBake.renderFrame(off),
        uvOffset,
      )
      const raw = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64')
      let frame = await emissiveAlpha(raw)
      frame = await trimFillFrame(frame, FRAME_W, FRAME_H)
      composites.push({ input: frame, left: col * FRAME_W, top: row * FRAME_H })
      process.stdout.write(`\rframe ${row * COLS + col + 1}/${ROWS.length * COLS} (${label})`)
    }
  }
  console.log()

  const sheetW = COLS * FRAME_W
  const sheetH = ROWS.length * FRAME_H
  const base = await sharp({
    create: { width: sheetW, height: sheetH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer()
  writeFileSync(OUT, await sharp(base).composite(composites).png().toBuffer())
  console.log('Wrote', OUT, `${sheetW}×${sheetH}`)

  await browser.close()
  server.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
