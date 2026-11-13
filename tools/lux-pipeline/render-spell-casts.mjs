/**
 * Bake Spell1–4 (Q/W/E/R) — down / up / side, como yasuo Q.
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
const GLB = join(WORK, 'lux_skin0_khada.glb')
const PUBLIC_LUX = resolve(ROOT, '../../public/assets/champions/lux')

const FRAME_W = 256
const FRAME_H = 256
const COLS = 6
const FILL = 0.72
const PAD_Y = 0.58
const SAMPLE_START = 0.08
const SAMPLE_END = 0.78

const SPELL_CLIPS = ['Spell1', 'Spell2', 'Spell3', 'Spell4']

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

async function renderClip(page, clipName) {
  const clipDurations = await page.evaluate(() => window.__jinxBake.clipDurations)
  const duration = clipDurations[clipName]
  if (!duration) {
    throw new Error(`Missing clip ${clipName}`)
  }

  const times = Array.from({ length: COLS }, (_, i) => {
    const t = SAMPLE_START + ((SAMPLE_END - SAMPLE_START) * i) / (COLS - 1)
    return Math.min(duration - 0.001, t)
  })

  const poseSamples = []
  for (const row of ROWS) {
    for (const timeSec of times) {
      poseSamples.push({ clipName, timeSec, rotationY: row.rot })
    }
  }

  const stableHalf = await page.evaluate(
    (samples) => window.__computeStableOrthoHalf(samples),
    poseSamples,
  )
  await page.evaluate((half) => window.__applyStableOrtho(half), stableHalf)

  const composites = []
  let frameIndex = 0
  const total = ROWS.length * COLS
  for (let row = 0; row < ROWS.length; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const sample = poseSamples[row * COLS + col]
      const dataUrl = await page.evaluate(
        ({ clipName: c, timeSec, rotationY }) =>
          window.__renderJinxFrame({ clipName: c, timeSec, rotationY }),
        sample,
      )
      const b64 = dataUrl.replace(/^data:image\/png;base64,/, '')
      composites.push({
        input: Buffer.from(b64, 'base64'),
        left: col * FRAME_W,
        top: row * FRAME_H,
      })
      frameIndex += 1
      process.stdout.write(`\r${clipName} ${frameIndex}/${total}`)
    }
  }
  console.log('')

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

  const outName = `${clipName.toLowerCase()}_sheet_hd.png`
  const outPublic = join(PUBLIC_LUX, outName)
  writeFileSync(outPublic, await sharp(base).composite(composites).png().toBuffer())
  console.log('Wrote:', outPublic, `${sheetW}×${sheetH}`)
}

async function main() {
  mkdirSync(WORK, { recursive: true })
  mkdirSync(PUBLIC_LUX, { recursive: true })
  if (!existsSync(GLB)) {
    throw new Error(`Missing ${GLB}. Run: npm run download`)
  }

  const only = process.argv[2]
  const clips = only ? [only] : [...SPELL_CLIPS]

  const port = 8785 + Math.floor(Math.random() * 100)
  const server = await serveStatic(port)
  const pageUrl =
    `http://127.0.0.1:${port}/render-sheet.html` +
    `?glb=${encodeURIComponent('/work/lux_skin0_khada.glb')}` +
    `&fw=${FRAME_W}&fh=${FRAME_H}&fill=${FILL}&fpr=${COLS}&padY=${PAD_Y}`

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: FRAME_W, height: FRAME_H })
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.__jinxBake?.ready === true, null, {
    timeout: 120_000,
  })

  for (const clip of clips) {
    await renderClip(page, clip)
  }

  await browser.close()
  server.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
