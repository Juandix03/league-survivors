# Arena — assets de escenario

## Estado actual (pradera simple)

- **Suelo:** dos capas `TileSprite` con texturas procedurales `grass` / `grassAlt` (`rebakeGrassTextures` en `textures.ts`). Parallax suave vía `syncArenaGroundParallax` en `ArenaScene`.
- **Decor:** arbustos, flores y rocas baked, colocados solo en bordes (`scatterEdgeDecor.ts`). Centro ~820 px despejado.

## Referencias (no runtime)

`reference/` — imágenes de inspiración; no se cargan en el juego salvo pipeline opcional `npm run arena:prepare-grass`.

## Previews aisladas

| URL | Uso |
|-----|-----|
| `/meadow-preview.html` | Comparar procedural / CC0 / plano |
| `/beast-grass-preview.html` | Tilemap Beast (descartado; repetición de chunks) |

## Beast CC0

Solo en `beast-preview/` — ver `beast-preview/SOURCE.md`. No integrado en la arena principal.

## Gameplay

Cristales, proyectiles y VFX usan texturas en `textures.ts` — no confundir con decor de escenario.
