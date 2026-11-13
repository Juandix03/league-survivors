import './beastPreview.css'
import { createBeastPreviewGame } from './createBeastPreviewGame'

const parent = document.getElementById('game')
if (!parent) {
  throw new Error('#game missing')
}

const handle = createBeastPreviewGame(parent)

const btnBeast = document.getElementById('btn-beast')
const btnFlat = document.getElementById('btn-flat')
const modeLabel = document.getElementById('mode-label')

function syncUi() {
  const mode = handle.getTerrainMode()
  modeLabel!.textContent = mode === 'beast' ? 'Beast CC0 (16×16 ×4)' : 'Arena actual (verde plano)'
  btnBeast?.classList.toggle('active', mode === 'beast')
  btnFlat?.classList.toggle('active', mode === 'flat')
}

btnBeast?.addEventListener('click', () => {
  handle.setTerrainMode('beast')
  syncUi()
})
btnFlat?.addEventListener('click', () => {
  handle.setTerrainMode('flat')
  syncUi()
})

window.setTimeout(syncUi, 400)
