/** Shared bake profiles — CLI: node render-sheet.mjs [profile] */
import { attachHd8Profiles } from '../shared/hd8-profile.mjs'

export const PROFILES = attachHd8Profiles({
  legacy: {
    frameWidth: 64,
    frameHeight: 64,
    outputName: 'spritesheet_authentic_test.png',
    writeToPublic: false,
    fill: 0.82,
    framePadY: 0.45,
  },
  hd: {
    frameWidth: 256,
    frameHeight: 256,
    framesPerCycle: 8,
    outputName: 'spritesheet_authentic_hd.png',
    writeToPublic: true,
    /** Katana + wide stance — slightly tighter fill than Ahri. */
    fill: 0.72,
    framePadY: 0.58,
    directionMode: 4,
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
