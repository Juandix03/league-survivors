# Jinx R — sprite (`jinx_r_rocket_sprite.png`)

## Origen

1. **Malla:** `Jinx_R_Mis.scb` extraída del WAD del cliente  
   `Game/DATA/FINAL/Champions/Jinx.wad.client`  
   (`assets/characters/jinx/skins/base/particles/jinx_r_mis.scb`).
2. **Textura UV:** `jinx_r_mis.png` (CommunityDragon / mismo WAD → `.tex`).
3. **Export:** `tools/jinx-pipeline/scb-export-obj.py` → `work/jinx_r_mis.obj`.
4. **Bake:** cámara ortográfica cenital (Three.js) + `jinx_r_mis.png` en material estándar.

El mirror RAW de CommunityDragon **no** publica `.scb`; hace falta el WAD local o CDTB `wad-extract`.

## Regenerar

```bash
# 1) Extraer scb (requiere LoL instalado; ajustá la ruta al WAD)
cd tools/jinx-pipeline
python -m cdtb wad-extract "C:/Riot Games/League of Legends/Game/DATA/FINAL/Champions/Jinx.wad.client" -o work/jinx-wad-extract -p "*r_mis.scb" -u no

# 2) OBJ
python scb-export-obj.py work/jinx-wad-extract/assets/characters/jinx/skins/base/particles/jinx_r_mis.scb work/jinx_r_mis.obj

# 3) PNG (Playwright + Three)
npm run jinx:download-spells   # desde raíz del repo, si falta jinx_r_mis.png
node bake-r-rocket-sprite.mjs
```

Desde la raíz: `npm run jinx:bake-r-sprite`

## Uso en Phaser

- Textura: `JINX_R_PROJECTILE_SPRITE` (`jinx-r-rocket-sprite`).
- **Blend:** `NORMAL` en el cuerpo; estela en `spawnRTrailPuff` (ADD).
- Rotación: `JINX_R_PROJECTILE_ROTATION_OFFSET` (el bake apunta “arriba”, el juego usa ángulo hacia el objetivo).
