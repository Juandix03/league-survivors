import { fileURLToPath } from 'node:url'

const { chromium } = await import('../jinx-pipeline/node_modules/playwright/index.mjs')

const base = process.env.PREVIEW_URL ?? 'http://localhost:5173/beast-grass-preview.html'

const browser = await chromium.launch()
const page = await browser.newPage()
const consoleErrors = []

page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text())
  }
})
page.on('pageerror', (err) => {
  consoleErrors.push(String(err))
})

const res = await page.goto(base, { waitUntil: 'networkidle', timeout: 60_000 })
if (!res?.ok()) {
  console.error('HTTP', res?.status(), base)
  process.exit(1)
}

await page.waitForTimeout(2500)
await page.click('#btn-flat')
await page.waitForTimeout(800)
await page.click('#btn-beast')
await page.waitForTimeout(800)

const shot = fileURLToPath(
  new URL('../../public/assets/arena/beast-preview/verify-screenshot.png', import.meta.url),
)
await page.screenshot({ path: shot, fullPage: false })

await browser.close()

if (consoleErrors.length) {
  console.error('Console errors:', consoleErrors)
  process.exit(1)
}

console.log('OK beast preview', base)
