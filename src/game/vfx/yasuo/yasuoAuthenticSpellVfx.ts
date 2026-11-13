/** CommunityDragon Yasuo base particles — grayscale masks → ADD + tint in yasuoSpellVisuals. */
export const YASUO_SPELL_PARTICLE_VFX = {
  baTrail: 'yasuo-spell-ba-trail',
  baWindRing: 'yasuo-spell-ba-wind-ring',
  baImpactSlash: 'yasuo-spell-ba-impact-slash',
  baHitFlash: 'yasuo-spell-ba-hit-flash',
  qSword: 'yasuo-spell-q-sword',
  qTornadoBlade: 'yasuo-spell-q-tornado-blade',
  qTornadoCas: 'yasuo-spell-q-tornado-cas',
  qWindHit: 'yasuo-spell-q-wind-hit',
  qHitSpark: 'yasuo-spell-q-hit-spark',
  qTornadoGround: 'yasuo-spell-q-tornado-ground',
  qSmoke: 'yasuo-spell-q-smoke',
  qWindColor: 'yasuo-spell-q-wind-color',
  wWallMain: 'yasuo-spell-w-wall-main',
  wWallMain02: 'yasuo-spell-w-wall-main-02',
  wWispy: 'yasuo-spell-w-wispy',
  wIndicator: 'yasuo-spell-w-indicator',
  wSteam: 'yasuo-spell-w-steam',
  wWallMult: 'yasuo-spell-w-wall-mult',
  eDashWhite: 'yasuo-spell-e-dash-white',
  eDashRing: 'yasuo-spell-e-dash-ring',
  eDashSmoke: 'yasuo-spell-e-dash-smoke',
  eDashFlash: 'yasuo-spell-e-dash-flash',
  rWindBlast: 'yasuo-spell-r-wind-blast',
  rLandRing: 'yasuo-spell-r-land-ring',
  rSwordShape: 'yasuo-spell-r-sword-shape',
  rGroundCrack: 'yasuo-spell-r-ground-crack',
} as const

const SPELL = '/assets/vfx/yasuo/spells'
const BA = '/assets/vfx/yasuo'

export const YASUO_SPELL_PARTICLE_FILES: Record<
  keyof typeof YASUO_SPELL_PARTICLE_VFX,
  string
> = {
  baTrail: `${BA}/yasuo_basic_attack_trail.png`,
  baWindRing: `${BA}/yasuo_basic_attack_wind_ring_02.png`,
  baImpactSlash: `${BA}/yasuo_basic_attack_impact_slash.png`,
  baHitFlash: `${BA}/yasuo_base_ba_hit_flash.png`,
  qSword: `${BA}/yasuo_q_sword.png`,
  qTornadoBlade: `${SPELL}/yasuo_base_q_tornado_blade.png`,
  qTornadoCas: `${SPELL}/yasuo_base_q_tonado_wind_cas.png`,
  qWindHit: `${SPELL}/yasuo_base_q_wind_hit_tar.png`,
  qHitSpark: `${SPELL}/yasuo_base_q_hit_spark_tar.png`,
  qTornadoGround: `${SPELL}/yasuo_q_tornado_ground_shape_cas.png`,
  qSmoke: `${SPELL}/yasuo_q_smoke.png`,
  qWindColor: `${SPELL}/color_yasuo_q_wind.png`,
  wWallMain: `${SPELL}/yasuo_w_windwall_main.png`,
  wWallMain02: `${SPELL}/yasuo_w_windwall_main_02.png`,
  wWispy: `${SPELL}/yasuo_w_wind_wispy.png`,
  wIndicator: `${SPELL}/yasuo_base_w_windwall_indicator.png`,
  wSteam: `${SPELL}/yasuo_base_w_windwall_steam.png`,
  wWallMult: `${SPELL}/yasuo_w_wind_wall_mult.png`,
  eDashWhite: `${SPELL}/yasuo_base_e_dash_white.png`,
  eDashRing: `${SPELL}/yasuo_base_e_dash_ring.png`,
  eDashSmoke: `${SPELL}/yasuo_e_dash_smoke.png`,
  eDashFlash: `${SPELL}/yasuo_e_dash_flash.png`,
  rWindBlast: `${SPELL}/yasuo_base_r_wind_blast.png`,
  rLandRing: `${SPELL}/yasuo_base_r_land_exp_ring.png`,
  rSwordShape: `${SPELL}/yasuo_base_r_sword_shape.png`,
  rGroundCrack: `${SPELL}/yasuo_base_r_ground_crack.png`,
}

export const YASUO_HUD_ICONS = {
  q: '/assets/hud/yasuo/YasuoQ1.png',
  w: '/assets/hud/yasuo/YasuoW.png',
  e: '/assets/hud/yasuo/YasuoE.png',
  r: '/assets/hud/yasuo/YasuoR.png',
} as const
