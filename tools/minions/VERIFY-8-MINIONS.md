# Verificación — 8 minions SR (pre-extracción)

Comando: `npm run minions:verify-assets` (solo HEAD/bin.json en CommunityDragon + chequeo local de WAD).

## Resultado: los 8 están listos para el pipeline 3D→2D

| ID | LoL (SR) | Modelo (.skn RAW) | Textura (PNG RAW) | Animaciones (grafo) | idle + run | `skinScale` |
|----|----------|-------------------|-------------------|---------------------|------------|-------------|
| Blue melee | `SRU_OrderMinionMelee` | ✅ | ✅ | ✅ (10 clips) | ✅ | ~0.70 |
| Red melee | `SRU_ChaosMinionMelee` | ✅ | ✅ | ✅ (8) | ✅ | ~0.74 |
| Blue caster | `SRU_OrderMinionRanged` | ✅ | ✅ | ✅ (7) | ✅ | ~0.76 |
| Red caster | `SRU_ChaosMinionRanged` | ✅ | ✅ | ✅ (6) | ✅ | ~0.87 |
| Blue siege | `SRU_OrderMinionSiege` | ✅ | ✅ | ✅ (7) | ✅ `cannon_order_idle1` / `cannon_order_run1` | ~0.93 |
| Red siege | `SRU_ChaosMinionSiege` | ✅ | ✅ | ✅ (7) | ✅ | ~0.93 |
| Blue super | `SRU_OrderMinionSuper` | ✅ | ✅ | ✅ (6) | ✅ | ~1.05 |
| Red super | `SRU_ChaosMinionSuper` | ✅ | ✅ | ✅ (6) | ✅ | ~1.05 |

**Nota animaciones:** los `.anm` **no** están en RAW CDN (404). Las rutas existen en `animations/skin0.bin.json`; los bytes viven en el **WAD del cliente** (extractor Khada).

## Instalación local (tu PC)

| Recurso | Estado |
|---------|--------|
| `C:\Riot Games\League of Legends\Game\DATA\FINAL\Champions\SRU_*.wad.client` | ❌ No existen (minions no son campeones sueltos) |
| `...\Maps\Shipping\Map11.wad.client` | ✅ Presente (SR incluye minions) |
| Extracción recomendada | Khada `convert-wad SRU_OrderMinionMelee` (resuelve WAD/caché) — **solo lectura** en LoL con `--no-download` o caché `%USERPROFILE%\.khada-extractor` |

## Siege y Super — mismo pipeline

Misma estructura `SkinCharacterDataProperties`: `simpleSkin`, `texture`, grafo de animación. Solo cambia escala (`skinScale` mayor) y nombres de clip (`cannon_*`, `superminion_*`). El bake cenital de Jinx (`render-sheet.html` + Playwright) aplica igual; puede hacer falta ajustar `fill` / ortho half para encuadre.

## Dos niveles de “podemos usarlos”

1. **Técnicico (extract + render fan):** ✅ Los 8 tienen malla, textura y clips idle/run documentados; el flujo GLB → spritesheet es el mismo que Jinx. Bloqueo actual: hace falta **Khada extractor** (`KHADA_EXTRACTOR`) — no está configurado en este entorno.

2. **Producto / redistribución:** Sigue siendo **IP Riot**; ok para prototipo fan local; no implica licencia para publicar el juego con estos PNG.

## Prueba técnica acordada

Solo **blue melee** (`order-melee`) → `npm run minions:extract -- order-melee` → `npm run minions:render -- order-melee` → preview (`minionArt=baked`). **Sin** `ArenaScene`.
