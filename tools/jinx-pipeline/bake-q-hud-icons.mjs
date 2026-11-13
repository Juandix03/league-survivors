/**
 * Iconos HUD de Jinx Q (Pow-Pow / Fishbones).
 * Fuentes: LoL Wiki HD → Community Dragon → recorte de referencia.
 *
 * Wiki (CC BY-SA 3.0): https://wiki.leagueoflegends.com/en-us/Category:High_definition_Jinx_ability_icons
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const HUD_OUT = join(__dirname, '../../public/assets/hud/jinx')
const REF = join(__dirname, 'reference/jinx-q-toggle-ref.jpg')

const WIKI_FILE = 'https://wiki.leagueoflegends.com/en-us/Special:FilePath/'

/** Archivos en disco conservan nombres históricos; el runtime mapea por arma en jinxSpellVfxConfig. */
const WIKI_Q = [
  { wiki: 'Jinx_Pow-Pow_HD.png', file: 'JinxQPowPow.png' },
  { wiki: 'Jinx_Switcheroo!_HD.png', file: 'JinxQFishbones.png' },
]

/** Pow-Pow / Fishbones — raw.communitydragon.org/{patch}/game/.../icons2d/ */
const CDRAGON_PATCHES = ['15.24', '15.19', '15.14', '15.1']

const CDRAGON_Q_FILES = [
  { remote: 'jinx_q1.png', file: 'JinxQPowPow.png' },
  { remote: 'jinx_q2.png', file: 'JinxQFishbones.png' },
]

function cdragonHudUrl(patch, remote) {
  return `https://raw.communitydragon.org/${patch}/game/assets/characters/jinx/hud/icons2d/${remote}`
}

async function saveResizedPng(buffer, dest) {
  mkdirSync(dirname(dest), { recursive: true })
  await sharp(buffer).resize(64, 64).png().toFile(dest)
  return true
}

async function tryDownload(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'league-survivors/1.0' },
    redirect: 'follow',
  })
  if (!res.ok) return false
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length < 200) return false
  return saveResizedPng(buffer, dest)
}

async function downloadQFromWiki() {
  let fetched = 0
  for (const { wiki, file } of WIKI_Q) {
    const dest = join(HUD_OUT, file)
    const url = WIKI_FILE + encodeURIComponent(wiki)
    if (await tryDownload(url, dest)) {
      console.log('OK (wiki)', file)
      fetched += 1
    } else {
      console.warn('FAIL (wiki)', wiki)
    }
  }
  return fetched === WIKI_Q.length
}

async function downloadQFromCommunityDragon() {
  let fetched = 0
  for (const { remote, file } of CDRAGON_Q_FILES) {
    const dest = join(HUD_OUT, file)
    if (existsSync(dest) && readFileSync(dest).length > 300) {
      const existing = WIKI_Q.some((w) => w.file === file)
      if (existing) continue
    }
    for (const patch of CDRAGON_PATCHES) {
      const url = cdragonHudUrl(patch, remote)
      if (await tryDownload(url, dest)) {
        console.log('OK (cdragon)', file, patch)
        fetched += 1
        break
      }
    }
  }
  return fetched === CDRAGON_Q_FILES.length
}

async function bakeFromReference() {
  if (!existsSync(REF)) {
    console.error('Missing reference:', REF)
    return false
  }
  const crops = [
    { file: 'JinxQPowPow.png', left: 340, top: 370, size: 110 },
    { file: 'JinxQFishbones.png', left: 460, top: 370, size: 110 },
  ]
  for (const c of crops) {
    const dest = join(HUD_OUT, c.file)
    if (existsSync(dest) && readFileSync(dest).length > 300) {
      console.log('SKIP (ref)', c.file, 'already present')
      continue
    }
    await sharp(REF)
      .extract({ left: c.left, top: c.top, width: c.size, height: c.size })
      .resize(64, 64)
      .png()
      .toFile(dest)
    console.log('OK (ref)', c.file)
  }
  return true
}

mkdirSync(HUD_OUT, { recursive: true })

const wikiOk = await downloadQFromWiki()
if (!wikiOk) {
  console.log('LoL Wiki incomplete — trying Community Dragon…')
  const cdragonOk = await downloadQFromCommunityDragon()
  if (!cdragonOk) {
    console.log('Community Dragon unavailable — baking from reference crop')
    if (!(await bakeFromReference())) process.exit(1)
  }
}

console.log('\nJinx Q HUD icons ready in public/assets/hud/jinx/')
