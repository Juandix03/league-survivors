# Jinx W — sprite PNG (`jinx_w_zap_sprite.png`)

## Búsqueda externa (Google / Wikimedia / Fandom)

- **Wikimedia Commons:** solo cosplay / graffiti; **ningún** PNG del proyectil de ¡Chispas! en vuelo.
- **Fandom / iconos:** `Jinx Zap!.png` es **icono de habilidad** (HUD), no proyectil.
- **Google Imágenes:** capturas de gameplay con fondo de mapa; no assets reutilizables con transparencia.

## CommunityDragon (Riot, mirror fan)

| Archivo | Resultado |
|---------|-----------|
| `jinx_skin02_w_rocket.png` | **Mapa UV** (varias piezas en un cuadrado), no sprite. |
| `jinx_skin03_w_tazer_01.png` | **Mapa UV** de skin Slayer. |
| `jinx_base_w_mis_bullet_rgb.png` | Rampa de color 64×4. |
| `jinx_lightning.png` | Estela vertical (partícula). |
| Skin clásica base | **No** hay PNG tipo `jinx_r_mis.png` dedicado al misil W. |

## Archivo usado en el juego

**`jinx_w_zap_sprite.png`** (238×134, alpha)

- **Origen:** recorte y extracción de alpha desde  
  `jinx_base_w_lightning01.png`  
  (`Jinx_Base_W_Lightning01.tex`, skin clásica), vía CommunityDragon.
- **Script:** `npm run jinx:bake-w-sprite` → `tools/jinx-pipeline/bake-w-zap-sprite.mjs`
- **Licencia / uso:** contenido derivado de archivos de *League of Legends* (Riot); uso fan / no comercial acorde al proyecto.

**Limitación:** no es un render del mesh 3D del misil; es un **rayo eléctrico** oficial recortado para usar como sprite cenital. El misil completo en el cliente sigue siendo quad + partículas (ver `docs/jinx-w-missile-investigation.md`).

## Candidatos descartados (conservados en esta carpeta)

- `jinx_skin02_w_rocket.png`, `jinx_skin03_w_tazer_01.png`, etc. — solo referencia visual.
