/**
 * Orthographic bake: SCB→OBJ + Riot UV texture → PNG sprite (Playwright + Three).
 *
 * Usage:
 *   node bake-mesh-sprite.mjs --obj work/ahri_base_q_sphere_01.obj \
 *     --tex ../../public/assets/vfx/ahri/spells/ahri_base_q_orbbackground.png \
 *     --out ../../public/assets/vfx/ahri/q-projectile/ahri_q_orb_sprite.png
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

function arg(name, fallback) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : fallback
}

const OBJ = resolve(__dirname, arg('--obj', 'work/ahri_base_q_sphere_01.obj'))
const TEX = resolve(__dirname, arg('--tex', '../../public/assets/vfx/ahri/spells/ahri_base_q_orbbackground.png'))
const OUT = resolve(__dirname, arg('--out', '../../public/assets/vfx/ahri/q-projectile/ahri_q_orb_sprite.png'))
const OUT_W = Number(arg('--w', '512'))
const OUT_H = Number(arg('--h', '512'))
const ROT_Y = Number(arg('--rotY', '0'))
const FILL = Number(arg('--fill', '0.82'))
const CAM = arg('--cam', 'top')
const NO_TRIM = arg('--noTrim', '0') === '1'

function serveStatic(port) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const url = req.url?.split('?')[0] ?? '/'
      const rel = url === '/' ? '/bake-mesh.html' : url
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

/** Black → transparent; keeps emissive VFX masks usable as ADD sprites. */
async function emissiveLuminanceAlpha(pngBuffer) {
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const out = Buffer.alloc(data.length)
  for (let i = 0; i < info.width * info.height; i += 1) {
    const o = i * 4
    const r = data[o]
    const g = data[o + 1]
    const b = data[o + 2]
    const lum = (r + g + b) / 3
    const a = lum > 10 ? Math.min(255, Math.floor(lum * 1.45)) : 0
    out[o] = r
    out[o + 1] = g
    out[o + 2] = b
    out[o + 3] = a
  }
  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()
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
      if (a > 8) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  if (maxX <= minX) return pngBuffer
  const pad = 6
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(info.width - 1, maxX + pad)
  maxY = Math.min(info.height - 1, maxY + pad)
  return sharp(pngBuffer)
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toBuffer()
}

async function main() {
  if (!existsSync(OBJ)) throw new Error(`Missing OBJ: ${OBJ}`)
  if (!existsSync(TEX)) throw new Error(`Missing texture: ${TEX}`)

  mkdirSync(dirname(OUT), { recursive: true })

  const objRel = '/work/' + OBJ.split(/[/\\]/).pop()
  const texNorm = TEX.replace(/\\/g, '/')
  const assetsIdx = texNorm.indexOf('/public/assets/')
  if (assetsIdx < 0) throw new Error(`Texture must live under public/assets: ${TEX}`)
  const texRel = '/assets/' + texNorm.slice(assetsIdx + '/public/assets/'.length)

  const port = 8870 + Math.floor(Math.random() * 40)
  const server = await serveStatic(port)
  const pageUrl =
    `http://127.0.0.1:${port}/bake-mesh.html` +
    `?obj=${encodeURIComponent(objRel)}` +
    `&tex=${encodeURIComponent(texRel)}` +
    `&w=${OUT_W}&h=${OUT_H}&rotY=${ROT_Y}&fill=${FILL}&cam=${encodeURIComponent(CAM)}`

  const browser = await chromium.launch()
  const page = await browser.newPage()
  page.on('pageerror', (err) => console.error('pageerror', err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('console', msg.text())
  })
  await page.setViewportSize({ width: OUT_W, height: OUT_H })
  console.log('Bake URL', pageUrl)
  await page.goto(pageUrl, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.__ahriMeshBake?.ready === true, null, {
    timeout: 120_000,
  })
  const dataUrl = await page.evaluate(() => window.__ahriMeshBake.exportPng())
  await browser.close()
  server.close()

  const raw = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64')
  const masked = await emissiveLuminanceAlpha(raw)
  const finalBuf = NO_TRIM ? masked : await trimTransparentBounds(masked)
  writeFileSync(OUT, await sharp(finalBuf).ensureAlpha().png().toBuffer())
  const meta = await sharp(OUT).metadata()
  console.log(`Wrote ${OUT} (${meta.width}x${meta.height})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
