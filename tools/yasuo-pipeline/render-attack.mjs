/**
 * Bake Attack1 (side) — one-shot melee anim for in-game slash.
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
const CLIP = 'Attack1'
const ROT = Math.PI / 2
const FILL = 0.74
const PAD_Y = 0.58
/** Sample the wind-up → slash portion of Attack1 (~1.67s clip). */
const SAMPLE_START = 0.12
const SAMPLE_END = 0.58

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
        const types = {
          html: 'text/html',
          js: 'text/javascript',
          glb: 'model/gltf-binary',
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

async function main() {
  mkdirSync(WORK, { recursive: true })
  mkdirSync(PUBLIC_YASUO, { recursive: true })
  if (!existsSync(GLB)) {
    throw new Error(`Missing ${GLB}. Run: npm run download`)
  }

  const port = 8965 + Math.floor(Math.random() * 100)
  const server = await serveStatic(port)
  const pageUrl =
    `http://127.0.0.1:${port}/render-sheet.html` +
    `?glb=${encodeURIComponent('/work/yasuo_skin0_khada.glb')}` +
    `&fw=${FRAME_W}&fh=${FRAME_H}&fill=${FILL}&fpr=${COLS}&padY=${PAD_Y}`

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: FRAME_W, height: FRAME_H })
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.__jinxBake?.ready === true, null, {
    timeout: 120_000,
  })

  const clipDurations = await page.evaluate(() => window.__jinxBake.clipDurations)
  const duration = clipDurations[CLIP]
  if (!duration) {
    const names = await page.evaluate(() => window.__jinxBake.clipNames)
    throw new Error(`Missing ${CLIP}. Clips: ${names.filter((n) => /attack/i.test(n)).join(', ')}`)
  }

  const times = Array.from({ length: COLS }, (_, i) => {
    const t = SAMPLE_START + ((SAMPLE_END - SAMPLE_START) * i) / (COLS - 1)
    return Math.min(duration - 0.001, t)
  })

  const poseSamples = times.map((timeSec) => ({
    clipName: CLIP,
    timeSec,
    rotationY: ROT,
  }))

  const stableHalf = await page.evaluate(
    (samples) => window.__computeStableOrthoHalf(samples),
    poseSamples,
  )
  await page.evaluate((half) => window.__applyStableOrtho(half), stableHalf)

  const composites = []
  for (let col = 0; col < COLS; col += 1) {
    const dataUrl = await page.evaluate(
      ({ clipName, timeSec, rotationY }) =>
        window.__renderJinxFrame({ clipName, timeSec, rotationY }),
      poseSamples[col],
    )
    const b64 = dataUrl.replace(/^data:image\/png;base64,/, '')
    composites.push({
      input: Buffer.from(b64, 'base64'),
      left: col * FRAME_W,
      top: 0,
    })
    process.stdout.write(`\rAttack frame ${col + 1}/${COLS}`)
  }
  console.log('\nCompositing…')

  const sheetW = COLS * FRAME_W
  const base = await sharp({
    create: {
      width: sheetW,
      height: FRAME_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer()

  const outBuf = await sharp(base).composite(composites).png().toBuffer()
  const outPublic = join(PUBLIC_YASUO, 'attack_sheet_hd.png')
  writeFileSync(outPublic, outBuf)
  console.log('Wrote:', outPublic)
  console.log(
    JSON.stringify({
      clip: CLIP,
      clipDurationSec: duration,
      sampleStart: SAMPLE_START,
      sampleEnd: SAMPLE_END,
      frames: COLS,
    }),
  )

  await browser.close()
  server.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
