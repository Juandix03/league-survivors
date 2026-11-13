/** Authentic base-skin spell VFX (CommunityDragon particles, .tex → .png). */
export const JINX_SPELL_VFX = {
  /** 128×512 trail strip — not the W missile silhouette. */
  wLightningStrip: 'jinx-spell-w-lightning-strip',
  /** 256×256 3×3 bolt shapes — use framed cells for projectile. */
  wBoltAtlas: 'jinx-spell-w-bolt-atlas',
  wMisFlash: 'jinx-spell-w-mis-flash',
  wSparks: 'jinx-spell-w-sparks',
  wTrail: 'jinx-spell-w-trail',
  /** 128×128 — cuerpo pintado (E_Mis emisor Grenade, blend 1). */
  eGrenade: 'jinx-spell-e-grenade',
  /** 128×128 — halo Grenade_Blur (no es el cuerpo). */
  eGrenadeBlur: 'jinx-spell-e-grenade-blur',
  eSplat: 'jinx-spell-e-splat',
  /** 256×256 — atlas UV de Jinx_R_Mis.scb; no usar como Image plano. */
  rMissileAtlas: 'jinx-spell-r-mis-atlas',
  rRocketFire: 'jinx-spell-r-rocket-fire',
  rGroundSmoke: 'jinx-spell-r-ground-smoke',
  rShapeGlow: 'jinx-spell-r-shape',
  /** Aura_Self — emisor Projected / FakeShadow en R_Mis. */
  rAuraSelf: 'jinx-spell-r-aura-self',
} as const

const SPELL_BASE = '/assets/vfx/jinx/spells'

export const JINX_SPELL_VFX_FILES: Record<keyof typeof JINX_SPELL_VFX, string> = {
  wLightningStrip: `${SPELL_BASE}/jinx_lightning.png`,
  wBoltAtlas: `${SPELL_BASE}/jinx_base_w_lightning02.png`,
  wMisFlash: `${SPELL_BASE}/jinx_base_w_mis_flash.png`,
  wSparks: `${SPELL_BASE}/jinx_base_w_sparks.png`,
  wTrail: `${SPELL_BASE}/jinx_base_w_trail02.png`,
  eGrenade: `${SPELL_BASE}/jinx_base_e_mis_grenade.png`,
  eGrenadeBlur: `${SPELL_BASE}/jinx_base_e_mis_grenade_blur.png`,
  eSplat: `${SPELL_BASE}/jinx_base_e_splat_01.png`,
  rMissileAtlas: `${SPELL_BASE}/jinx_r_mis.png`,
  rRocketFire: `${SPELL_BASE}/jinx_base_r_rocketfire_revision.png`,
  rGroundSmoke: `${SPELL_BASE}/jinx_base_r_groundsmoke02.png`,
  rShapeGlow: `${SPELL_BASE}/jinx_r_shape.png`,
  rAuraSelf: `${SPELL_BASE}/aura_self.png`,
}

/**
 * Rampas UV / datos (p. ej. jinx_w_hit_rgb.png, jinx_base_e_mis_type11.png) — no cargar con
 * `load.image`; Phaser no las usa en el prototipo. Ver tools/jinx-pipeline/docs/.
 */

/** Local baked sprite for W (see public/assets/vfx/jinx/w-projectile/SOURCE.md). */
export const JINX_W_PROJECTILE_SPRITE = {
  key: 'jinx-w-zap-sprite',
  url: '/assets/vfx/jinx/w-projectile/jinx_w_zap_sprite.png',
} as const

/** Bake ortográfico de Jinx_R_Mis.scb + jinx_r_mis.png (r-projectile/SOURCE.md). */
export const JINX_R_PROJECTILE_SPRITE = {
  key: 'jinx-r-rocket-sprite',
  url: '/assets/vfx/jinx/r-projectile/jinx_r_rocket_sprite.png',
} as const

/** PNG bake apunta “arriba”; Phaser 0 rad = +X. */
export const JINX_R_PROJECTILE_ROTATION_OFFSET = Math.PI / 2

export const JINX_HUD_ICONS = {
  /** Minigun (Pow-Pow) — arte en disco: JinxQFishbones.png (wiki Switcheroo crop). */
  qPowPow: '/assets/hud/jinx/JinxQFishbones.png',
  /** Rocket (Fishbones) — arte en disco: JinxQPowPow.png (wiki Pow-Pow crop). */
  qFishbones: '/assets/hud/jinx/JinxQPowPow.png',
  w: '/assets/hud/jinx/JinxW.png',
  e: '/assets/hud/jinx/JinxE.png',
  r: '/assets/hud/jinx/JinxR.png',
} as const

/** @deprecated Usar qFishbones / qPowPow según arma. */
export const JINX_HUD_Q_LEGACY = JINX_HUD_ICONS.qFishbones
