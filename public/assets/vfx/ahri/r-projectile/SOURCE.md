# Ahri R — impulso espiritual (`ahri_r_dash_capsule_sprite.png`)

## Origen LoL

- **VFX:** `Ahri_Base_R_mis`, `Ahri_Base_R_mis_02`
- **Malla jugable:** `ahri_base_r_frontcapsule.scb` (cápsula frontal del dash)
- **UV:** `ahri_base_r_airbullet.png`
- **Export OBJ:** `tools/ahri-pipeline/work/ahri_base_r_frontcapsule.obj`
- **Bake:** `tools/ahri-pipeline/bake-r-dash-sprite.mjs`

Notas:

- `ahridash.scb` existe en el WAD pero exporta **sin volumen** (bbox 0); es referencia de sistema, no bake ortográfico.
- `ahridash.png` es textura billboard / aura; va en capa ADD (`rAuraGlow`, trails), no como cuerpo del dash.

Partículas R (CommunityDragon):

- `ahri_base_r_aura_glow.png`, `ahri_base_r_trail2.png`, `ahri_base_r_smoketrail_03.png`
- `ahri_base_r_shockblasts.png`, `ahri_r_eyemask.png`

## Regenerar

```bash
npm run ahri:extract-wad
npm run ahri:export-scb
npm run ahri:download-spells
npm run ahri:bake-r-dash
```

## Sprite final

| Clave | Archivo |
|-------|---------|
| `ahri-r-dash-capsule-sprite` | `ahri_r_dash_capsule_sprite.png` |

Factory: `createAhriSpiritRushVisual()` en `src/game/vfx/ahri/ahriSpellVisuals.ts`.
