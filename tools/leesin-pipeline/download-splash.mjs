/**
 * Splash + loadscreen (CDragon + DDragon).
 */
import { createWriteStream, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../../public/assets/champions/leesin')

const ASSETS = [
  {
    url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/LeeSin_0.jpg',
    file: 'splash.jpg',
  },
  {
    url: 'https://raw.communitydragon.org/latest/game/assets/characters/leesin/skins/base/leesinloadscreen_0.png',
    file: 'loadscreen_0.png',
  },
  {
    url: 'https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/LeeSin.png',
    file: 'square.png',
  },
]

async function download(url, dest) {
  if (existsSync(dest)) {
    console.log('SKIP', dest)
    return
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  mkdirSync(dirname(dest), { recursive: true })
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  console.log('OK', dest)
}

await Promise.all(ASSETS.map((a) => download(a.url, join(OUT, a.file))))
