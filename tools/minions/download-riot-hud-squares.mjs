#!/usr/bin/env node
/**
 * Descarga iconos square oficiales de minions (HUD del cliente LoL vía CommunityDragon).
 * IP: Riot Games — solo proyecto fan / for fun; ver tools/minions/minion-assets-research.md
 */
import { mkdirSync, createWriteStream, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const OUT_DIR = join(root, 'public/assets/minions-preview/riot-square')

const ASSETS = [
  { kind: 'orderMelee', file: 'bluemelee_square.png', char: 'sru_orderminionmelee' },
  { kind: 'chaosMelee', file: 'redmelee_square.png', char: 'sru_chaosminionmelee' },
  { kind: 'orderRanged', file: 'bluerange_square.png', char: 'sru_orderminionranged' },
  { kind: 'chaosRanged', file: 'redrange_square.png', char: 'sru_chaosminionranged' },
  { kind: 'orderSiege', file: 'bluemechcannon_square.png', char: 'sru_orderminionsiege' },
  { kind: 'chaosSiege', file: 'redmechcannon_square.png', char: 'sru_chaosminionsiege' },
  { kind: 'orderSuper', file: 'bluemechmelee_square.png', char: 'sru_orderminionsuper' },
  { kind: 'chaosSuper', file: 'redmechmelee_square.png', char: 'sru_chaosminionsuper' },
]

const BASE = 'https://raw.communitydragon.org/latest/game/assets/characters'

async function download(url, dest) {
  if (existsSync(dest)) {
    console.log('skip (exists)', dest)
    return
  }
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`${res.status} ${url}`)
  }
  mkdirSync(dirname(dest), { recursive: true })
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  console.log('ok', dest)
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  for (const a of ASSETS) {
    const url = `${BASE}/${a.char}/hud/${a.file}`
    const dest = join(OUT_DIR, `${a.kind}.png`)
    await download(url, dest)
  }
  console.log('\nDone →', OUT_DIR)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
