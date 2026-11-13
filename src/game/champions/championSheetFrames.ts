import * as Phaser from 'phaser'

/**
 * `generateTexture` / imágenes sin parse dejan solo `__BASE`.
 * Las animaciones de campeón usan frames numerados como `load.spritesheet`.
 */
export function registerNumberedGridFrames(
  scene: Phaser.Scene,
  textureKey: string,
  frameWidth: number,
  frameHeight: number,
  cols: number,
  rows: number,
): number {
  if (!scene.textures.exists(textureKey)) {
    return 0
  }

  const texture = scene.textures.get(textureKey)
  let added = 0

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col
      const name = String(index)
      if (texture.has(name)) {
        continue
      }
      texture.add(name, 0, col * frameWidth, row * frameHeight, frameWidth, frameHeight)
      added += 1
    }
  }

  return added
}

export function championTextureHasFrame(textureKey: string, scene: Phaser.Scene, index: number) {
  if (!scene.textures.exists(textureKey)) {
    return false
  }
  const texture = scene.textures.get(textureKey)
  const name = String(index)
  return texture.has(name)
}

type ChampionAnimFrame = { key: string; frame: number }

export function buildChampionAnimationFrames(
  scene: Phaser.Scene,
  textureKey: string,
  start: number,
  end: number,
): ChampionAnimFrame[] {
  if (!scene.textures.exists(textureKey)) {
    return []
  }

  const frames: ChampionAnimFrame[] = []
  for (let i = start; i <= end; i += 1) {
    if (!championTextureHasFrame(textureKey, scene, i)) {
      continue
    }
    frames.push({ key: textureKey, frame: i })
  }
  return frames
}
