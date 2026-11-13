/**
 * Orthographic top-down bake of Riot yasuo_w_windwall_mesh (+ optional side mesh).
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

const OBJ = join(WORK, 'yasuo_w_windwall_mesh.obj')
const TEX_CANDIDATES = [
  join(
    WORK,
    'yasuo-wad-extract/assets/characters/yasuo/skins/base/particles/yasuo_w_windwall_main.tex',
  ),
  join(
    WORK,
    'yasuo-wad-extract/assets/characters/yasuo/skins/base/particles/Color_yasuo_w_windwall_dust.tex',
  ),
  resolve(ROOT, '../../public/assets/vfx/yasuo/spells/yasuo_w_windwall_main.png'),
]

const OUT = join(PUBLIC_YASUO, 'w_wall_mesh_topdown.png')
const OUT_W = 640
const OUT_H = 320

function serveStatic(port) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const url = req.url?.split('?')[0] ?? '/'
      const rel = url === '/' ? '/bake-windwall-mesh.html' : url
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
          obj: 'text/plain',
          png: 'image/png',
          tex: 'application/octet-stream',
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

async function emissiveLuminanceAlpha(pngBuffer) {
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const out = Buffer.alloc(data.length)
  for (let i = 0; i < info.width * info.height; i += 1) {
    const o = i * 4
    const r = data[o]
    const g = data[o + 1]
    const b = data[o + 2]
    const lum = (r + g + b) / 3
    const a = lum > 14 ? Math.min(255, Math.floor(lum * 1.12)) : 0
    out[o] = r
    out[o + 1] = g
    out[o + 2] = b
    out[o + 3] = a
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
}

async function texToPngIfNeeded(texPath) {
  if (!existsSync(texPath)) return null
  if (texPath.endsWith('.png')) return texPath
  const out = join(WORK, 'windwall_bake_tex.png')
  await sharp(texPath).png().toFile(out)
  return out
}

async function main() {
  if (!existsSync(OBJ)) {
    throw new Error(`Missing ${OBJ} — run yasuo:extract-wad && yasuo:export-windwall-scb`)
  }
  let texPath = null
  for (const c of TEX_CANDIDATES) {
    const p = await texToPngIfNeeded(c)
    if (p) {
      texPath = p
      break
    }
  }
  if (!texPath) throw new Error('No wind wall texture found')

  mkdirSync(dirname(OUT), { recursive: true })

  const objRel = '/work/' + OBJ.split(/[/\\]/).pop()
  const texNorm = texPath.replace(/\\/g, '/')
  let texRel
  if (texNorm.includes('/public/assets/')) {
    texRel = '/assets/' + texNorm.split('/public/assets/')[1]
  } else {
    const baked = join(WORK, 'windwall_bake_tex_serve.png')
    await sharp(texPath).png().toFile(baked)
    texRel = '/work/windwall_bake_tex_serve.png'
  }

  const port = 8890 + Math.floor(Math.random() * 30)
  const server = await serveStatic(port)
  const sideObj = join(WORK, 'yasuo_w_windwall_side_mesh.obj')
  const sideRel = existsSync(sideObj) ? encodeURIComponent('/work/yasuo_w_windwall_side_mesh.obj') : ''
  const pageUrl =
    `http://127.0.0.1:${port}/bake-windwall-mesh.html` +
    `?obj=${encodeURIComponent(objRel)}` +
    (sideRel ? `&sideObj=${sideRel}` : '') +
    `&tex=${encodeURIComponent(texRel)}` +
    `&w=${OUT_W}&h=${OUT_H}&fill=0.92&rotY=${Math.PI / 2}`

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: OUT_W, height: OUT_H })
  await page.goto(pageUrl, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.__yasuoWallBake?.ready === true, null, { timeout: 120_000 })
  const dataUrl = await page.evaluate(() => window.__yasuoWallBake.exportPng())
  await browser.close()
  server.close()

  const raw = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64')
  const masked = await emissiveLuminanceAlpha(raw)
  writeFileSync(OUT, masked)
  const meta = await sharp(OUT).metadata()
  console.log('Wrote', OUT, meta.width, 'x', meta.height)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
