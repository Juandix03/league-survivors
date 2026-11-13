#!/usr/bin/env node
/**
 * Lista URLs CommunityDragon para minions SR (sin descargar archivos).
 * Contenido: propiedad de Riot Games — solo referencia de desarrollo.
 */

const PATCH = 'latest'
const BASE = `https://raw.communitydragon.org/${PATCH}/game/assets/characters`

const MINIONS = [
  { role: 'Melee azul (Order)', id: 'sru_orderminionmelee', tex: 'orderminion_melee_tx_cm.png' },
  { role: 'Melee rojo (Chaos)', id: 'sru_chaosminionmelee', tex: 'chaosminion_melee_tx_cm.png' },
  { role: 'Ranged azul', id: 'sru_orderminionranged', tex: 'orderminion_caster_tx_cm.png' },
  { role: 'Ranged rojo', id: 'sru_chaosminionranged', tex: 'red_caster_tx_cm.png' },
  { role: 'Siege azul', id: 'sru_orderminionsiege', tex: 'order_minion_siege_tx_cm.png' },
  { role: 'Siege rojo', id: 'sru_chaosminionsiege', tex: 'chaos_minion_siege_tx_cm.png' },
  { role: 'Super azul', id: 'sru_orderminionsuper', tex: 'blue_superminion_tx_cm.png' },
  { role: 'Super rojo', id: 'sru_chaosminionsuper', tex: 'red_superminion_tx_cm.png' },
]

console.log('Minions SR — rutas CommunityDragon (IP Riot)\n')
for (const m of MINIONS) {
  const folder = `${BASE}/${m.id}/skins/base/`
  console.log(`${m.role}`)
  console.log(`  folder: ${folder}`)
  console.log(`  texture: ${folder}${m.tex}`)
  console.log(
    `  data: https://raw.communitydragon.org/${PATCH}/game/data/characters/${m.id}/skins/skin0.bin.json`,
  )
  console.log('')
}
