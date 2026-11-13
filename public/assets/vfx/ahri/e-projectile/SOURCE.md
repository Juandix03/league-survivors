# Ahri E — encanto (`ahri_e_charm_sprite.png`)

## Origen LoL

- **VFX:** `Ahri_Base_E_mis`
- **Malla:** `ahri_base_e_heart_01.scb`
- **UV:** `ahri_base_e_heart_01.png` (mismo nombre que el mesh SCB)
- **Export OBJ:** `tools/ahri-pipeline/work/ahri_base_e_heart_01.obj`
- **Bake:** `tools/ahri-pipeline/bake-e-charm-sprite.mjs`

Partículas asociadas (capas ADD / estela, no reemplazan el corazón):

- `ahri_base_e_trail_01.png`, `ahri_base_e_smoke_2x2.png`
- `ahri_e_rays_mult.png`, `ahri_base_e_heart_02.png`, `ahri_e_heart.png` (ribbons / glow)

## Regenerar

```bash
npm run ahri:extract-wad
npm run ahri:export-scb
npm run ahri:download-spells
npm run ahri:bake-e-charm
```

## Sprite final

| Clave | Archivo |
|-------|---------|
| `ahri-e-charm-sprite` | `ahri_e_charm_sprite.png` |

Factory: `createAhriCharmBoltVisual()` en `src/game/vfx/ahri/ahriSpellVisuals.ts`.

**No** usar `ahri_base_e_heart_01.png` como Image única del proyectil sin bake del mesh.
