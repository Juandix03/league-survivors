# Pipeline visual Yasuo (paridad Ahri / Jinx)

## Estado inicial

| Habilidad | PNG curados (CDragon) | Factory Phaser | Arena |
|-----------|------------------------|----------------|-------|
| **BA** | `yasuo_basic_attack_*`, `yasuo_q_sword` | `createYasuoBasicProjectileVisual` | Sí |
| **Q** | slash / sword (corte corto) | `spawnYasuoSteelTempestSlash` | Sí (melee) |
| **W** | windwall_main, wispy | `createYasuoWindWallVisual` | Sí |
| **E** | dash white / ring / smoke | `spawnYasuoEDashBurst` | Sí |
| **R** | r_wind_blast, land ring | `spawnYasuoLastBreathVisual` | Sí |

## Comandos

```bash
npm run yasuo:download-spells
npm run yasuo:fetch-skin0
npm run yasuo:download    # GLB Khada skin0
npm run yasuo:render      # spritesheet HD → public/assets/champions/yasuo/
```

Bake mesh (opcional, fase 2): copiar scripts `ahri-pipeline` cuando haya `.scb` exportables.

## Jugar en dev

`?champion=yasuo` (Ctrl+F5). Desbloqueo meta: 350 monedas o DEV.
