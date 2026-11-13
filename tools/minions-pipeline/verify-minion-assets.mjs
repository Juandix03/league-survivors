#!/usr/bin/env node
/**
 * Comprueba (sin descargar assets) que los 8 minions SR tienen malla, textura y anim en CDragon.
 */
const PATCH = 'latest'
const BASE_DATA = `https://raw.communitydragon.org/${PATCH}/game/data/characters`
const BASE_ASSETS = `https://raw.communitydragon.org/${PATCH}/game/assets`

const MINIONS = [
  { id: 'blue-melee', team: 'Order', role: 'Melee', folder: 'sru_orderminionmelee' },
  { id: 'red-melee', team: 'Chaos', role: 'Melee', folder: 'sru_chaosminionmelee' },
  { id: 'blue-caster', team: 'Order', role: 'Caster', folder: 'sru_orderminionranged' },
  { id: 'red-caster', team: 'Chaos', role: 'Caster', folder: 'sru_chaosminionranged' },
  { id: 'blue-siege', team: 'Order', role: 'Siege', folder: 'sru_orderminionsiege' },
  { id: 'red-siege', team: 'Chaos', role: 'Siege', folder: 'sru_chaosminionsiege' },
  { id: 'blue-super', team: 'Order', role: 'Super', folder: 'sru_orderminionsuper' },
  { id: 'red-super', team: 'Chaos', role: 'Super', folder: 'sru_chaosminionsuper' },
]

const EXTRACTOR_NAMES = {
  'sru_orderminionmelee': 'SRU_OrderMinionMelee',
  'sru_chaosminionmelee': 'SRU_ChaosMinionMelee',
  'sru_orderminionranged': 'SRU_OrderMinionRanged',
  'sru_chaosminionranged': 'SRU_ChaosMinionRanged',
  'sru_orderminionsiege': 'SRU_OrderMinionSiege',
  'sru_chaosminionsiege': 'SRU_ChaosMinionSiege',
  'sru_orderminionsuper': 'SRU_OrderMinionSuper',
  'sru_chaosminionsuper': 'SRU_ChaosMinionSuper',
}

async function headOk(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' })
    return r.ok
  } catch {
    return false
  }
}

function texToPng(texPath) {
  if (!texPath) return null
  const p = texPath.replace(/^assets\//i, '').replace(/\.tex$/i, '.png')
  return `${BASE_ASSETS}/${p}`
}

function sknToUrl(simpleSkinPath) {
  if (!simpleSkinPath) return null
  const m = simpleSkinPath.match(/characters\/([^/]+)\/skins\/([^/]+)\/([^/]+\.skn)/i)
  if (!m) return null
  const [, char, skinFolder, file] = m
  const charLower = char.toLowerCase()
  const skinLower = skinFolder.toLowerCase()
  const fileLower = file.toLowerCase()
  return `${BASE_ASSETS}/characters/${charLower}/skins/${skinLower}/${fileLower}`
}

async function fetchJson(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json()
}

function collectAnmPaths(animJson) {
  const paths = new Set()
  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return
    if (typeof obj.mAnimationFilePath === 'string') {
      paths.add(obj.mAnimationFilePath)
    }
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') walk(v)
    }
  }
  walk(animJson)
  return [...paths]
}

function anmToUrl(anmPath) {
  const p = anmPath.replace(/^assets\//i, '').replace(/\.anm$/i, '.anm')
  return `${BASE_ASSETS}/${p}`
}

async function verifyOne(m) {
  const skinUrl = `${BASE_DATA}/${m.folder}/skins/skin0.bin.json`
  const animUrl = `${BASE_DATA}/${m.folder}/animations/skin0.bin.json`

  let skinBin
  let animBin
  try {
    skinBin = await fetchJson(skinUrl)
  } catch (e) {
    return { ...m, ok: false, error: `skin0.bin.json: ${e.message}` }
  }
  try {
    animBin = await fetchJson(animUrl)
  } catch (e) {
    return { ...m, ok: false, error: `animations skin0: ${e.message}` }
  }

  const skinKey = Object.keys(skinBin).find((k) => k.includes('Skins/Skin0'))
  const props = skinKey ? skinBin[skinKey] : null
  const mesh = props?.skinMeshProperties
  const sknUrl = sknToUrl(mesh?.simpleSkin?.replace(/^ASSETS\//i, 'assets/'))
  const texUrl = texToPng(mesh?.texture)

  const anmPaths = collectAnmPaths(animBin)
  const hasIdle = anmPaths.some((p) => /idle/i.test(p))
  const hasRun = anmPaths.some((p) => /run/i.test(p))
  const sampleAnm = anmPaths.find((p) => /run/i.test(p)) ?? anmPaths[0]

  const [sknOk, texOk] = await Promise.all([
    sknUrl ? headOk(sknUrl) : false,
    texUrl ? headOk(texUrl) : false,
  ])
  // .anm no suele estar en RAW CDN (404); el grafo en bin.json + WAD del cliente sí.
  const animMetaOk = anmPaths.length > 0 && hasIdle && hasRun

  return {
    ...m,
    extractorName: EXTRACTOR_NAMES[m.folder],
    ok: sknOk && texOk && animMetaOk,
    skn: { path: mesh?.simpleSkin, url: sknUrl, ok: sknOk },
    tex: { path: mesh?.texture, url: texUrl, ok: texOk },
    anim: {
      count: anmPaths.length,
      sample: sampleAnm,
      ok: animMetaOk,
      hasIdle,
      hasRun,
      note: 'Referencias en skin0 animations bin; bytes en WAD (Map11 o WAD dedicado vía extractor)',
    },
    skinScale: mesh?.skinScale,
  }
}

async function main() {
  console.log('CommunityDragon verify — SR minions (read-only HEAD)\n')
  const results = []
  for (const m of MINIONS) {
    process.stdout.write(`Checking ${m.folder}…\r`)
    results.push(await verifyOne(m))
  }
  console.log('')

  const w = 14
  console.log(
    'ID'.padEnd(w) +
      'SKN'.padEnd(6) +
      'TEX'.padEnd(6) +
      'ANM'.padEnd(6) +
      'idle+run'.padEnd(10) +
      'scale'.padEnd(8) +
      'OK',
  )
  for (const r of results) {
    console.log(
      r.id.padEnd(w) +
        String(r.skn?.ok).padEnd(6) +
        String(r.tex?.ok).padEnd(6) +
        String(r.anim?.ok).padEnd(6) +
        String(r.anim?.hasIdle && r.anim?.hasRun).padEnd(10) +
        String(r.skinScale ?? '?').padEnd(8) +
        (r.ok ? 'YES' : 'NO'),
    )
  }

  const allOk = results.every((r) => r.ok)
  console.log('\nAll 8 pipeline-ready (skn+tex RAW, anim graph):', allOk ? 'YES' : 'NO')
  console.log('Local LoL: minions NO en Champions/*.wad sueltos; Map11.wad.client presente → extractor Khada.')

  const siegeSuper = results.filter((r) => r.role === 'Siege' || r.role === 'Super')
  const samePipeline = siegeSuper.every((r) => r.skn?.ok && r.tex?.ok && r.anim?.ok)
  console.log('Siege + Super same asset shape (skn/tex/anm):', samePipeline ? 'YES' : 'NO')

  console.log('\n--- Extractor WAD names (Khada) ---')
  for (const r of results) {
    console.log(`  ${r.id}: ${r.extractorName}`)
  }

  if (!allOk) {
    for (const r of results.filter((x) => !x.ok)) {
      console.log('\nFAIL', r.id, r.error ?? r)
    }
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
