const bases = [
  'https://raw.communitydragon.org/latest/game/assets/particles/',
  'https://raw.communitydragon.org/latest/game/assets/Particles/',
  'https://raw.communitydragon.org/latest/game/assets/common/particles/',
]
const files = ['color-rampdown.png', 'Color_RampDown.png', 'color_rampdown.png']

for (const base of bases) {
  for (const f of files) {
    const r = await fetch(base + f, { method: 'HEAD' })
    if (r.ok) console.log('OK', base + f, r.headers.get('content-length'))
  }
}
