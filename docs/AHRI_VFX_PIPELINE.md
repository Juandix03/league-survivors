# Pipeline visual Ahri (paridad con Jinx)

## Estado

| Habilidad | Investigación | PNG curados | Bake jugable | Capa Phaser | En `ArenaScene` |
|-----------|---------------|-------------|--------------|-------------|-----------------|
| **BA** | `tools/ahri-pipeline/docs/ahri-ba-missile-investigation.md` | Sí | `ba-projectile/ahri_ba_magicball_sprite.png` | `createAhriBasicProjectileVisual` | **Sí** (`ArenaScene`) |
| **Q** | `ahri-q-orb-investigation.md` | Sí | `q-projectile/ahri_q_orb_*_sprite.png` | `createAhriQOrbVisual` | **Sí** |
| **W** | `ahri-w-foxfire-investigation.md` | Sí | `w-projectile/ahri_w_foxfire_*.png` | `createAhriFoxFireVisual` | **Sí** |
| **E** | `ahri-e-charm-investigation.md` | Sí | `e-projectile/ahri_e_charm_sprite.png` | `createAhriCharmBoltVisual` | **Sí** |
| **R** | `ahri-r-rush-investigation.md` | Sí | `r-projectile/ahri_r_dash_capsule_sprite.png` | `createAhriSpiritRushVisual` | **Sí** |

## Comandos (raíz del repo)

```bash
npm run ahri:fetch-skin0
npm run ahri:download-spells
npm run ahri:extract-wad      # .scb desde Ahri.wad.client (LoL + CDTB)
npm run ahri:export-scb
npm run ahri:bake-ba
npm run ahri:bake-q-orb
npm run ahri:bake-w-foxfire
npm run ahri:bake-e-charm
npm run ahri:bake-r-dash
```

## Integración Phaser

- **Preload:** `loadAhriAuthenticVfx` + `applyAhriAuthenticVfxFilters` en `ArenaScene` (solo campeón Ahri).
- **Runtime:** factories en `ahriSpellVisuals.ts`; impactos W/E/R específicos; BA/Q/R genérico vía `spawnAhriBasicImpact` → chispas auténticas.
- Fallback procedural solo si falta el bake (`TEXTURE.ahriSpiritBolt` en BA).

Legacy sin uso en runtime Ahri: `ahriQOrbVisual.ts`, `loadAhriVfx.ts` (se pueden retirar en limpieza posterior).
