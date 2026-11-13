/** Re-exports — implementación por habilidad (texturas del cliente). */
export { attachMfStrutBuff } from './mfStrutVisual'

export {
  createMfMakeItRainZone,
  spawnMfEHit,
  spawnMfERainZone,
} from './mfMakeItRainVisual'

export {
  createMfBasicAttackBullet,
  createMfDoubleUpBullet,
  spawnMfBasicAttackCast,
  spawnMfDoubleUpCast,
  spawnMfMuzzleFlash,
  spawnMfQImpact,
  tickMfBulletTrail,
  updateMfBulletVisual,
  type MfBulletVisual,
} from './mfDoubleUpVisual'

export { createMfRBulletVisual, updateMfRBulletVisual } from './mfRBulletVisual'

export { createMfBulletTimeCone, type MfBulletTimeConeVisual } from './mfBulletTimeVisual'

import * as Phaser from 'phaser'
import {
  createMfBasicAttackBullet,
  createMfDoubleUpBullet,
  type MfBulletVisual,
} from './mfDoubleUpVisual'
import { createMfRBulletVisual } from './mfRBulletVisual'

export function createMfBulletVisual(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  depth: number,
  heavy = false,
  kind: 'ba' | 'q' | 'r' = 'ba',
): MfBulletVisual {
  if (kind === 'q') return createMfDoubleUpBullet(scene, x, y, angle, depth)
  if (kind === 'r' || heavy) return createMfRBulletVisual(scene, x, y, angle, depth)
  return createMfBasicAttackBullet(scene, x, y, angle, depth)
}
