import '../beastPreview/beastPreview.css'
import { createMeadowPreviewGame } from './createMeadowPreviewGame'
import type { MeadowGroundMode } from './meadowPreviewConstants'

const parent = document.getElementById('game')
if (!parent) {
  throw new Error('#game missing')
}

const handle = createMeadowPreviewGame(parent)
const modeLabel = document.getElementById('mode-label')

const buttons: { id: string; mode: MeadowGroundMode }[] = [
  { id: 'btn-procedural', mode: 'procedural' },
  { id: 'btn-painted', mode: 'painted' },
  { id: 'btn-flat', mode: 'flat' },
]

function syncUi() {
  const mode = handle.getGroundMode()
  const labels: Record<MeadowGroundMode, string> = {
    procedural: 'Pasto procedural (bake interno, 2 capas)',
    painted: 'Pasto CC0 hand-painted (PamNawi, 2 capas)',
    flat: 'Arena actual — verde plano',
  }
  modeLabel!.textContent = labels[mode]
  for (const b of buttons) {
    document.getElementById(b.id)?.classList.toggle('active', b.mode === mode)
  }
}

for (const b of buttons) {
  document.getElementById(b.id)?.addEventListener('click', () => {
    handle.setGroundMode(b.mode)
    syncUi()
  })
}

window.setTimeout(syncUi, 400)
