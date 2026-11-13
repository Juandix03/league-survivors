/** Authentic Ahri basic-attack VFX (CommunityDragon base skin particles). */
export const AHRI_VFX = {
  baOrbFox: 'ahri-vfx-ba-orb-fox',
  baOrbBackground: 'ahri-vfx-ba-orb-background',
  baGlowCorona: 'ahri-vfx-ba-glow-corona',
  baHitSparks: 'ahri-vfx-ba-hit-sparks',
  baTrail: 'ahri-vfx-ba-trail',
  baSpeedFlash: 'ahri-vfx-ba-speed-flash',
} as const

const VFX_BASE = '/assets/vfx/ahri'

export const AHRI_VFX_FILES: Record<keyof typeof AHRI_VFX, string> = {
  baOrbFox: `${VFX_BASE}/ahri_base_orb_fox_01.png`,
  baOrbBackground: `${VFX_BASE}/ahri_base_ba_orbbackground.png`,
  baGlowCorona: `${VFX_BASE}/ahri_base_ba_glow_corona.png`,
  baHitSparks: `${VFX_BASE}/ahri_base_ba_hit_tar_sparks.png`,
  baTrail: `${VFX_BASE}/ahri_base_ba_trail2.png`,
  baSpeedFlash: `${VFX_BASE}/ahri_base_ba_speed_flash.png`,
}

export const AHRI_HUD_ICONS = {
  q: '/assets/hud/ahri/AhriQ.png',
  w: '/assets/hud/ahri/AhriW.png',
  e: '/assets/hud/ahri/AhriE.png',
  r: '/assets/hud/ahri/AhriR.png',
} as const
