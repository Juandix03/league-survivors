/**
 * Bake Spell1–4 (Q/W/E/R) — down / up / side.
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
const GLB = join(WORK, 'ezreal_skin0_khada.glb')
const PUBLIC = resolve(ROOT, '../../public/assets/champions/ezreal')

const FRAME_W = 256
const FRAME_H = 256
const COLS = 6
const FILL = 0.72
const PAD_Y = 0.58

/** Clips de cast Ezreal (Khada): Spell3 = Arcane Shift exit. */
const SPELL_CLIPS = ['Spell1_To_Run', 'Spell2_To_Run', 'Spell3_Exit_Run', 'Spell4_To_Run']

const ROWS = [
  { label: 'down', rot: 0 },
  { label: 'up', rot: Math.PI },
  { label: 'side', rot: Math.PI / 2 },
]

function sampleTimes(duration, clipName) {
  let start = 0.08
  let end = Math.min(0.78, duration * 0.85)
  if (clipName.includes('Spell4')) {
    start = 0.02
    end = Math.min(duration * 0.92, duration - 0.04)
  }
  if (clipName.includes('Spell1')) {
    start = 0.12
    end = Math.min(duration * 0.88, 0.95)
  }
  if (clipName.includes('Spell3')) {
    start = 0.1
    end = Math.min(duration * 0.82, 0.88)
  }
  return Array.from({ length: COLS }, (_, i) => {
    const t = start + ((end - start) * i) / (COLS - 1)
    return Math.min(duration - 0.001, t)
  })
}

function serveStatic(port) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const url = req.url?.split('?')[0] ?? '/'
      const rel = url === '/' ? '/render-sheet.html' : url
      const safe = rel.replace(/^\//, '').replace(/\.\./g, '')
      let filePath = join(ROOT, safe)
      if (safe.startsWith('work/')) {
        filePath = join(WORK, safe.slice('work/'.length))
      }
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

  const times = sampleTimes(duration, clipName)

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

  const slot = clipName.includes('Spell4')
    ? 'spell4'
    : clipName.includes('Spell3')
      ? 'spell3'
      : clipName.includes('Spell2')
        ? 'spell2'
        : 'spell1'
  const outName = `${slot}_sheet_hd.png`
  writeFileSync(join(PUBLIC, outName), await sharp(base).composite(composites).png().toBuffer())
  console.log('Wrote:', join(PUBLIC, outName), `${sheetW}×${sheetH}`)
}

async function main() {
  mkdirSync(WORK, { recursive: true })
  mkdirSync(PUBLIC, { recursive: true })
  if (!existsSync(GLB)) {
    throw new Error(`Missing ${GLB}. Run: npm run download`)
  }

  const port = 8875 + Math.floor(Math.random() * 100)
  const server = await serveStatic(port)
  const pageUrl =
    `http://127.0.0.1:${port}/render-sheet.html` +
    `?glb=${encodeURIComponent('/work/ezreal_skin0_khada.glb')}` +
    `&fw=${FRAME_W}&fh=${FRAME_H}&fill=${FILL}&fpr=${COLS}&padY=${PAD_Y}`

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: FRAME_W, height: FRAME_H })
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.__jinxBake?.ready === true, null, {
    timeout: 120_000,
  })

  for (const clip of SPELL_CLIPS) {
    await renderClip(page, clip)
  }

  await browser.close()
  server.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
