/**
 * Lista PNGs de Lux en CommunityDragon (ajustar download-spell-vfx.mjs).
 */
const BASE =
  'https://raw.communitydragon.org/latest/game/assets/characters/lux/skins/base/particles/'

const res = await fetch(BASE)
const html = await res.text()
const names = [...html.matchAll(/href="([^"]+\.png)"/gi)].map((m) => m[1]).sort()
const keywords = ['ba', 'q', 'w', 'e', 'r', 'light', 'prism', 'bind', 'beam', 'shield', 'aoe']
const hit = names.filter((n) => keywords.some((k) => n.toLowerCase().includes(k)))
console.log('Total png:', names.length)
console.log('Relevant:')
for (const n of hit.slice(0, 80)) console.log(' ', n)
