# Ahri W — fuego zorruno (`ahri_w_foxfire_*_sprite.png`)

## Origen LoL

- **VFX:** `Ahri_Base_W_mis`, `Ahri_Base_W_mis_02` (skin0)
- **Malla:** `ahri_base_fox_1.scb` — `assets/characters/ahri/skins/base/particles/`
- **UV principal:** `ahri_base_orb_fox_01.png` (mis 1)
- **UV alterno:** `ahri_base_orb_fox_03.png` (mis 2 / variante)
- **Export OBJ:** `tools/ahri-pipeline/work/ahri_base_fox_1.obj`
- **Bake:** `tools/ahri-pipeline/bake-w-foxfire-sprite.mjs`

Capas de partícula (CommunityDragon, **no** sustituyen el zorro bakeado):

- `ahri_base_w_fire2x2.png` — atlas de llamas ADD
- `ahri_base_w_ringflare.png`, `ahri_w_rays_mult.png`
- `ahri_base_w_smoke_2x2.png`, `ahri_base_w_trail_erode.png`, `ahri_base_w_smallstartrail.png`

Swirls opcionales en WAD: `ahri_base_w_swirls_01.scb` (halo; composición aparte).

## Regenerar

```bash
npm run ahri:extract-wad
npm run ahri:export-scb
npm run ahri:download-spells
npm run ahri:bake-w-foxfire
```

## Sprites finales

| Clave Phaser | Archivo | Uso |
|--------------|---------|-----|
| `ahri-w-foxfire-sprite` | `ahri_w_foxfire_sprite.png` | Cuerpo W (orb_fox_01) |
| `ahri-w-foxfire-alt-sprite` | `ahri_w_foxfire_alt_sprite.png` | Variante W_mis_02 |

Factory: `createAhriFoxFireVisual()` en `src/game/vfx/ahri/ahriSpellVisuals.ts`.
