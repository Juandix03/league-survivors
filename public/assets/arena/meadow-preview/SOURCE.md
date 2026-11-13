# Meadow preview — assets

Solo para `/meadow-preview.html`. **No** integrado en `ArenaScene`.

## Pasto hand-painted (opción “painted”)

| Archivo | Fuente | Licencia |
|---------|--------|----------|
| `grass-handpainted-a.png` | [Hand Painted Grass — PamNawi](https://opengameart.org/content/hand-painted-grass) (`grass.png`) | **CC0** |
| `grass-handpainted-b.png` | Mismo pack (`grass3.png`; `grass2.png` en OGA devolvía archivo inválido al descargar) | **CC0** |

Uso comercial permitido. Atribución opcional.

## Pasto procedural (opción “procedural”)

Generado en runtime por `rebakeGrassTextures()` en `src/game/textures.ts` (sin archivos externos).

## Decoración

Sprites baked en `bakeArenaTextures()` (`bush`, `flower`, `rock`, etc.) — colocados solo fuera del radio de combate en `scatterEdgeDecor.ts`.
