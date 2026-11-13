# Lux spell pipeline (serio)

Lux **no** empaqueta cada habilidad como un solo misil 3D (cf. `Jinx_R_Mis.scb`). En skin base, Q/W/E/R son **sistemas de partículas** en los `.bin` (`LuxLightBindingMis`, `LuxPrismaticWaveMissile`, etc.) que combinan varios SCB + texturas.

## Qué sí podemos extraer (como Jinx R)

1. **WAD local** (`Lux.wad.client`) → `cdtb wad-extract`
2. **SCB → OBJ** → `scb-export-obj.py` (desde `tools/ahri-pipeline`)
3. **Bake ortográfico** → PNG con UV reales (`bake-mesh-sprite.mjs`)
4. **Capas + animación** → varios bakes + sheet de rotación (Q)

## Comandos (desde la raíz del repo)

Requisitos: LoL instalado, `pip install cdtb`, `npm run lux:install`.

```powershell
npm run lux:serious
```

Equivalente manual:

```powershell
npm run lux:fetch-skin0      # bin JSON (nombres de sistemas)
npm run lux:download-spells  # PNG CommunityDragon
npm run lux:extract-wad      # SCB/TEX del WAD (LUX_WAD si hace falta)
npm run lux:export-scb
npm run lux:bake-spells      # Q/W/E/R bakes estáticos
npm run lux:bake-q-sheet     # Q lateral (detalle)
npm run lux:bake-q-top-sheet # Q top-down 8 frames — cuerpo en arena
npm run lux:bake-e-top-sheet # E kugel top-down 8 frames (expo + sphere_e_01)
npm run lux:bake-r-top       # R beam strips + pulse sheet (lazurbeam / core_mult)
```

Salida: `public/assets/vfx/lux/baked/`

## Piezas base skin (Q)

| SCB | Textura típica | Uso |
|-----|----------------|-----|
| `lux_base_slash.scb` | `lux_q_shape` | Cuerpo del binding (sheet animada) |
| `lux_base_q_portaledge_circle.scb` | `lux_q_shape` | Anillo portal |
| `lux_base_q_circle_fixed.scb` | `lux_base_q_gradient_1` | Anillo de “root” al impacto |
| `lux_base_expo_cylinder.scb` | `lux_base_w_prism` | Onda W (side bake) |
| `lux_base_expo_cylinder.scb` | `lux_base_w_bw_shield_2d` | Barrera W |

## Límite honesto

Sin reimplementar el **runtime de partículas** de Riot, no hay clon pixel-perfect. Este pipeline es el mismo enfoque que **Ahri/Jinx**: mallas + UV reales, capas en Phaser, hitbox/indicadores legibles en gameplay.

Para ir más lejos: `bin-dump` del efecto concreto, más emisores, skins con `*_q_mis_*.scb` (ej. skin19/70) como referencia de malla de misil.
