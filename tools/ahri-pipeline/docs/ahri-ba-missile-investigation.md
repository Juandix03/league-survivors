# Ahri — autoataque (`Ahri_BA_mis`)

## Sistema en el cliente

| Campo | Valor |
|--------|--------|
| Spell | `AhriBasicAttack`, `AhriBasicAttack2`, `AhriCritAttack` |
| VFX path (skin0) | `Characters/Ahri/Skins/Skin0/Particles/Ahri_Base_BA_mis` |
| Evento SFX | `Play_sfx_Ahri_AhriBasicAttack_OnMissileLaunch` |

En `skins_skin0.bin.json` (CommunityDragon) **no hay** PNG `ahri_base_ba_mis.png` en el mirror: el misil es un **sistema de partículas** (quads + trails + motes), no un sprite único.

## Recursos reales identificados (WAD `Ahri.wad.client`)

| Archivo | Rol |
|---------|-----|
| `common_magicball.scb` | Malla estática del proyectil mágico (compartida; usada en BA) |
| `ahri_base_ba_orbbackground.tex` | UV / glow del orbe |
| `ahri_base_ba_mote_01.tex` | Mote brillante |
| `ahri_base_ba_trail2.tex` | Estela |
| `ahri_base_ba_glow_corona.tex` | Corona en cast/impacto |
| `ahri_base_ba_hit_tar_sparks.tex` | Impacto |
| `ahri_base_ba_speed_flash.tex` | Flash de salida |

## Pipeline (paralelo a Jinx R / W)

1. `npm run ahri:extract-wad` — extrae `.scb` / `.tex` locales.
2. `python scb-export-obj.py` → `work/common_magicball.obj`
3. PNG CommunityDragon para UV: `ahri_base_ba_orbbackground.png`
4. `npm run ahri:bake-ba` — bake ortográfico → `ba-projectile/ahri_ba_magicball_sprite.png`

## Phaser (pendiente de cableado en `ArenaScene`)

- Textura: `AHRI_BA_PROJECTILE_SPRITE` en `src/game/vfx/ahri/ahriProjectileSprites.ts`
- Factory: `createAhriBasicProjectileVisual()` en `ahriSpellVisuals.ts`
- Trails/impacto: partículas `ba_trail2`, `ba_hit_tar_sparks` (ADD/scroll), no como `Image` única.
