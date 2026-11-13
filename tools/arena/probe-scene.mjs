/**
 * Diagnóstico rápido: abre el juego y lee estado de Phaser expuesto en window.__LS_GAME__.
 */
import { chromium } from '../jinx-pipeline/node_modules/playwright/index.mjs'

const url = process.argv[2] || 'http://localhost:5173/'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
const logs = []
page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`))
page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`))

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(5000)

const probe = await page.evaluate(() => {
  const canvas = document.querySelector('.game-parent canvas')
  const game = window.__LS_GAME__
  if (!game) {
    return {
      error: 'no __LS_GAME__ on window',
      hasCanvas: !!canvas,
      canvasSize: canvas ? { w: canvas.width, h: canvas.height } : null,
      phaserType: typeof window.Phaser,
    }
  }
  const scene = game.scene.getScene('ArenaScene')
  if (!scene) {
    return { error: 'no ArenaScene' }
  }
  const cam = scene.cameras.main
  const list = scene.children.list.map((c) => ({
    type: c.type,
    depth: c.depth,
    visible: c.visible,
    alpha: c.alpha,
    x: Math.round(c.x),
    y: Math.round(c.y),
    sx: c.scrollFactorX,
    sy: c.scrollFactorY,
    w: c.width,
    h: c.height,
  }))
  const player = scene.player
  return {
    cam: { scrollX: cam.scrollX, scrollY: cam.scrollY, zoom: cam.zoom },
    childCount: list.length,
    byType: list.reduce((acc, o) => {
      acc[o.type] = (acc[o.type] || 0) + 1
      return acc
    }, {}),
    sample: list.slice(0, 12),
    player: player
      ? {
          x: player.x,
          y: player.y,
          depth: player.depth,
          visible: player.visible,
          alpha: player.alpha,
          texture: player.texture?.key,
        }
      : null,
    textures: {
      grassA: scene.textures.exists('arena-grass-tile-a'),
      grassB: scene.textures.exists('arena-grass-tile-b'),
      jinx: scene.textures.exists('jinx-spritesheet'),
    },
  }
})

console.log(JSON.stringify({ url, probe, logs: logs.slice(-15) }, null, 2))
await browser.close()
