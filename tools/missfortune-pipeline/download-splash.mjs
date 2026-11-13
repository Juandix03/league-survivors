import { createWriteStream, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../../public/assets/champions/missfortune')

const ASSETS = [
  {
    url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/MissFortune_0.jpg',
    file: 'splash.jpg',
  },
  {
    url: 'https://raw.communitydragon.org/latest/game/assets/characters/missfortune/hud/missfortune_circle_0.png',
    file: 'loadscreen_0.png',
    optional: true,
  },
  {
    url: 'https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/MissFortune.png',
    file: 'square.png',
  },
]

async function download({ url, file, optional }) {
  const dest = join(OUT, file)
  if (existsSync(dest)) {
    console.log('SKIP', dest)
    return
  }
  const res = await fetch(url)
  if (!res.ok) {
    if (optional) {
      console.warn('SKIP optional', res.status, url)
      return
    }
    throw new Error(`${res.status} ${url}`)
  }
  mkdirSync(dirname(dest), { recursive: true })
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  console.log('OK', dest)
}

for (const asset of ASSETS) {
  await download(asset)
}
