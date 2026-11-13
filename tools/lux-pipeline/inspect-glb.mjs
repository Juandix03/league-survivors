import { readFileSync } from 'node:fs'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

globalThis.self = globalThis

const path = process.argv[2]
if (!path) {
  console.error('Usage: node inspect-glb.mjs <path.glb>')
  process.exit(1)
}

const buffer = readFileSync(path)
const loader = new GLTFLoader()
loader.parse(
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
  '',
  (gltf) => {
    const names = gltf.animations.map((a) => a.name).sort()
    console.log('animations:', names.length)
    for (const n of names) {
      if (/idle|run|attack|spell|walk/i.test(n)) {
        const clip = gltf.animations.find((a) => a.name === n)
        console.log(' ', n, clip?.duration?.toFixed(3))
      }
    }
  },
  (err) => {
    console.error(err)
    process.exit(1)
  },
)
