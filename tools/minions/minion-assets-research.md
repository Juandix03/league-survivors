# Minions de LoL — investigación (League Survivors)

**Fecha:** 2026-03-27  
**Alcance:** referencia técnica y legal. **No** integrar en `ArenaScene` ni redistribuir IP de Riot sin permiso escrito.

## Resumen ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| ¿Existen los 8 tipos en datos públicos? | **Sí**, en CommunityDragon (cliente LoL extraído). |
| ¿Formato útil directo en Phaser? | **No** — son **modelos 3D** (`.skn`) + **atlases de textura** (PNG ~512²), no sprites top-down. |
| ¿Licencia para shippear el juego? | **No** — contenido **100 % Riot**; [Legal Jibber Jabber](https://www.riotgames.com/en/legal) prohíbe usar IP (apariencia de personajes, ítems, etc.) **en juegos/apps** distribuibles. |
| ¿Qué hace la preview? | Sprites **originales inspirados** (CC0 del repo) + galería opcional CDN solo en local. |
| **Conclusión** | **B** (técnicamente accesibles; **no recomendable** redistribuir) → ruta de producción **C** con arte propio o CC0. |

---

## Equipos en datos del cliente

En Summoner’s Rift (`sru_*`):

| Rol en juego | Equipo azul (Order) | Equipo rojo (Chaos) |
|--------------|---------------------|---------------------|
| Cuerpo a cuerpo | `sru_orderminionmelee` | `sru_chaosminionmelee` |
| A distancia (caster) | `sru_orderminionranged` | `sru_chaosminionranged` |
| Cannon / Siege | `sru_orderminionsiege` | `sru_chaosminionsiege` |
| Super | `sru_orderminionsuper` | `sru_chaosminionsuper` |

Variantes ARAM / Howling Abyss (`ha_*`): mismos roles con prefijo `ha_orderminion*` / `ha_chaosminion*`.

**Prioridad visual SR:** usar carpetas `sru_*` salvo que se quiera el modelo de ARAM.

---

## Origen: CommunityDragon (RAW)

Base URL (patch flotante):

`https://raw.communitydragon.org/latest/game/assets/characters/{character}/skins/base/`

CommunityDragon **no otorga licencia** sobre el contenido: es un mirror comunitario de archivos del cliente. Los derechos siguen siendo de **Riot Games, Inc.**

### Tabla por unidad (base skin, SR)

| # | Unidad | Carpeta CDragon | Mesh (.skn) | Textura principal (ejemplo) | Tamaño atlas (muestra) |
|---|--------|-----------------|-------------|-----------------------------|-------------------------|
| 1 | Melee azul | `sru_orderminionmelee` | `order_minion_melee.skn` | `orderminion_melee_tx_cm.png` | **512×512** PNG |
| 2 | Melee rojo | `sru_chaosminionmelee` | `chaos_minion_melee.skn` | `chaosminion_melee_tx_cm.png` | **512×512** |
| 3 | Ranged azul | `sru_orderminionranged` | `order_minion_caster.skn` | `orderminion_caster_tx_cm.png` | **512×512** |
| 4 | Ranged rojo | `sru_chaosminionranged` | `chaos_minion_caster.skn` | `red_caster_tx_cm.png` | **512×512** |
| 5 | Siege azul | `sru_orderminionsiege` | `order_minion_siege.skn` | `order_minion_siege_tx_cm.png` | **512×512** |
| 6 | Siege rojo | `sru_chaosminionsiege` | `chaos_minion_siege.skn` | `chaos_minion_siege_tx_cm.png` | **512×512** |
| 7 | Super azul | `sru_orderminionsuper` | `blue_minion_superminion.skn` | `blue_superminion_tx_cm.png` | **512×512** |
| 8 | Super rojo | `sru_chaosminionsuper` | `red_minion_superminion.skn` | `red_superminion_tx_cm.png` | **512×512** |

También hay variantes `_red`, `_blue`, `2x_`, `4x_` (cromas / mipmaps) en la misma carpeta.

Metadatos (animaciones, materiales):  
`https://raw.communitydragon.org/latest/game/data/characters/{character}/skins/skin0.bin.json`

---

## Tipo de asset y pipeline hacia 2D (Phaser)

| Capa | Formato | Uso directo en Phaser |
|------|---------|------------------------|
| Textura | PNG atlas (diffuse / flipbook) | Solo como **imagen plana** o recorte manual; **no** es un sprite ya orientado top-down. |
| Geometría | `.skn` (binario Riot) | Requiere extractor (Khada, CDTB, etc.) → **GLTF**. |
| Animación | `.anm` + bin graphs | Requiere rig 3D + bake por frame. |

**Transformación típica para bullet-heaven top-down:**

1. Extraer skin → GLTF (Khada Extractor / pipeline comunitario).
2. Cámara **ortográfica** fija (~30–45° o vista “MOBA map” según referencia).
3. Render por frame de idle/walk → **spritesheet** PNG (p. ej. 64×64 o 128×128 por frame).
4. Ajustar escala vs Jinx (~64 px frame, `displayScale` ~1.1–1.2, `PLAYER_RADIUS` 22).
5. Filtro **NEAREST** para pixel-art coherente.
6. Sombras/elipse bajo pies (como `enemyFactory` actual).

Herramientas de referencia (no licencian el output):

- [Khada — Order Melee Minion](https://modelviewer.lol/extras/ha_orderminionmelee)
- [Khada docs — render ortho / texturas](https://docs.modelviewer.lol/debugging-model-pipeline)
- Wiki renders PNG (también Riot): [Category:Minion renders](https://wiki.leagueoflegends.com/en-us/Category:Minion_renders) — **no** usar en build distribuible.

**Data Dragon (oficial API de datos):** iconos cuadrados de campeones/ítems; **no** expone sprites listos de minions para gameplay. No sustituye el pipeline 3D→2D.

---

## Legalidad (Riot)

| Tema | Detalle |
|------|---------|
| Propiedad | Minions = **Game Content** / IP de Riot (modelo, textura, silueta reconocible). |
| Legal Jibber Jabber | Permite ciertos proyectos **fan no comerciales** con reglas; **prohíbe explícitamente** usar IP en **juegos y apps** (apariencia de personajes, ítems, etc.). |
| Developer General Policies | “**Do not create or develop games utilizing Riot’s IP**”; productos con API deben usar solo assets autorizados (Data Dragon, press kit, etc.) — minions 3D **no** están en esa lista para un survivor. |
| CommunityDragon | Acceso técnico ≠ permiso de uso comercial o redistribución. |
| Incluir PNG/GLB de minions en repo o build | **Problemático** para versión distribuible (Itch, web pública, stores). |
| Referencia en desarrollo | Ver modelos/texturas en viewer o CDN **localmente** para medir escala está bien como **investigación**; no commitear assets. |
| League Survivors | Juego jugable inspirado en LoL → encaja en lo que Riot **desaconseja/prohíbe** con assets oficiales; hace falta **arte original** o **CC0** claramente licenciado. |

Texto boilerplate que Riot pide en productos con API (referencia):  
*[Producto] isn’t endorsed by Riot Games…* — no convierte un survivor con minions rippeados en un uso permitido.

---

## Alternativas gratuitas (sin copiar Riot)

Objetivo: **3 tiers** (normal → siege → super) × **2 equipos** (frío/cálido o azul/rojo), silueta legible top-down.

| Recurso | Licencia | Encaje |
|---------|----------|--------|
| [Puny Characters](https://opengameart.org/content/puny-characters) | CC0 | 16×16, 8 dir, melee/bow — retintar azul/rojo, escalar tier por tamaño. |
| [16x16 Mini Characters](https://opengameart.org/content/16x16-mini-characters) | CC0 | Muchas unidades pequeñas; elegir 6–8 y asignar roles. |
| [Tiny Zelder Clone topdown](https://opengameart.org/content/tiny-zelder-clone-topdown-pack) | CC0 | Enemigo 16×16 4 dir — base para “minion genérico”. |
| [Top down soldiers](https://opengameart.org/content/pixel-art-top-down-soldiers) | CC0 | 32×32 — officer/spear como siege/super por escala. |
| **Bake procedural** (preview actual) | Propio | Siluetas inspiradas **sin** copiar malla/textura Riot — seguro para ship. |

Recomendación de producción: **CC0 retintado + 3 escalas** o **sprites propios** guiados por silueta (cuerpo redondo, arma, cañón, super grande).

---

## Preview aislada en este repo

| URL | Contenido |
|-----|-----------|
| `/minion-preview.html` | Jinx + 8 tipos **inspired** + barras de vida + pradera simple |
| Botón “Galería Riot (CDN)” | Carga texturas desde CommunityDragon **en el navegador**; banner legal; **no** incluido en build como assets |

Script de rutas (sin descarga): `npm run minions:list-cdragon-paths`

Verificación: `npm run minions:verify-preview`

---

## Mapeo sugerido gameplay futuro (solo diseño)

| Tier actual (`enemyArchetypes`) | Análogo minion |
|---------------------------------|----------------|
| `basic` | Melee o ranged normal |
| `fast` | Ranged (más chico/rápido) |
| `tank` | Siege o Super (radio/HP mayor) |

*No implementado en arena — solo alineación conceptual.*

---

## Conclusión final

**B — Podemos usarlos técnicamente pero no es recomendable distribuirlos.**

- **Técnico:** sí, vía CommunityDragon + pipeline 3D→ortho bake.  
- **Legal / producto:** no incluir assets Riot en League Survivors distribuible; la preview **jugable** usa sprites **inspired**; la galería CDN es **solo referencia local**.  
- **Camino recomendado:** **C** con CC0 o arte original — misma lectura de roles (normal / siege / super, azul vs rojo) sin copiar atlases oficiales.
