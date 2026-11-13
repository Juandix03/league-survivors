# Ahri Q — orbe (`ahri_q_orb_*_sprite.png`)

## Origen

1. **Malla:** `ahri_base_q_sphere_01.scb` (WAD Ahri, skin base)
2. **Texturas UV (out / return):**
   - Outbound: `ahri_base_q_orbbackground.png`
   - Return: `ahri_base_q_orbedge.png`
3. **Export OBJ:** `work/ahri_base_q_sphere_01.obj`
4. **Bake:** `tools/ahri-pipeline/bake-q-orb-sprite.mjs`

## Regenerar

```bash
npm run ahri:extract-wad
npm run ahri:export-scb
npm run ahri:download-spells
npm run ahri:bake-q-orb
```

## Uso en Phaser

| Clave | Archivo | Fase |
|--------|---------|------|
| `ahri-q-orb-outbound-sprite` | `ahri_q_orb_outbound_sprite.png` | Ida |
| `ahri-q-orb-return-sprite` | `ahri_q_orb_return_sprite.png` | Vuelta |

Ver `createAhriQOrbVisual()` en `src/game/vfx/ahri/ahriSpellVisuals.ts`.

Estelas: `ahri_base_q_trail_01.png` / `_02` — composición aparte (no sustituyen el orbe).
