/**
 * Phaser texture keys + public URLs for authentic Jinx VFX (CommunityDragon).
 *
 * Usage notes (see also /jinx-vfx-preview.html):
 * - jinx_basic_bullet: vertical trail strip, not a bullet sprite.
 * - jinx_q_rocket / jinx_explosion_flat / jinx_q_gun_hit: atlases or RGB masks; never draw whole sheet with NORMAL blend.
 * - jinx_q_rocket_rgb: 1D tint gradient for the particle system.
 */
export const JINX_VFX = {
  basicBullet: 'jinx-vfx-basic-bullet',
  bulletShell: 'jinx-vfx-bullet-shell',
  muzzleFlash: 'jinx-vfx-muzzle-flash',
  qGunHit: 'jinx-vfx-q-gun-hit',
  qRocket: 'jinx-vfx-q-rocket',
  qRocketRgb: 'jinx-vfx-q-rocket-rgb',
  explosionFlat: 'jinx-vfx-explosion-flat',
  explosionSmoke: 'jinx-vfx-explosion-smoke',
  rocketAoeFlare: 'jinx-vfx-rocket-aoe-flare',
  baseCrater: 'jinx-vfx-base-crater',
  baSmoke: 'jinx-vfx-ba-smoke',
  baShockring: 'jinx-vfx-ba-shockring',
} as const

const VFX_BASE = '/assets/vfx/jinx'

export const JINX_VFX_FILES: Record<keyof typeof JINX_VFX, string> = {
  basicBullet: `${VFX_BASE}/jinx_basic_bullet.png`,
  bulletShell: `${VFX_BASE}/jinx_bullet_shell.png`,
  muzzleFlash: `${VFX_BASE}/jinx_muzzle_flash.png`,
  qGunHit: `${VFX_BASE}/jinx_q_gun_hit.png`,
  qRocket: `${VFX_BASE}/jinx_q_rocket.png`,
  qRocketRgb: `${VFX_BASE}/jinx_q_rocket_rgb.png`,
  explosionFlat: `${VFX_BASE}/jinx_explosion_flat.png`,
  explosionSmoke: `${VFX_BASE}/jinx_explosion_smoke.png`,
  rocketAoeFlare: `${VFX_BASE}/common_fb_rocket_groundaoe_centerflare.png`,
  baseCrater: `${VFX_BASE}/jinx_base_crater_01.png`,
  baSmoke: `${VFX_BASE}/jinx_base_ba_smoke_01.png`,
  baShockring: `${VFX_BASE}/jinx_base_ba_shockring.png`,
}
