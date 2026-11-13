/**
 * List mesh names in Khada Yasuo GLB (find wind-wall VFX meshes vs body).
 */
import { readFileSync } from 'node:fs'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

globalThis.self = globalThis

const path = process.argv[2] ?? 'work/yasuo_skin0_khada.glb'
const buffer = readFileSync(path)

const loader = new GLTFLoader()
loader.parse(
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
  '',
  (gltf) => {
    const meshes = []
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return
      meshes.push({
        name: o.name || '(unnamed)',
        skinned: o.isSkinnedMesh,
        type: o.type,
        parent: o.parent?.name ?? '',
      })
    })
    console.log('meshes:', meshes.length)
    for (const m of meshes.sort((a, b) => a.name.localeCompare(b.name))) {
      console.log(
        m.skinned ? 'SKIN' : 'MESH',
        m.name,
        m.parent ? `parent=${m.parent}` : '',
      )
    }
    const spell2 = gltf.animations.filter((a) => /spell2/i.test(a.name))
    console.log('\nSpell2 clips:', spell2.map((a) => `${a.name} ${a.duration.toFixed(3)}s`).join('\n  '))
  },
  (err) => {
    console.error(err)
    process.exit(1)
  },
)
