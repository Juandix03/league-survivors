import { readFileSync } from 'node:fs'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

globalThis.self = globalThis
const path = process.argv[2]
const buffer = readFileSync(path)
const loader = new GLTFLoader()
loader.parse(
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
  '',
  (gltf) => {
    const names = []
    gltf.scene.traverse((o) => {
      if (o.name) names.push(o.name)
    })
    const weapon = names.filter((n) =>
      /fish|rocket|pow|gun|minigun|weapon|launcher|wpn|missile/i.test(n),
    )
    console.log('Total nodes:', names.length)
    console.log('Weapon-related nodes:', weapon.length)
    for (const n of weapon.sort()) console.log(n)
  },
  (err) => {
    console.error(err)
    process.exit(1)
  },
)
