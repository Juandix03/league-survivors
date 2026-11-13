# Jinx — assets visuales (etapa 1)

## Archivo actual

| Archivo | Uso |
|---------|-----|
| `spritesheet.jpg` | Hoja 256×256, frames 64×64 (4×4). Prototipo con fondo magenta. Dev: `?jinxSheet=prototype`. |
| `spritesheet_authentic_hd_8dir.png` | Bake 256×256/frame, 8 direcciones. **Activo por defecto en el juego.** |
| `spritesheet_authentic_test.png` | Bake 64×64/frame. Vista previa: `?jinxSheet=authentic`. |
| `spritesheet_authentic_hd_test.png` | Bake 256×256/frame (1024×1024 sheet). Vista previa: `?jinxSheet=authentic-hd`. Regenerar: `npm run jinx:render:hd`. |

## Animaciones esperadas (Phaser)

| Clave | Frames (índice) | Fila |
|-------|-----------------|------|
| `jinx-idle` | 0–3 | Reposo |
| `jinx-walk-down` | 4–7 | Caminar sur |
| `jinx-walk-up` | 8–11 | Caminar norte |
| `jinx-walk-side` | 12–15 | Caminar este (espejar en X para oeste) |

## Sustitución por sprites finales

Para usar arte propio o con licencia (p. ej. bajo [Riot Fan Content Policy](https://www.riotgames.com/en/legal/lol-riot-games-online-services-terms-of-use)):

1. Reemplazá `spritesheet.jpg` por un PNG/JPG con la **misma cuadrícula** (64×64, 4×4) o actualizá `frameWidth` / `frameHeight` en `src/game/champions/jinx.ts`.
2. Opcional: añadí fila extra de disparo (`jinx-shoot-*`) y registrá la animación en `createChampionAnimations`.
3. Proyectiles: `public/assets/champions/jinx/bolt.png` (16×16) — cuando exista, el loader lo usará en lugar del texture baked.

## Pendiente recomendado

- Animaciones dedicadas de **disparo** y **golpe recibido** (frames propios).
- Sprites de **Pow-Pow / Fishbones** como capa opcional.
- Atlas JSON si pasás a hojas irregulares.
