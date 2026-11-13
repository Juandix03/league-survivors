# Ahri BA — sprite (`ahri_ba_magicball_sprite.png`)

## Origen

1. **Malla:** `common_magicball.scb` en `Ahri.wad.client`  
   `assets/characters/ahri/skins/base/particles/common_magicball.scb`
2. **UV:** `ahri_base_ba_orbbackground.tex` → PNG CommunityDragon  
   `public/assets/vfx/ahri/ahri_base_ba_orbbackground.png`
3. **Export:** `tools/ahri-pipeline/scb-export-obj.py` → `work/common_magicball.obj`
4. **Bake:** cámara ortográfica cenital (Three.js + Playwright) — `bake-mesh-sprite.mjs`

## Regenerar

```bash
npm run ahri:extract-wad    # requiere cliente LoL + CDTB
npm run ahri:export-scb
npm run ahri:download-spells
npm run ahri:bake-ba
```

## Uso en Phaser

- Clave: `ahri-ba-magicball-sprite` (`AHRI_BA_PROJECTILE_SPRITE` en `src/game/vfx/ahri/ahriProjectileSprites.ts`)
- Blend: `NORMAL` en el cuerpo; flash/trail con partículas `ba_speed_flash`, `ba_trail2` (ADD).

**No** usar `TEXTURE.ahriSpiritBolt` (procedural) en producción.
