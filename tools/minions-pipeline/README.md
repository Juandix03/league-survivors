# Minions → sprites cenitales (preview only)

Proyecto **fan / for fun**. Este pipeline **no modifica** League of Legends ni el juego principal (`ArenaScene` sigue igual).

## Qué hace y qué no hace

| Acción | ¿Ocurre? |
|--------|----------|
| Leer archivos en `C:\Riot Games\League of Legends\Game\...` | Solo si **vos** corrés extract local (lectura) |
| Escribir parches / borrar / editar dentro de la carpeta de LoL | **Nunca** |
| Abrir el cliente, tocar registry, anti-cheat, Vanguard | **Nunca** |
| Salida del repo | Solo `tools/minions-pipeline/work/` y `public/assets/minions-preview/baked/` |
| Descarga opcional (Khada/CDTB) | Solo a caché del usuario (`%USERPROFILE%\.khada-extractor\cache\`) — no es tu install |

Los minions SR viven sobre todo en **`Map11.wad.client`**, no como `Aatrox.wad.client`. Por eso no alcanza con copiar el `download-glb.mjs` de Jinx (`lol/models/jinx/…` en CDN): los minions están en el grupo **extras** del CDN Khada.

## Requisitos (preview bake)

- `npm install` + `npx playwright install chromium` (igual que Jinx)
- Para **extract local** (opcional): .NET SDK 8+, Python + `pip install cdtb`, League instalado

## Ruta recomendada — sin clonar Khada (Windows)

El repo `https://github.com/Khada-Model-Viewer/khada` responde **Repository not found** (privado o restringido). La [documentación del extractor](https://docs.modelviewer.lol/extractor) dice que hay binarios en GitHub Releases, pero **no hay un release público verificable** en ese org.

Los 8 minions SR tienen **`model.glb` en el CDN público de Khada** (grupo extras, skin `0`), mismo esquema que Jinx pero bajo `/extras/models/`:

| Alias npm | CDN (HEAD 200 verificado) |
|-----------|---------------------------|
| `order-melee` | `https://cdn.modelviewer.lol/extras/models/ha_orderminionmelee/0/model.glb` |
| `chaos-melee` | `…/ha_chaosminionmelee/0/model.glb` |
| `order-ranged` | `…/ha_orderminionranged/0/model.glb` |
| `chaos-ranged` | `…/ha_chaosminionranged/0/model.glb` |
| `order-siege` | `…/ha_orderminionsiege/0/model.glb` |
| `chaos-siege` | `…/ha_chaosminionsiege/0/model.glb` |
| `order-super` | `…/ha_orderminionsuper/0/model.glb` |
| `chaos-super` | `…/ha_chaosminionsuper/0/model.glb` |

Viewer web: [Order melee extras](https://modelviewer.lol/extras/ha_orderminionmelee).

### Paso 1 — Descargar GLB (prueba `order-melee`)

```bash
npm run minions:download-glb -- order-melee
```

Escribe `tools/minions-pipeline/work/glb/order-melee.glb` (no sobrescribe si ya existe).

### Paso 2 — Bake ortográfico

```bash
npm run minions:render -- order-melee
```

Genera `public/assets/minions-preview/baked/order-melee.png` → preview HTML (`minionArt=baked`), no arena.

## Extract local (opcional, solo si tenés el binario Khada)

Si más adelante conseguís `wad-extractor` o un publish de `LeagueConvert.CommandLine`:

```powershell
$env:WAD_EXTRACTOR_EXE = "D:\tools\wad-extractor.exe"
# o bien:
$env:KHADA_EXTRACTOR = "D:\dev\khada\packages\extractor\LeagueConvert.CommandLine"
npm run minions:extract -- order-melee
```

CLI documentada: `convert-wad SRU_OrderMinionMelee -o … -s -a --skins 0 --no-download -l <League>` ([extractor docs](https://docs.modelviewer.lol/extractor)).

## Otras herramientas (no sustituyen el pipeline completo)

| Herramienta | Release verificado | ¿Sirve para nuestro `model.glb`? |
|-------------|-------------------|----------------------------------|
| [Crauzer/lol2gltf](https://github.com/Crauzer/lol2gltf/releases) (`lol2gltf.exe`) | Sí | Solo con `skn2gltf` si ya tenés `.skn`/`.skl`/`.anm` extraídos del WAD; no resuelve Map11 solo |
| [LeagueToolkit/wadtools](https://github.com/LeagueToolkit/wadtools/releases) v0.5.7 `wadtools-0.5.7-windows-x64.zip` | Sí | Extrae/lista WAD; **no** exporta GLB animado |
| Khada `wad-extractor` precompilado | No público | Es lo que usa `minions:extract` local |

## Alias ↔ personaje Riot (extract local)

| Alias npm | Personaje extractor |
|-----------|---------------------|
| `order-melee` | `SRU_OrderMinionMelee` |
| `chaos-melee` | `SRU_ChaosMinionMelee` |
| `order-ranged` | `SRU_OrderMinionRanged` |
| `chaos-ranged` | `SRU_ChaosMinionRanged` |
| `order-siege` | `SRU_OrderMinionSiege` |
| `chaos-siege` | `SRU_ChaosMinionSiege` |
| `order-super` | `SRU_OrderMinionSuper` |
| `chaos-super` | `SRU_ChaosMinionSuper` |

## Animaciones (referencia CDragon)

Clips típicos en datos: `minion_melee_idle.anm`, `minion_melee_run.anm` — en el GLB del CDN los nombres pueden variar; el render elige por heurística (`Idle1_Base`, `Run_Base`).
