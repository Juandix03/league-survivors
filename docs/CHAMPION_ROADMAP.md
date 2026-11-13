# Roadmap campeones (League Survivors)

## Hecho

| Etapa | Contenido |
|-------|-----------|
| **0** | `ChampionId`, meta unlock (Jinx gratis, Ahri 300), `?champion=` solo dev / desbloqueo real |
| **1** | Ahri jugable: movimiento, anim HD (pipeline Khada), auto-ataque mágico, mejoras globales |
| **1b** | Pipeline `tools/ahri-pipeline/` + sheet auténtico integrado |

## En curso / siguiente

| Etapa | Contenido |
|-------|-----------|
| **2 Meta** | Monedas al game over, total en HUD, sin tienda completa |
| **3 Ahri kit** | Q Orbe · 1=W · 2=E (charm MVP) · 3=R + mejoras in-run Ahri-only |
| **4 UI** | Menú campeones, compra Ahri, selección sin query |
| **5 Polish** | VFX spells Ahri (CDragon/pipeline), fila attack en sheet |

Jinx no se refactoriza por campeón: ramas mínimas en `ArenaScene` + módulos `ahri*.ts` / `jinx*.ts`.
