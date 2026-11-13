# Ahri Q — Orbe del engaño (`Ahri_Base_Q_mis` / `Ahri_Base_Q_mis_02`)

## Sistema en el cliente

| Campo | Valor |
|--------|--------|
| Spell | `AhriQAbility` / `AhriQMissile`, `AhriQReturnMissile` |
| VFX outbound | `Characters/Ahri/Skins/Skin0/Particles/Ahri_Base_Q_mis` |
| VFX return | `Characters/Ahri/Skins/Skin0/Particles/Ahri_Base_Q_mis_02` |
| SFX | `Play_sfx_Ahri_AhriQMissile_OnMissileLaunch`, return `AhriQReturnMissile` |

No existe PNG `ahri_base_q_mis.png` en CommunityDragon: el orbe visible combina **mesh + texturas + trails**.

## Mesh principal (extraído del WAD)

| Archivo | Notas |
|---------|--------|
| `ahri_base_q_sphere_01.scb` | Esfera del orbe (242 verts) — **cuerpo del misil Q** |
| `ahri_base_q_frontcapsule.scb` | Cap delantera adicional (cast) |
| `ahri_base_q_swirls_01.scb` | Swirls internos |

## Texturas (emisores / UV)

| PNG (CDragon) | Uso |
|---------------|-----|
| `ahri_base_q_orbbackground.png` | UV del outbound (daño mágico) |
| `ahri_base_q_orbedge.png` | Borde / fase return (true damage tint en cliente) |
| `ahri_base_q_trail_01.png`, `_02` | Estelas |
| `ahri_q_shape.png` | Máscara/shape — **no** usar como sprite plano del orbe |

## Bakes generados

| Sprite | Origen |
|--------|--------|
| `q-projectile/ahri_q_orb_outbound_sprite.png` | `q_sphere_01.obj` + `q_orbbackground.png` |
| `q-projectile/ahri_q_orb_return_sprite.png` | `q_sphere_01.obj` + `q_orbedge.png` |

Regenerar: `npm run ahri:bake-q-orb` (requiere OBJ + PNG + Playwright).

## Phaser (pendiente de cableado)

- `createAhriQOrbVisual(scene, x, y, depth, phase: 'out' | 'return')`
- Trails: `TileSprite` / partículas con `q_trail_01` (fase 2, como Jinx W strip).
