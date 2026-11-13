import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WAD =
  process.env.LEESIN_WAD ??
  'C:/Riot Games/League of Legends/Game/DATA/FINAL/Champions/LeeSin.wad.client'
const OUT = join(__dirname, 'work/leesin-wad-extract')
const SKIN0 =
  'https://raw.communitydragon.org/latest/game/data/characters/leesin/skins/skin0.bin.json'

mkdirSync(OUT, { recursive: true })

const json = await fetch(SKIN0).then((r) => r.text())
writeFileSync(join(__dirname, 'work/leesin-skin0.bin.json'), json)

const keys = [...json.matchAll(/"([^"]+)"/g)]
  .map((m) => m[1])
  .filter((s) => /leesin.*q|LeeSin.*Q|sonic|Sonic|QOne|Q_Two|BlindMonk.*Q/i.test(s))
const uniq = [...new Set(keys)]
console.log('skin0 Q-ish keys:', uniq.length)
for (const k of uniq.slice(0, 60)) console.log(' ', k)

if (!existsSync(WAD)) {
  console.error('WAD missing:', WAD)
  process.exit(1)
}

const patterns = [
  '*leesin/skins/base/particles/*q*.scb',
  '*leesin/skins/base/particles/*Q*.scb',
  '*leesin/skins/base/particles/*mis*.scb',
  '*leesin/skins/base/particles/*sphere*.scb',
  '*leesin/skins/base/particles/*cylinder*.scb',
  '*leesin/skins/base/particles/*q*.tex',
  '*shared/particles/sphere_01.scb',
]

for (const pattern of patterns) {
  console.log('\n> extract', pattern)
  spawnSync('python', ['-m', 'cdtb', 'wad-extract', WAD, '-o', OUT, '-p', pattern], {
    stdio: 'inherit',
  })
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, acc)
    else if (/\.scb$/i.test(e.name)) acc.push(p)
  }
  return acc
}

const scbs = walk(OUT).sort()
console.log('\nExtracted SCB:', scbs.length)
for (const p of scbs) console.log(p.replace(OUT, ''))
