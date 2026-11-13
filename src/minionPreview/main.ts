import '../beastPreview/beastPreview.css'
import { createMinionPreviewGame } from './createMinionPreviewGame'
import { RIOT_MINION_CDN_TEXTURES } from './minionPreviewConstants'
import type { MinionPreviewArtMode } from './minionPreviewArtMode'
import type { BakedAnimRow } from './bakedMinionAssets'

const parent = document.getElementById('game')
if (!parent) {
  throw new Error('#game missing')
}

const handle = createMinionPreviewGame(parent)
const modeLabel = document.getElementById('mode-label')
const bakedToolbar = document.getElementById('baked-toolbar')
const bakedNote = document.getElementById('baked-sheet-note')

const artButtons: { id: string; mode: MinionPreviewArtMode }[] = [
  { id: 'btn-art-baked', mode: 'baked' },
  { id: 'btn-art-riot', mode: 'riot' },
  { id: 'btn-art-inspired', mode: 'inspired' },
]

const bakedAnimButtons: { id: string; row: BakedAnimRow; label: string }[] = [
  { id: 'btn-baked-idle', row: 'idle', label: 'Idle (fila 1)' },
  { id: 'btn-baked-walk-down', row: 'walkDown', label: 'Movimiento ↓ (fila 2)' },
  { id: 'btn-baked-walk-up', row: 'walkUp', label: 'Movimiento ↑ (fila 3)' },
  { id: 'btn-baked-walk-side', row: 'walkSide', label: 'Movimiento → (fila 4)' },
]

function syncBakedAnimButtons() {
  const row = handle.getBakedAnimRow()
  for (const b of bakedAnimButtons) {
    document.getElementById(b.id)?.classList.toggle('active', b.row === row)
  }
}

function syncUi() {
  const mode = handle.getArtMode()
  const labels: Record<MinionPreviewArtMode, string> = {
    baked: `Bake cenital — 8 minions SR (${handle.getBakedSheetCount()}/8 hojas cargadas)`,
    riot: 'Riot — iconos square HUD 128² (cliente LoL)',
    inspired: 'Inspired — placeholders propios del repo',
  }
  modeLabel!.textContent = labels[mode]
  for (const b of artButtons) {
    document.getElementById(b.id)?.classList.toggle('active', b.mode === mode)
  }
  bakedToolbar?.classList.toggle('hidden', mode !== 'baked')
  bakedNote?.classList.toggle('hidden', mode !== 'baked')
  if (mode === 'baked') {
    syncBakedAnimButtons()
  }
}

for (const b of artButtons) {
  document.getElementById(b.id)?.addEventListener('click', () => {
    handle.setArtMode(b.mode)
    const url = new URL(window.location.href)
    url.searchParams.set('minionArt', b.mode)
    window.history.replaceState({}, '', url)
    window.setTimeout(syncUi, 200)
  })
}

for (const b of bakedAnimButtons) {
  document.getElementById(b.id)?.addEventListener('click', () => {
    handle.setBakedAnimRow(b.row)
    syncBakedAnimButtons()
  })
}

const gallery = document.getElementById('riot-gallery')
const galleryGrid = document.getElementById('riot-gallery-grid')
const btnGallery = document.getElementById('btn-riot-gallery')
const btnHideGallery = document.getElementById('btn-hide-gallery')
let galleryLoaded = false

function setGalleryVisible(show: boolean) {
  gallery?.classList.toggle('hidden', !show)
}

async function loadRiotGallery() {
  if (!galleryGrid || galleryLoaded) {
    return
  }
  galleryLoaded = true
  galleryGrid.replaceChildren()

  for (const entry of RIOT_MINION_CDN_TEXTURES) {
    const card = document.createElement('figure')
    card.className = 'riot-card'
    const cap = document.createElement('figcaption')
    cap.textContent = `${entry.label} (atlas 3D diffuse)`
    const img = document.createElement('img')
    img.alt = entry.label
    img.loading = 'lazy'
    img.src = entry.url
    card.append(cap, img)
    galleryGrid.append(card)
  }
}

btnGallery?.addEventListener('click', async () => {
  await loadRiotGallery()
  setGalleryVisible(true)
})

btnHideGallery?.addEventListener('click', () => setGalleryVisible(false))

window.setTimeout(syncUi, 400)
