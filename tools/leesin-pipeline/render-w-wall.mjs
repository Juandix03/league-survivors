/**
 * Bake Spell2_0 (Wind Wall) — down / up / side for in-world wall sprite.
 * NOTE: Khada Yasuo GLB has no separate wind-wall mesh; Spell2 is a full-body cast.
 * In-game W uses Community Dragon particle textures instead (see yasuoSpellVisuals).
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
const GLB = join(WORK, 'yasuo_skin0_khada.glb')
const PUBLIC_YASUO = resolve(ROOT, '../../public/assets/champions/yasuo')

const FRAME_W = 256
const FRAME_H = 256
const COLS = 6
const CLIP = 'Spell2_0'
const FILL = 0.68
const PAD_Y = 0.52
/** Skip cast wind-up — sample when the wall mesh is up. */
const SAMPLE_START = 0.38
const SAMPLE_END = 0.92

const ROWS = [
  { label: 'down', rot: 0 },
  { label: 'up', rot: Math.PI },
  { label: 'side', rot: Math.PI / 2 },
]

function serveStatic(port) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const url = req.url?.split('?')[0] ?? '/'
      const rel = url === '/' ? '/render-sheet.html' : url
      const safe = rel.replace(/^\//, '').replace(/\.\./g, '')
      const filePath = join(ROOT, safe)
      try {
        const data = readFileSync(filePath)
        const ext = filePath.split('.').pop()?.toLowerCase()
        const types = { html: 'text/html', glb: 'model/gltf-binary' }
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

async function main() {
  mkdirSync(WORK, { recursive: true })
  mkdirSync(PUBLIC_YASUO, { recursive: true })
  if (!existsSync(GLB)) {
    throw new Error(`Missing ${GLB}. Run: npm run download`)
  }

  const port = 8985 + Math.floor(Math.random() * 100)
  const server = await serveStatic(port)
  const pageUrl =
    `http://127.0.0.1:${port}/render-sheet.html` +
    `?glb=${encodeURIComponent('/work/yasuo_skin0_khada.glb')}` +
    `&fw=${FRAME_W}&fh=${FRAME_H}&fill=${FILL}&fpr=${COLS}&padY=${PAD_Y}&hideSkin=1`

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: FRAME_W, height: FRAME_H })
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.__jinxBake?.ready === true, null, {
    timeout: 120_000,
  })

  const clipDurations = await page.evaluate(() => window.__jinxBake.clipDurations)
  let clip = CLIP
  let duration = clipDurations[clip]
  if (!duration) {
    const fallback = Object.keys(clipDurations).find((n) => /^Spell2_0$/i.test(n) || n === 'Spell2_BASE')
    if (fallback) {
      clip = fallback
      duration = clipDurations[fallback]
    }
  }
  if (!duration) {
    const names = await page.evaluate(() => window.__jinxBake.clipNames)
    throw new Error(`Missing Spell2 clip. Have: ${names.filter((n) => /spell2/i.test(n)).join(', ')}`)
  }

  const times = Array.from({ length: COLS }, (_, i) => {
    const t = SAMPLE_START + ((SAMPLE_END - SAMPLE_START) * i) / (COLS - 1)
    return Math.min(duration - 0.001, t)
  })

  const poseSamples = []
  for (const row of ROWS) {
    for (const timeSec of times) {
      poseSamples.push({ clipName: clip, timeSec, rotationY: row.rot })
    }
  }

  const stableHalf = await page.evaluate(
    (samples) => window.__computeStableOrthoHalf(samples),
    poseSamples,
  )
  await page.evaluate((half) => window.__applyStableOrtho(half), stableHalf)

  const composites = []
  let idx = 0
  const total = ROWS.length * COLS
  for (let row = 0; row < ROWS.length; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const sample = poseSamples[row * COLS + col]
      const dataUrl = await page.evaluate(
        ({ clipName, timeSec, rotationY }) =>
          window.__renderJinxFrame({ clipName, timeSec, rotationY }),
        sample,
      )
      const b64 = dataUrl.replace(/^data:image\/png;base64,/, '')
      composites.push({ input: Buffer.from(b64, 'base64'), left: col * FRAME_W, top: row * FRAME_H })
      idx += 1
      process.stdout.write(`\rW wall ${idx}/${total} (${ROWS[row].label})`)
    }
  }
  console.log('\nCompositing…')

  const sheetW = COLS * FRAME_W
  const sheetH = ROWS.length * FRAME_H
  const base = await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer()

  const outPublic = join(PUBLIC_YASUO, 'w_wall_sheet_hd.png')
  writeFileSync(outPublic, await sharp(base).composite(composites).png().toBuffer())
  console.log('Wrote:', outPublic, `${sheetW}×${sheetH}`, 'clip:', clip)

  await browser.close()
  server.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
