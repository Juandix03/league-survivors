/**
 * Orthographic top-down spritesheet bake — Yasuo skin 0 (Khada GLB).
 * Usage: node render-sheet.mjs [hd|legacy]
 */
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { resolveProfile } from './bake-config.mjs'
import { buildChampionWalkRowSpecs } from '../shared/champion-walk8.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = __dirname
const WORK = join(ROOT, 'work')
const GLB = join(WORK, 'yasuo_skin0_khada.glb')
const PUBLIC_YASUO = resolve(ROOT, '../../public/assets/champions/yasuo')

const profile = resolveProfile(process.argv[2])
const FRAME_W = profile.frameWidth
const FRAME_H = profile.frameHeight
const COLS = profile.framesPerCycle ?? 4
const DIRECTION_MODE = profile.directionMode ?? 4
const padY = profile.framePadY ?? 0.58

/** Khada Yasuo skin0 — verify with `npm run inspect`. */
const CLIPS = {
  idle: 'Idle1_Raw',
  run: 'Run1_Raw',
}

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
          mjs: 'text/javascript',
          glb: 'model/gltf-binary',
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

function sampleTimes(duration, count) {
  if (duration <= 0) {
    return Array.from({ length: count }, () => 0)
  }
  const step = duration / count
  return Array.from({ length: count }, (_, i) =>
    Math.min(duration - 0.001, i * step + step * 0.12),
  )
}

async function main() {
  mkdirSync(WORK, { recursive: true })
  mkdirSync(PUBLIC_YASUO, { recursive: true })
  if (!existsSync(GLB)) {
    throw new Error(`Missing ${GLB}. Run: npm run download`)
  }

  console.log(
    `Profile: ${profile.key} (${DIRECTION_MODE}-dir) — ${FRAME_W}×${FRAME_H} px/frame, ${COLS} frames/row → ${profile.outputName}`,
  )

  const port = 8865 + Math.floor(Math.random() * 200)
  const server = await serveStatic(port)
  const pageUrl =
    `http://127.0.0.1:${port}/render-sheet.html` +
    `?glb=${encodeURIComponent('/work/yasuo_skin0_khada.glb')}` +
    `&fw=${FRAME_W}&fh=${FRAME_H}&fill=${profile.fill}&fpr=${COLS}&padY=${padY}`

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: FRAME_W, height: FRAME_H })
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.__jinxBake?.ready === true, null, {
    timeout: 120_000,
  })

  const clipDurations = await page.evaluate(() => window.__jinxBake.clipDurations)
  const idleClip = CLIPS.idle
  const runClip = CLIPS.run
  if (!clipDurations[idleClip] || !clipDurations[runClip]) {
    const names = await page.evaluate(() => window.__jinxBake.clipNames)
    console.error('Available clips:', names.filter((n) => /idle|run/i.test(n)).slice(0, 20))
    throw new Error(`Missing clips ${idleClip} or ${runClip}. Adjust CLIPS in render-sheet.mjs.`)
  }

  const idleTimes = sampleTimes(clipDurations[idleClip], COLS)
  const runTimes = sampleTimes(clipDurations[runClip], COLS)

  const rows = buildChampionWalkRowSpecs({
    directionMode: DIRECTION_MODE,
    idleClip,
    runClip,
    idleTimes,
    runTimes,
  })

  const poseSamples = []
  for (const spec of rows) {
    for (const timeSec of spec.times) {
      poseSamples.push({
        clipName: spec.clip,
        timeSec,
        rotationY: spec.rot,
      })
    }
  }

  console.log('Computing stable ortho from', poseSamples.length, 'poses…')
  const stableHalf = await page.evaluate(
    (samples) => window.__computeStableOrthoHalf(samples),
    poseSamples,
  )
  await page.evaluate((half) => window.__applyStableOrtho(half), stableHalf)
  console.log('Stable ortho half:', stableHalf.toFixed(4))

  const composites = []
  let index = 0
  const total = rows.length * COLS
  for (let row = 0; row < rows.length; row++) {
    const spec = rows[row]
    for (let col = 0; col < COLS; col++) {
      const dataUrl = await page.evaluate(
        ({ clipName, timeSec, rotationY }) =>
          window.__renderJinxFrame({ clipName, timeSec, rotationY }),
        {
          clipName: spec.clip,
          timeSec: spec.times[col],
          rotationY: spec.rot,
        },
      )
      if (!dataUrl) {
        throw new Error(`Failed frame ${spec.label}[${col}]`)
      }
      const b64 = dataUrl.replace(/^data:image\/png;base64,/, '')
      composites.push({
        input: Buffer.from(b64, 'base64'),
        left: col * FRAME_W,
        top: row * FRAME_H,
      })
      index++
      process.stdout.write(`\rFrame ${index}/${total} (${spec.label})`)
    }
  }
  console.log('\nCompositing PNG (lossless, no resize)…')

  const sheetW = COLS * FRAME_W
  const sheetH = rows.length * FRAME_H
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

  const outBuf = await sharp(base).composite(composites).png().toBuffer()

  const outWork = join(WORK, profile.outputName)
  writeFileSync(outWork, outBuf)
  console.log('Wrote:', outWork)

  if (profile.writeToPublic) {
    const outGame = join(PUBLIC_YASUO, profile.outputName)
    writeFileSync(outGame, outBuf)
    console.log('Wrote:', outGame)
  }

  console.log(`Sheet size: ${sheetW}×${sheetH}`)
  console.log(
    JSON.stringify({
      idleClip,
      runClip,
      idleDurationSec: clipDurations[idleClip],
      runDurationSec: clipDurations[runClip],
    }),
  )

  await browser.close()
  server.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
