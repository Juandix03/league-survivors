# Pipeline Ahri clásica (skin 0) → spritesheet cenital

Mismo flujo que `tools/jinx-pipeline/README.md`, adaptado a Ahri.

## Origen del GLB

- URL: `https://cdn.modelviewer.lol/lol/models/ahri/103000/model.glb`
- `103000` = campeón 103 (Ahri) + skin 0 (clásica).

## Comandos

```bash
cd tools/ahri-pipeline
npm install
npx playwright install chromium   # primera vez
npm run download                  # → work/ahri_skin0_khada.glb
npm run render                    # → public/assets/champions/ahri/spritesheet_authentic_hd_test.png
```

Desde la raíz del repo: `npm run ahri:download` y `npm run ahri:render`.

## VFX de habilidades (como Jinx)

1. `npm run ahri:fetch-skin0` — nombres `Ahri_Base_*_mis` desde bin JSON.
2. `npm run ahri:download-spells` — PNG curados (CommunityDragon).
3. `npm run ahri:extract-wad` — `.scb` desde `Ahri.wad.client` (cliente LoL + CDTB).
4. `npm run ahri:export-scb` — OBJ para bake.
5. Bakes ortográficos:
   - `npm run ahri:bake-ba`
   - `npm run ahri:bake-q-orb`
   - `npm run ahri:bake-w-foxfire`
   - `npm run ahri:bake-e-charm`
   - `npm run ahri:bake-r-dash`

Documentación: `tools/ahri-pipeline/docs/`.  
Sprites: `public/assets/vfx/ahri/*-projectile/` (ver `SOURCE.md` en cada carpeta).  
Capa Phaser (sin cablear gameplay aún): `src/game/vfx/ahri/`.

## Grid (Phaser)

| Fila | Frames | Clip |
|------|--------|------|
| 0 idle | 0–7 (HD) | `Idle1_Base` |
| 1 walk ↓ | 8–15 | `Run_Base` |
| 2 walk ↑ | 16–23 | `Run_Base` + rotación π |
| 3 walk → | 24–31 | `Run_Base` + rotación π/2 |

## Probar in-game

`http://localhost:5173/?champion=ahri`
