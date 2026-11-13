# Daniel Thomas — Grassland (evaluación pre-compra)

Documentación de la prueba visual aislada. **No integra tiles en Phaser.**

## Página de prueba

Con `npm run dev`, abrir:

`http://localhost:5173/dt-grassland-style-preview.html`

## Fuentes oficiales del pack

| Canal | URL |
|-------|-----|
| itch.io | https://danielthomasart.itch.io/2d-hand-painted-dungeon-tileset |
| Compra itch | https://danielthomasart.itch.io/2d-hand-painted-dungeon-tileset/purchase |
| Unity Asset Store | https://assetstore.unity.com/packages/2d/environments/2d-hand-painted-grassland-tileset-47763 |
| Portfolio | https://www.danielthomasart.com/ |

Precio referencia (oct 2026): **13 USD** en itch (JSON-LD de la ficha); **~14,99 USD** en Unity. Confirmar antes de pagar.

## Licencia (resumen)

- **itch:** el autor confirma en comentarios uso en **juegos comerciales**; **no redistribuir** el pack.
- **Unity:** Standard Unity Asset Store EULA (distinto canal; no mezclar archivos de ambas licencias sin revisar términos).

No hay **demo ZIP** ni tiles sueltos CC0 del autor para prueba in-engine.

## Imágenes usadas en el compositor

Solo **marketing** enlazado por HTTPS (itch portada + capturas Unity Asset Store). No se guardan en `public/assets/arena/`. No sustituyen la compra del pack.

## Tras comprar (fase siguiente, no hecha)

1. Extraer PNG 128×128 a `public/assets/arena/dt-grassland/` (sin commitear si la licencia lo prohíbe — revisar).
2. Mapa de ejemplo Tiled (incluido en el ZIP) → capa suelo + decor en Phaser.
3. Escala sugerida inicial: **1 px mundo = 1 px tile** o tilemap `tileWidth: 128` con zoom de cámara 0.5–1 según densidad de enemigos.
