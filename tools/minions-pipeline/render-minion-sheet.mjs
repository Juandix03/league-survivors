/**
 * Bake cenital de minion GLB → PNG preview (no toca ArenaScene).
 * Uso: node render-minion-sheet.mjs [alias]   (default order-melee)
 */
import { createServer } from 'node:http'
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { resolveMinionAlias } from './minion-config.mjs'
import { buildMinionWalkRowSpecs } from '../shared/champion-walk8.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = __dirname
const PUBLIC_OUT = resolve(ROOT, '../../public/assets/minions-preview/baked')

const FRAME_W = 64
const FRAME_H = 64
const COLS = 4
/** 4 filas base; +1 fila attack si el alias define `clips.attack`. */

function findGlbSync(aliasKey) {
  const base = join(ROOT, 'work', 'extract', aliasKey)
  const flat = join(ROOT, 'work', 'glb', `${aliasKey}.glb`)
  if (existsSync(flat)) {
    return flat
  }
  if (!existsSync(base)) {
    return null
  }
  const stack = [base]
  while (stack.length) {
    const dir = stack.pop()
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) {
        stack.push(p)
      } else if (name === 'model.glb') {
        return p
      }
    }
  }
  return null
}

function serveStatic(port, glbAbsPath) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const url = req.url?.split('?')[0] ?? '/'
      if (url === '/model.glb') {
        const data = readFileSync(glbAbsPath)
        res.writeHead(200, { 'Content-Type': 'model/gltf-binary' })
        res.end(data)
        return
      }
      const rel = url === '/' ? '/render-sheet.html' : url
      const safe = rel.replace(/^\//, '').replace(/\.\./g, '')
      const filePath = join(ROOT, safe)
      try {
        const data = readFileSync(filePath)
        const ext = filePath.split('.').pop()?.toLowerCase()
        const types = { html: 'text/html', js: 'text/javascript', mjs: 'text/javascript' }
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

function pickIdleClip(names, want) {
  const exact = names.find((n) => n === want)
  if (exact) return exact
  const re = new RegExp(want.replace(/_/g, '[_ ]?'), 'i')
  const fuzzy = names.find((n) => re.test(n))
  if (fuzzy) return fuzzy
  return (
    names.find((n) => /^idle/i.test(n) && !/attack/i.test(n)) ??
    names.find((n) => /idle/i.test(n)) ??
    names[0]
  )
}

function pickAttackClip(names, want) {
  const exact = names.find((n) => n === want)
  if (exact) return exact
  const re = new RegExp(want.replace(/_/g, '[_ ]?'), 'i')
  const fuzzy = names.find((n) => re.test(n))
  if (fuzzy) return fuzzy
  return (
    names.find((n) => /^attack1/i.test(n)) ??
    names.find((n) => /attack1/i.test(n)) ??
    names.find((n) => /attack/i.test(n))
  )
}

function pickRunClip(names, want) {
  const exact = names.find((n) => n === want)
  if (exact) return exact
  const re = new RegExp(want.replace(/_/g, '[_ ]?'), 'i')
  const fuzzy = names.find((n) => re.test(n) && !/attack/i.test(n))
  if (fuzzy) return fuzzy
  const plainRun = names.find((n) => /^run$/i.test(n))
  if (plainRun) return plainRun
  return (
    names.find((n) => /run/i.test(n) && !/attack/i.test(n)) ??
    names.find((n) => /^run[_ ]/i.test(n)) ??
    pickIdleClip(names, want)
  )
}

async function pickClips(page, preferred) {
  const names = await page.evaluate(() => window.__jinxBake?.clipNames ?? [])
  const out = {
    idle: pickIdleClip(names, preferred.idle),
    run: pickRunClip(names, preferred.run),
    attack: preferred.attack ? pickAttackClip(names, preferred.attack) : null,
    names,
  }
  return out
}

async function main() {
  const directionMode = process.argv.includes('--8dir') ? 8 : 4
  const { key, clips, label } = resolveMinionAlias(process.argv[2])
  const glbPath = findGlbSync(key)
  if (!glbPath) {
    console.error(`No hay model.glb para "${key}" (${label}).`)
    console.error(
      'Corré npm run minions:download-glb --',
      key,
      'o npm run minions:extract --',
      key,
      'o copiá GLB a work/glb/',
      `${key}.glb`,
    )
    process.exit(1)
  }

  mkdirSync(PUBLIC_OUT, { recursive: true })
  const outName = `${key}.png`
  const outPublic = join(PUBLIC_OUT, outName)

  console.log('GLB:', glbPath)
  console.log('Salida:', outPublic, `(${directionMode}-dir)`)

  const port = 8775 + Math.floor(Math.random() * 200)
  const server = await serveStatic(port, glbPath)
  const pageUrl =
    `http://127.0.0.1:${port}/render-sheet.html?glb=${encodeURIComponent('/model.glb')}` +
    `&fw=${FRAME_W}&fh=${FRAME_H}&fill=0.82&fpr=${COLS}`

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: FRAME_W, height: FRAME_H })
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.__jinxBake?.ready === true, null, { timeout: 120_000 })

  const picked = await pickClips(page, clips)
  console.log(
    'Clips:',
    picked.idle,
    '/',
    picked.run,
    picked.attack ? `/ ${picked.attack}` : '',
  )
  if (picked.names.length < 2) {
    console.warn('Pocos clips en GLB — revisá con npm run minions:inspect')
  }

  const clipDurations = await page.evaluate(() => window.__jinxBake.clipDurations)
  const idleTimes = sampleTimes(clipDurations[picked.idle] ?? 1.2, COLS)
  const runTimes = sampleTimes(clipDurations[picked.run] ?? 0.9, COLS)

  let attackTimes = null
  if (picked.attack) {
    const attackDur = clipDurations[picked.attack] ?? 0.85
    attackTimes = sampleTimes(attackDur, COLS)
  }

  const rows = buildMinionWalkRowSpecs({
    directionMode,
    idleClip: picked.idle,
    runClip: picked.run,
    idleTimes,
    runTimes,
    attackClip: picked.attack,
    attackTimes,
  })

  const poseSamples = []
  for (const spec of rows) {
    for (const timeSec of spec.times) {
      poseSamples.push({ clipName: spec.clip, timeSec, rotationY: spec.rot })
    }
  }

  const stableHalf = await page.evaluate(
    (samples) => window.__computeStableOrthoHalf(samples),
    poseSamples,
  )
  await page.evaluate((half) => window.__applyStableOrtho(half), stableHalf)

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
        throw new Error(`Frame falló ${spec.label}[${col}]`)
      }
      const b64 = dataUrl.replace(/^data:image\/png;base64,/, '')
      composites.push({
        input: Buffer.from(b64, 'base64'),
        left: col * FRAME_W,
        top: row * FRAME_H,
      })
      index++
      process.stdout.write(`\rFrame ${index}/${total}`)
    }
  }
  console.log('\nCompositing…')

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
  writeFileSync(outPublic, outBuf)
  writeFileSync(join(ROOT, 'work', outName), outBuf)

  await browser.close()
  server.close()
  console.log('OK', outPublic)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
