# Progresión permanente (campeones y monedas)

Separado del estado de **una partida** (`PlayerCombatStats`, `JinxAbilityLevels`, nivel, XP).

## Almacenamiento

- Clave: `league-survivors/meta/v1` en `localStorage`
- API: `src/game/meta/championUnlock.ts`

```json
{
  "unlockedChampions": ["jinx"],
  "coins": 0
}
```

## Desbloqueo de campeones

| Campeón | Coste |
|---------|-------|
| Jinx | Siempre desbloqueada |
| Ahri | 300 monedas |

`unlockChampionPermanent('ahri')` resta monedas y añade el id. **No implementado en UI todavía.**

## Desarrollo vs jugador normal

| Modo | Cómo jugar Ahri bloqueada |
|------|---------------------------|
| **Dev** (`import.meta.env.DEV`) | `?champion=ahri` fuerza campeón **sin** escribir meta ni marcar desbloqueo |
| **Prod / jugador** | `?champion=ahri` solo si Ahri está en `unlockedChampions`; si no, cae a Jinx |

## Conexión futura (fin de partida)

1. `ArenaScene` en game over / victoria → calcular recompensa (p. ej. kills + tiempo).
2. Llamar `addMetaCoins(reward)`.
3. Pantalla de resultados → botón “Desbloquear Ahri (300)” si `coins >= 300` → `unlockChampionPermanent('ahri')`.

La **pausa de mejoras** y el **level-up in-run** siguen en `upgrades.ts`; no mezclar con monedas.

## Etapa actual

- Persistencia mínima y reglas de acceso implementadas.
- **Game over:** `computeRunCoinReward` → `addMetaCoins` (HUD muestra +N y total).
- **Pendiente:** botón comprar Ahri (300), menú campeones.
