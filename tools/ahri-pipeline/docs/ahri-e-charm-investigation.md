# Ahri E — Encanto (`Ahri_Base_E_mis`)

## Spell / VFX

- VFX: `Ahri_Base_E_mis`
- **Mesh:** `ahri_base_e_heart_01.scb` (+ `ahri_base_e_swirls_01.scb` en cast)
- **UV:** `ahri_base_e_heart_01.png` (pareado 1:1 con el SCB)

## Partículas

Trails `ahri_base_e_trail_01.png`, humo `ahri_base_e_smoke_2x2.png`, rays `ahri_e_rays_mult.png`, variantes `ahri_base_e_heart_02.png`, `ahri_e_heart.png`.

## Pipeline completado

1. Export OBJ + bake → `e-projectile/ahri_e_charm_sprite.png`
2. `createAhriCharmBoltVisual()` — capas ADD: bake + `e_heart_02` + `e_heart_01` + `ahri_e_heart.png`
3. Vuelo: `spawnAhriCharmTrailSegment`, `syncAhriCharmBoltVisualMotion`, cast `spawnAhriCharmCastFlash`
4. Impacto: `e_rays_mult` + bloom `e_heart_02` + humo
5. `ArenaScene` — estela ~44 ms, colisión `enemy.radius + hitRadius`, destroy al impacto
