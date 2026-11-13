# Pipeline Jinx clásica (skin 0) → spritesheet cenital

Genera `public/assets/champions/jinx/spritesheet_authentic_test.png` (256×256, 4×4×64px) compatible con `championAssets.ts`. **No reemplaza** `spritesheet.jpg` hasta que apruebes la vista previa in-game.

## Procedimiento más simple (recomendado)

| Paso | Quién | Qué |
|------|--------|-----|
| 1 | Automático | Descargar GLB procesado por [Khada](https://modelviewer.lol/) (datos del cliente Riot) |
| 2 | Automático | Render ortográfico cenital con Three.js + Playwright |
| 3 | Vos | Probar en el juego con `?jinxSheet=authentic` |
| 4 | Vos (opcional) | Afinar escala/rotación en Blender y volver a renderizar |

### Origen del GLB

- URL: `https://cdn.modelviewer.lol/lol/models/jinx/222000/model.glb`
- `222000` = campeón 222 (Jinx) + skin index 0 (clásica).
- Animaciones incluidas (entre otras): `Idle1_Base`, `Run_Base`, `Attack1`… (64 clips).
- Khada convierte WAD del cliente LoL a GLTF; el IP sigue siendo de Riot — uso fan no comercial + disclaimer.

### Comandos (desde repo)

```bash
cd tools/jinx-pipeline
npm install
npx playwright install chromium   # solo la primera vez
npm run download                  # ~6.5 MB → work/jinx_skin0_khada.glb
npm run render                    # → public/.../spritesheet_authentic_test.png
```

## Alternativa: extraer vos mismo del cliente

Si preferís no usar el CDN de Khada o querés el GLB “crudo”:

### Opción A — Khada extractor + .NET (más simple que lol2gltf manual)

1. Instalá [.NET SDK 8+](https://dotnet.microsoft.com/download).
2. Cloná Khada: `git clone https://github.com/khada-lol/modelviewer.lol.git`
3. En `packages/extractor`:

```bash
dotnet run --project LeagueConvert.CommandLine -- convert-wad Jinx -o output/jinx -s -a --skins 0 --live
```

- Con League instalado: auto-detecta la ruta.
- Sin cliente: necesitás `pip install cdtb` (Python 3.10–3.12) para que baje el WAD desde Riot/CDN ([docs extractor](https://docs.modelviewer.lol/extractor)).

Salida típica: `output/jinx/.../model.glb` + PNGs de texturas.

### Opción B — CommunityDragon + lol2gltf

- Malla base: [jinx.skn](https://raw.communitydragon.org/latest/game/assets/characters/jinx/skins/base/jinx.skn)
- Animaciones (manifest): [skin0.bin.json](https://raw.communitydragon.org/latest/game/data/characters/jinx/animations/skin0.bin.json)
- Herramienta: [Crauzer/lol2gltf](https://github.com/Crauzer/lol2gltf) (`skn2gltf` con `.skl` y carpeta `.anm`).

Más pasos manuales; usá A salvo que ya tengas extracción WAD.

## Grid del spritesheet (igual que Phaser)

| Fila | Frames | Clip | Rotación Y (rad) |
|------|--------|------|------------------|
| 0 idle | 0–3 | `Idle1_Base` | 0 (referencia) |
| 1 walk ↓ | 4–7 | `Run_Base` | 0 |
| 2 walk ↑ | 8–11 | `Run_Base` | π |
| 3 walk → | 12–15 | `Run_Base` | π/2 (flip X en juego = ←) |

Ajustá `ROT` en `render-sheet.mjs` si una dirección queda desfasada.

### Disparo (pendiente)

El GLB incluye `Attack1`–`Attack6` (minigun). La cuadrícula 4×4 actual **no** tiene fila de disparo. Próximo paso: ampliar a 5×4 o atlas aparte y registrar `jinx-shoot` en `createChampionAnimations`.

## Blender (ortográfico manual)

Si querés control fino (luces, escala, sombra):

1. Importá `work/jinx_skin0_khada.glb` (File → Import → glTF).
2. Cámara ortográfica en **+Y**, `Scale` ~1, encuadre ~1.35 unidades (como en `render-sheet.html`).
3. Clips NLA: `Idle1_Base`, `Run_Base`; rotá el armature/root 0 / π / π/2 por fila.
4. Render 64×64 PNG por frame → composición 256×256.

Script de referencia: `blender/render_jinx_spritesheet.py` (ejecutar dentro de Blender).

## Probar en League Survivors

```bash
npm run dev
```

- **Provisional (default):** `http://localhost:5173/`
- **Bake auténtico:** `http://localhost:5173/?jinxSheet=authentic`

Mecánicas, XP, mejoras y combate no cambian; solo textura/clave del sheet.

## Archivos generados por mí / por vos

| Archivo | Origen |
|---------|--------|
| `spritesheet_authentic_test.png` | **Generado** — render desde GLB Khada (datos Riot) |
| `spritesheet.jpg` | **Sin tocar** — arte provisional |
| `work/jinx_skin0_khada.glb` | **Descargado** — gitignored (re-descargable) |
