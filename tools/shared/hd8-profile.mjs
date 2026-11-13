/** Perfil hd8 estándar para pipelines Khada (256², 8 frames/ciclo). */
export function hd8ProfileFromHd(hd) {
  return {
    ...hd,
    outputName: hd.outputName.replace(/\.png$/i, '').replace(/_test$/i, '') + '_8dir.png',
    directionMode: 8,
  }
}

export function attachHd8Profiles(PROFILES, hdKey = 'hd') {
  const hd = PROFILES[hdKey]
  if (!hd) {
    return PROFILES
  }
  const baseName = hd.outputName.replace(/\.png$/i, '')
  const suffix = baseName.endsWith('_test') ? '_8dir.png' : '_8dir.png'
  const outputName = baseName.includes('_8dir')
    ? hd.outputName
    : baseName.replace(/_test$/i, '') + '_8dir.png'
  PROFILES.hd8 = {
    ...hd,
    outputName,
    directionMode: 8,
  }
  if (!PROFILES[hdKey].directionMode) {
    PROFILES[hdKey].directionMode = 4
  }
  return PROFILES
}
