import * as Phaser from 'phaser'
import type { MinionPreviewKind } from '../../minionPreview/minionPreviewConstants'
import type { MinionAttackerProfile } from './minionRangedCombatConfig'
import {
  getMinionProjectileVfx,
  type MinionProjectileVfxSet,
} from './minionProjectileVfxConfig'
import { hasMinionProjectileVfx } from './loadMinionProjectileVfx'

export type MinionEnemyProjectile = {
  visual: Phaser.GameObjects.Container | Phaser.GameObjects.Image | Phaser.GameObjects.Arc
  x: number
  y: number
  vx: number
  vy: number
  damage: number
  hitRadius: number
  remainingMs: number
  didHitPlayer: boolean
}

export function spawnMinionEnemyProjectile(
  scene: Phaser.Scene,
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
  profile: MinionAttackerProfile,
  minionKind: MinionPreviewKind,
  depth: number,
): MinionEnemyProjectile {
  const dx = targetX - fromX
  const dy = targetY - fromY
  const len = Math.hypot(dx, dy) || 1
  const speed = profile.projectileSpeed
  const vx = (dx / len) * speed
  const vy = (dy / len) * speed

  const vfx = getMinionProjectileVfx(minionKind)
  const useAuthentic = vfx && hasMinionProjectileVfx(scene, vfx)

  let visual: Phaser.GameObjects.Container | Phaser.GameObjects.Image | Phaser.GameObjects.Arc

  if (useAuthentic && vfx) {
    visual = spawnTexturedProjectile(scene, fromX, fromY, vfx, profile, depth)
  } else if (profile.id === 'siege') {
    visual = spawnSiegeFallbackProjectile(scene, fromX, fromY, profile, depth)
  } else {
    const radius = profile.projectileRadius
    const fallback = scene.add.circle(fromX, fromY, radius, profile.fillColor, 0.92)
    fallback.setStrokeStyle(2, profile.strokeColor, 0.65)
    fallback.setDepth(depth)
    visual = fallback
  }

  return {
    visual,
    x: fromX,
    y: fromY,
    vx,
    vy,
    damage: profile.damage,
    hitRadius: profile.projectileRadius + 4,
    remainingMs: profile.maxProjectileLifeMs,
    didHitPlayer: false,
  }
}

function spawnTexturedProjectile(
  scene: Phaser.Scene,
  x: number,
  y: number,
  vfx: MinionProjectileVfxSet,
  profile: MinionAttackerProfile,
  depth: number,
) {
  if (profile.id === 'siege') {
    const root = scene.add.container(x, y)
    root.setDepth(depth)

    const body = scene.add.image(0, 0, vfx.bodyKey)
    body.setOrigin(0.5, 0.5)
    body.setBlendMode(
      vfx.bodyAdd ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL,
    )
    body.setAlpha(vfx.bodyAdd ? 0.88 : 1)
    body.setScale(vfx.bodyScale)

    const core = scene.add.circle(0, 0, profile.projectileRadius * 0.35, 0xffffff, 0.35)
    core.setBlendMode(Phaser.BlendModes.ADD)

    root.add([body, core])
    return root
  }

  const body = scene.add.image(x, y, vfx.bodyKey)
  body.setOrigin(0.5, 0.5)
  body.setBlendMode(Phaser.BlendModes.NORMAL)
  body.setScale(vfx.bodyScale)
  body.setDepth(depth)
  return body
}

/** Sin PNG: bola suave sin borde negro grueso. */
function spawnSiegeFallbackProjectile(
  scene: Phaser.Scene,
  x: number,
  y: number,
  profile: MinionAttackerProfile,
  depth: number,
) {
  const r = profile.projectileRadius
  const root = scene.add.container(x, y)
  root.setDepth(depth)

  const halo = scene.add.circle(0, 0, r + 5, profile.fillColor, 0.22)
  halo.setBlendMode(Phaser.BlendModes.ADD)

  const body = scene.add.circle(0, 0, r, profile.fillColor, 0.88)
  body.setStrokeStyle(1, profile.strokeColor, 0.45)

  const hot = scene.add.circle(0, 0, r * 0.38, 0xfff7ed, 0.55)
  hot.setBlendMode(Phaser.BlendModes.ADD)

  root.add([halo, body, hot])
  return root
}

export function syncMinionEnemyProjectileTransform(p: MinionEnemyProjectile) {
  p.visual.setPosition(p.x, p.y)
  p.visual.setDepth(p.y)
}
