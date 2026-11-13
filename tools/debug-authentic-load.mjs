import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:5173/?jinxSheet=authentic-hd'
const browser = await chromium.launch()
const page = await browser.newPage()
const logs = []
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => logs.push(`[fail] ${r.url()} ${r.failure()?.errorText}`))
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(3000)
const info = await page.evaluate(() => {
  const canvas = document.querySelector('canvas')
  if (!canvas) return { noCanvas: true }
  const ctx = canvas.getContext('2d')
  if (!ctx) return { no2d: true, w: canvas.width, h: canvas.height }
  const w = canvas.width
  const h = canvas.height
  const d = ctx.getImageData(w / 2, h / 2, 1, 1).data
  const d2 = ctx.getImageData(10, 10, 1, 1).data
  return {
    w,
    h,
    center: [...d],
    corner: [...d2],
  }
})
console.log('URL', url)
console.log('Canvas', info)
console.log('Logs:', logs.join('\n'))
await browser.close()
