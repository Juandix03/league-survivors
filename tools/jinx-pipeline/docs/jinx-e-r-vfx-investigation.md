# Jinx E / R — investigación VFX (skin base)

Fuente: `work/jinx-skin0-data.json` (`VfxSystemDefinitionData`) + PNG en CommunityDragon
`game/assets/characters/jinx/skins/base/particles/`.

## E — sistemas relevantes

| Clave recurso | Bin en dump | Rol en LoL |
|---------------|-------------|------------|
| `Jinx_E_Mis` | `Jinx_Base_E_Mis` | Proyectil **en vuelo** (3 granadas hacia el objetivo) |
| `Jinx_E_Mine_Set` | `Jinx_Base_E_Mine_Set` | **Impacto al posar** la trampa (~0,25 s) |
| `Jinx_E_Mine_Idle_Red` / `_Green` | *(mapa recursos; bin no en dump)* | VFX **persistente** en suelo (armada / inactiva) |
| `Jinx_E_Mine_Ready` / `_Ready_Red` | idem | Pulso “lista para explotar” |
| `Jinx_E_Mine_Trigger` | idem | Detonación |
| `Jinx_E_Fire` / `Jinx_E_Fire_Tar` | — | Fuego en enemigo enraizado |

### `Jinx_Base_E_Mis` (vuelo)

| Emisor | Textura (.tex → .png) | Blend | Notas |
|--------|------------------------|-------|--------|
| **Grenade** | `Jinx_Base_E_Mis_Grenade` → `jinx_base_e_mis_grenade.png` (128×128) | **1** (alpha normal) | Sprite **completo** pintado (cuerpo teal + interior magenta). Escala ~30. Rotación aleatoria. **No es glow.** |
| **Trail** | `Jinx_Base_E_Mis_Trail` → `jinx_base_e_mis_trail.png` | — | Trail; alpha over lifetime 0→1→0 |
| **Grenade_Blur** | `Jinx_Base_E_Mis_Grenade_blur` → `jinx_base_e_mis_grenade_blur.png` (128×128) | **1** | Quad borroso; **halo de color** (cyan/magenta/naranja). Alpha animado 0→1→0.3→0. **Capa separada del cuerpo.** |

### `Jinx_Base_E_Mine_Set` (solo al posar)

| Emisor | Textura | Blend | Notas |
|--------|---------|-------|--------|
| Ground_Hit | `Jinx_Explosion_Smoke` | 1 | Humo teñido (birthColor naranja/magenta) |
| Hit_Center_Flash | `Jinx_Base_E_Splat_01` → `jinx_base_e_splat_01.png` | **4** (ADD) | Flash central; **solo activación** |
| Temp_Ray / Temp_Ray1 | `Jinx_Base_E_Splats_01/02` | 4 | Rayos ADD púrpura/blanco |
| **Type11** | `Jinx_Base_E_Mis_Type11` + mesh `arrow01.scb` | — | **Malla 3D** 0,25 s; `particleColorTexture`: `color-rampdown.tex`. |
| Skin01_Type11 | `Jinx_Skin01_E_Mis_Type11` | — | Variante skin |

**`jinx_base_e_mis_type11.png` en CD mide 512×8** → es compatible con **rampa/máscara UV**, no un sprite de Mascafuegos. El color del mesh Type11 viene de **`color-rampdown`** + shader de partículas, no de un PNG único “cuerpo”.

### ¿Qué es `jinx_base_e_mis_grenade.png`?

- **Un sprite de la granada/Mascafuegos en vuelo**, alpha normal, **con color ya pintado**.
- **No** es la textura completa del VFX de trampa en reposo (`Mine_Idle_*` no está en el dump).
- **No** debe mezclarse con `jinx_base_e_splat_01` como cuerpo idle: el splat es **ADD de impacto/flash** (`Hit_Center_Flash`).

### Capas que faltaban en Phaser (idle aproximado con assets CD)

1. **Cuerpo:** `jinx_base_e_mis_grenade.png` — **NORMAL (blend 1)**, alpha 1.
2. **Halo:** `jinx_base_e_mis_grenade_blur.png` — **ADD o alpha** con alpha animado (emisor Grenade_Blur).
3. *(Opcional fidelidad alta)* humo/`Splats` solo en spawn/trigger, no en idle.

---

## R — `Jinx_Base_R_Mis`

| Emisor | Textura | Blend | Notas |
|--------|---------|-------|--------|
| **Missle** | `Jinx_R_Mis.tex` + mesh **`Jinx_R_Mis.scb`** | **3** | **Malla 3D**; lifetime 50 s; hijo `Jinx_R_Rocket_Child` |
| Projected | `Aura_Self.tex` | 4 | Quad ADD; birthColor **(1, 0.30, 0.02, 0.38)** |
| GoodOne / GoodOne1 | `Jinx_Base_R_GroundSmoke02` | 1 | Humo alpha ~0.4 |
| Temp_GroundGlow / 1 | `Jinx_R_Shape.tex` | 1 y 4 | Glow naranja |
| FakeShadow | `Aura_Self.tex` | 1 | Sombra oscura alpha 1 |

### ¿Qué es `jinx_r_mis.png`?

- **Atlas UV 256×256** para la malla **`Jinx_R_Mis.scb`**, no un sprite de billboarding.
- Mostrarlo como `Image` plano + **ADD** muestra fragmentos del atlas → cohete “fantasma” / descolorido.
- El `.scb` **no** está en el mirror RAW de CD (igual que `arrow01.scb` de la E).

### Capas 2D aproximables sin `.scb`

1. **Cuerpo opaco:** sprite horneado desde malla+atlas (pipeline futuro) **o** fallback procedural hasta tener bake.
2. **Projected:** `aura_self.png` ADD con color del emisor (constante del bin).
3. **Glow:** `jinx_r_shape.png` (normal + ADD como dos emisores).
4. **Estela:** `jinx_base_r_rocketfire_revision.png` ADD.
5. **Humo:** `jinx_base_r_groundsmoke02.png` (quads en suelo; opcional en top-down).

---

## Modos de blend (referencia cliente)

- **1** — Alpha normal (premultiplied / over).
- **3** — Usado en malla del cohete (opaque-friendly en mesh pass).
- **4** — Aditivo (ADD).

## Conclusión práctica

| Asset | Interpretación |
|-------|----------------|
| `jinx_base_e_mis_grenade.png` | Cuerpo **sprite** de la granada (vuelo); válido como aprox. idle en 2D con **NORMAL**. |
| `jinx_base_e_mis_grenade_blur.png` | **Glow** separado; imprescindible para saturación “LoL”. |
| `jinx_base_e_mis_type11.png` | **Rampa/máscara** mesh; no sustituto del grenade PNG. |
| `jinx_base_e_splat_01.png` | **Solo trigger/flash** ADD. |
| `jinx_r_mis.png` | **Atlas de malla**; no usar como sprite único; hace falta bake o fallback + capas 2D.
