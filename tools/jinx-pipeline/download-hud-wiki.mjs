/**
 * Descarga iconos HD de Jinx desde LoL Wiki (CC BY-SA 3.0).
 * https://wiki.leagueoflegends.com/en-us/Category:High_definition_Jinx_ability_icons
 */
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const HUD_OUT = join(__dirname, '../../public/assets/hud/jinx')
const WIKI = 'https://wiki.leagueoflegends.com/en-us/Special:FilePath/'

const MAP = [
  { wiki: 'Jinx_Pow-Pow_HD.png', out: 'JinxQPowPow.png' },
  { wiki: 'Jinx_Switcheroo!_HD.png', out: 'JinxQFishbones.png' },
  { wiki: 'Jinx_Zap!_HD.png', out: 'JinxW.png' },
  { wiki: 'Jinx_Flame_Chompers!_HD.png', out: 'JinxE.png' },
  { wiki: 'Jinx_Super_Mega_Death_Rocket!_HD.png', out: 'JinxR.png' },
]

mkdirSync(HUD_OUT, { recursive: true })

let fail = 0
for (const { wiki, out } of MAP) {
  const url = WIKI + encodeURIComponent(wiki)
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) {
    console.error('FAIL', res.status, wiki)
    fail += 1
    continue
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await sharp(buf).resize(64, 64).png().toFile(join(HUD_OUT, out))
  console.log('OK', out, `(${buf.length} bytes src)`)
}

if (fail > 0) process.exit(1)
console.log('\nWiki HD HUD icons → public/assets/hud/jinx/')
