/** Shared bake profiles — CLI: node render-sheet.mjs [profile] */
import { attachHd8Profiles } from '../shared/hd8-profile.mjs'

export const PROFILES = attachHd8Profiles({
  legacy: {
    frameWidth: 64,
    frameHeight: 64,
    outputName: 'spritesheet_authentic_test.png',
    writeToPublic: false,
    fill: 0.82,
  },
  hd: {
    frameWidth: 256,
    frameHeight: 256,
    framesPerCycle: 8,
    outputName: 'spritesheet_authentic_hd_test.png',
    writeToPublic: true,
    /** Ahri idle tails need more headroom; 0.86 clips feet at frame bottom. */
    fill: 0.68,
  },
  uhd: {
    frameWidth: 384,
    frameHeight: 384,
    outputName: 'spritesheet_authentic_uhd_test.png',
    writeToPublic: true,
    fill: 0.86,
  },
})

export function resolveProfile(argvProfile) {
  const key = argvProfile ?? 'hd'
  const profile = PROFILES[key]
  if (!profile) {
    throw new Error(`Unknown profile "${key}". Use: ${Object.keys(PROFILES).join(', ')}`)
  }
  return { key, ...profile }
}
