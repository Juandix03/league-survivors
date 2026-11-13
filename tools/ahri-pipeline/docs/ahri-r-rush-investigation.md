# Ahri R — Impulso espiritual (`Ahri_Base_R_mis`, `Ahri_Base_R_mis_02`)

## Spell / VFX

- VFX: `Ahri_Base_R_mis`, `Ahri_Base_R_mis_02`
- **Mesh bakeable:** `ahri_base_r_frontcapsule.scb`
- **UV cuerpo:** `ahri_base_r_airbullet.png`
- `ahridash.scb`: sin geometría exportable (bbox 0); `ahridash.png` = billboard/aura

## Partículas

`ahri_base_r_aura_glow.png`, trails `ahri_base_r_trail2.png`, `ahri_base_r_smoketrail_03.png`, `ahri_base_r_shockblasts.png`, `ahri_r_eyemask.png`.

## Pipeline completado

1. Bake cápsula → `r-projectile/ahri_r_dash_capsule_sprite.png`
2. `createAhriSpiritRushVisual()` + `spawnAhriSpiritRushTrailPuff()`

## ArenaScene (runtime)

- **R** activa cargas (3 con R nivel 1); cada **R** extra lanza un dash hacia cursor / movimiento / enemigo cercano.
- El **jugador se mueve** ~280 ms con easing (no teletransporte); VFX cápsula + billboard sigue al sprite.
- Estela `r_trail` / humo / shockblast; daño por paso en el radio del dash.
- Ventana de recast ~10 s antes de perder cargas restantes.
