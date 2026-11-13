import { mkdirSync, createWriteStream, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'work', 'yasuo_skin0_khada.glb')

/** Khada CDN: Yasuo classic = champion 157, skin 0 → 157000 */
const URL = 'https://cdn.modelviewer.lol/lol/models/yasuo/157000/model.glb'

async function main() {
  mkdirSync(dirname(OUT), { recursive: true })
  if (existsSync(OUT)) {
    console.log('Already present:', OUT)
    return
  }
  const res = await fetch(URL)
  if (!res.ok) {
    throw new Error(`Download failed ${res.status} ${URL}`)
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(OUT))
  console.log('Downloaded:', OUT)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
