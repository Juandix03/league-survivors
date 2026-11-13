#!/usr/bin/env node
/** Busca referencias a basic attack / missile en data de minions SR. */
const PATCH = 'latest'
const ids = ['sru_orderminionranged', 'sru_orderminionsiege']

async function fetchJson(path) {
  const url = `https://raw.communitydragon.org/${PATCH}/game/data/characters/${path}`
  const r = await fetch(url)
  if (!r.ok) return null
  return r.json()
}

function collectStrings(obj, out) {
  if (!obj || typeof obj !== 'object') return
  if (typeof obj === 'string') {
    if (/basic|attack|mis|missile|projectile|troy|\.png|\.tex/i.test(obj)) {
      out.add(obj)
    }
    return
  }
  for (const v of Object.values(obj)) collectStrings(v, out)
}

for (const id of ids) {
  const files = [
    `${id}/skins/skin0.bin.json`,
    `${id}/animations/skin0.bin.json`,
  ]
  for (const f of files) {
    const json = await fetchJson(f)
    if (!json) continue
    const out = new Set()
    collectStrings(json, out)
    console.log('\n===', f, '===')
    console.log(
      [...out]
        .filter((s) => /basic|mis|missile|projectile|cannon|cast/i.test(s))
        .sort()
        .join('\n') || '(none)',
    )
  }
}

// Spells / characters global search via known naming
const spellNames = [
  'SRU_OrderMinionSiegeBasicAttack',
  'SRU_ChaosMinionSiegeBasicAttack',
  'SRU_OrderMinionRangedBasicAttack',
  'OrderMinionSiegeBasicAttack',
  'sru_orderminionsiegebasicattack',
]
const spellBase = `https://raw.communitydragon.org/${PATCH}/game/data/spells`
for (const name of spellNames) {
  for (const ext of ['.bin.json', '.json']) {
    const r = await fetch(`${spellBase}/${name}${ext}`, { method: 'HEAD' })
    if (r.ok) console.log('SPELL OK', name + ext)
  }
}
