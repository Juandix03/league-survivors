#!/usr/bin/env node
/**
 * Descarga model.glb desde el CDN público de Khada (extras/minions).
 * Mismo patrón que tools/jinx-pipeline/download-glb.mjs — no requiere clonar el extractor.
 */
import { mkdirSync, createWriteStream, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { resolveMinionAlias } from './minion-config.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WORK_GLB = join(__dirname, 'work', 'glb')

/** Verificado 2026-10: HEAD 200 en los 8 alias extras (skin id 0). */
export function khadaExtrasGlbUrl(khadaExtrasAlias, skinId = 0) {
  return `https://cdn.modelviewer.lol/extras/models/${khadaExtrasAlias}/${skinId}/model.glb`
}

async function headOk(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' })
    return r.ok
  } catch {
    return false
  }
}

async function main() {
  const { key, khadaExtrasAlias, label } = resolveMinionAlias(process.argv[2])
  if (!khadaExtrasAlias) {
    console.error(`Alias "${key}" no tiene URL de CDN extras configurada.`)
    process.exit(1)
  }

  const url = khadaExtrasGlbUrl(khadaExtrasAlias, 0)
  if (!(await headOk(url))) {
    console.error(`CDN no disponible (${url}). Revisá modelviewer.lol/extras.`)
    process.exit(1)
  }

  const out = join(WORK_GLB, `${key}.glb`)
  mkdirSync(dirname(out), { recursive: true })
  if (existsSync(out)) {
    console.log('Ya existe (no se sobrescribe):', out)
    console.log('URL:', url)
    return
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Download failed ${res.status} ${url}`)
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(out))
  console.log('Descargado:', out)
  console.log('Minion:', label, `(${khadaExtrasAlias})`)
  console.log('Siguiente paso: npm run minions:render --', key)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
