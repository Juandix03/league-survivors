# Jinx W (¡Chispas!) — investigación del proyectil (skin clásica)

## Hallazgo principal

**`Jinx_Base_W_Mis` no es un archivo `.scb`.** En `jinx-skin0-data.json` es una entrada
`VfxSystemDefinitionData` en:

`Characters/Jinx/Skins/Skin0/Particles/Jinx_Base_W_Mis`

Contiene **12 emisores** (Flash, Bullet, trails, sparks, etc.), no un mesh exportable con ese nombre.

## Emisor «Bullet» (cuerpo visible del misil)

| Campo | Valor |
|--------|--------|
| Primitiva | `VfxPrimitiveArbitraryQuad` (billboard, no malla 3D) |
| Textura | `Jinx_Lightning.tex` → `jinx_lightning.png` (128×512, estela eléctrica) |
| Tint | `Jinx_Base_W_Mis_Bullet_RGB.tex` → rampa 64×4 (no es sprite) |
| UV | `birthUvScrollRate` [0, **-5**] (scroll a lo largo del quad) |
| Blend | modo 4 (aditivo en cliente) |

En el cliente, el «proyectil» es un **quad orientado al movimiento** con **textura de rayo desplazándose**, más flashes/trails en otros emisores.

## ¿Existe `Jinx_Base_W_Mis.scb`?

No aparece en CommunityDragon (HTTP 404 en rutas probadas). Otros `.scb` referenciados en VFX globales (p. ej. `arrow01.scb`) tampoco están en el mirror público como binario descargable.

Herramientas conocidas para **mallas estáticas** `.scb`:

- [scb2obj](https://github.com/fasterthanlime/scb2obj) — requiere el `.scb` del cliente local
- [League Toolkit / lol2gltf](https://github.com/Crauzer/lol2gltf) — conversión SKN/gltf; no sustituye un `.scb` inexistente para esta W

**Khada GLB (222000):** nodos Minigun / Rocket Launcher; **no** incluye mesh del misil de W.

## Comparación con R

`Jinx_R_Mis` usa mesh en partículas; CommunityDragon expone **`jinx_r_mis.png`** ( bake / textura del cohete), no un pipeline equivalente verificado para W.

## Enfoque más fiel sin cliente LoL instalado

1. Reproducir el emisor **Bullet**: `TileSprite` + `jinx_lightning.png` + scroll UV + ADD + tint.
2. Núcleo opcional: `jinx_base_w_mis_flash.png` (ADD) en la punta — emisor Flash.
3. **No** usar celdas de `jinx_base_w_lightning02.png` como cuerpo del misil (son partículas del emisor «LIghtningJayce»).

## Para obtener malla 3D real (fuera del alcance del mirror)

1. Extraer `arrow01.scb` u otros `.scb` del WAD del cliente con [CommunityDragon Tooling (CDTB)](https://github.com/CommunityDragon/CDTB) o instalación local.
2. `scb2obj` → Blender → render ortográfico cenital → PNG con alpha.
3. Documentar ruta WAD verificada.
