# Dirección “meadow” — fondo simple

## Qué reutilizamos del repo

| Pieza | Ubicación | Rol en preview |
|-------|-----------|----------------|
| Pasto tileable procedural | `textures.ts` → `rebakeGrassTextures` | 2× `TileSprite` 2560², parallax suave |
| Decoración top-down | `bakeArenaTextures` (arbusto, flor, roca…) | Scatter en bordes, centro despejado |
| Jinx / enemigos / proyectiles demo | Mismos módulos que Beast preview | Comparar legibilidad |
| Mundo 2560×2560, cámara zoom 1 | `constants.ts` + escena preview | Sin cambios en Arena |

## LoL / Riot — ¿podemos usar el mapa real?

| Fuente | Qué ofrece | ¿Usar en League Survivors? |
|--------|------------|----------------------------|
| Cliente / CommunityDragon (mapas, splats, árboles SR) | Geometría y texturas del juego | **No recomendado.** [Legal Jibber Jabber](https://www.riotgames.com/en/legal): **prohibido usar IP de Riot en juegos/apps**; ToS reserva mapas y landscape. No es redistribución libre. |
| [Data Dragon](https://developer.riotgames.com/docs/lol) | Stats, iconos 2D, splash, algunos assets 2D oficiales | **No incluye** tileset de suelo de Summoner’s Rift listo para top-down. API ≠ licencia de arte de mapa. |
| Riot API / Developer Portal | Datos de partida, algunos assets TFT/LoR/Valorant | No sustituye texturas de terreno de LoL para un survivor. |
| Pipelines actuales Jinx (Khada / CD) | Personaje derivado de IP Riot | Ya asumís riesgo fan/comercial aparte; **no extiende** a copiar el mapa. |

**Conclusión:** para un producto jugable, conviene **CC0 / libre** con look “campo verde” (PamNawi) o **procedural propio** (ya en el repo), no extraer SR.

## Preview

`npm run dev` → `/meadow-preview.html`

Verificación: `npm run arena:verify-meadow-preview`
