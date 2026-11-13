# Ahri W — Fuego zorruno (`Ahri_Base_W_mis`, `Ahri_Base_W_mis_02`)

## Spell / VFX (skin0)

- Spell: `AhriWMissile`, `AhriWDamageMissile`
- VFX: `Ahri_Base_W_mis`, `Ahri_Base_W_mis_02`, cast `Ahri_Base_W_cas`
- **Mesh proyectil:** `ahri_base_fox_1.scb`
- **UV:** `ahri_base_orb_fox_01.png` (mis 1), `ahri_base_orb_fox_03.png` (mis 2)
- Swirls: `ahri_base_w_swirls_01.scb` (halo; no reemplaza el fox mesh)

## Partículas (capas)

Atlas `ahri_base_w_fire2x2.png`, `ahri_w_rays_mult.png`, anillos `ahri_base_w_ringflare.png`, humo/trail `ahri_base_w_smoke_2x2.png`, `ahri_base_w_trail_erode.png`, `ahri_base_w_smallstartrail.png`.

## Pipeline completado

1. `npm run ahri:extract-wad` → `fox_1.scb`
2. `npm run ahri:export-scb` → `work/ahri_base_fox_1.obj`
3. `npm run ahri:bake-w-foxfire` → `w-projectile/ahri_w_foxfire_*.png`
4. Phaser: `createAhriFoxFireVisual()` + partículas ADD en `ahriSpellVisuals.ts`

## Pendiente (integración gameplay)

- Cablear en `ArenaScene` (3 espíritus homing).
- Animación de atlas `w_fire2x2` en loop sobre el cuerpo bakeado.
- Bake opcional de `w_swirls_01.scb` si hace falta halo más fiel.
