/** Client particle atlases (256² grids unless noted). */
export const MF_MUZZLE_SHEET = {
  key: 'mf-sheet-muzzle-2x3',
  fileKey: 'muzzle' as const,
  frameWidth: 128,
  frameHeight: 85,
  frameCount: 6,
}

export const MF_Q_FLAMES_SHEET = {
  key: 'mf-sheet-q-flames-4x4',
  fileKey: 'qFlames' as const,
  frameWidth: 64,
  frameHeight: 64,
  frameCount: 16,
}

export const MF_IMPACT_SPARKS_SHEET = {
  key: 'mf-sheet-impact-sparks-4x4',
  fileKey: 'impactSparks' as const,
  frameWidth: 64,
  frameHeight: 64,
  frameCount: 16,
}

export const MF_SMOKE_SHEET = {
  key: 'mf-sheet-smoke-4x4',
  fileKey: 'smoke4' as const,
  frameWidth: 64,
  frameHeight: 64,
  frameCount: 16,
}

export const MF_W_STARS_SHEET = {
  key: 'mf-sheet-w-stars-4x2',
  fileKey: 'wStarStreaks' as const,
  frameWidth: 128,
  frameHeight: 128,
  frameCount: 8,
}

export const MF_ATLAS_SHEETS = [
  MF_MUZZLE_SHEET,
  MF_Q_FLAMES_SHEET,
  MF_IMPACT_SPARKS_SHEET,
  MF_SMOKE_SHEET,
  MF_W_STARS_SHEET,
] as const

export const MF_ANIM = {
  muzzleFlash: 'mf-anim-muzzle-flash',
  qBulletFlames: 'mf-anim-q-bullet-flames',
  qImpactSparks: 'mf-anim-q-impact-sparks',
  wStars: 'mf-anim-w-stars',
  eRainSmoke: 'mf-anim-e-smoke-puff',
} as const
