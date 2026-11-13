/** Ahri spell particles + Q orb edge (CommunityDragon). */
export const AHRI_SPELL_VFX = {
  qOrbBackground: 'ahri-spell-q-orbbackground',
  qOrbEdge: 'ahri-spell-q-orbedge',
  qShape: 'ahri-spell-q-shape',
  wRingflare: 'ahri-spell-w-ringflare',
  wFire: 'ahri-spell-w-fire',
  wRays: 'ahri-spell-w-rays',
  eHeart: 'ahri-spell-e-heart',
  eTrail: 'ahri-spell-e-trail',
  eHeartLarge: 'ahri-spell-e-heart-large',
  rAirbullet: 'ahri-spell-r-airbullet',
  rAuraGlow: 'ahri-spell-r-aura-glow',
} as const

const SPELL_BASE = '/assets/vfx/ahri/spells'

export const AHRI_SPELL_VFX_FILES: Record<keyof typeof AHRI_SPELL_VFX, string> = {
  qOrbBackground: `${SPELL_BASE}/ahri_base_q_orbbackground.png`,
  qOrbEdge: `${SPELL_BASE}/ahri_base_q_orbedge.png`,
  qShape: `${SPELL_BASE}/ahri_q_shape.png`,
  wRingflare: `${SPELL_BASE}/ahri_base_w_ringflare.png`,
  wFire: `${SPELL_BASE}/ahri_base_w_fire2x2.png`,
  wRays: `${SPELL_BASE}/ahri_w_rays_mult.png`,
  eHeart: `${SPELL_BASE}/ahri_e_heart.png`,
  eTrail: `${SPELL_BASE}/ahri_base_e_trail_01.png`,
  eHeartLarge: `${SPELL_BASE}/ahri_base_e_heart_01.png`,
  rAirbullet: `${SPELL_BASE}/ahri_base_r_airbullet.png`,
  rAuraGlow: `${SPELL_BASE}/ahri_base_r_aura_glow.png`,
}
