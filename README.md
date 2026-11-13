# League Survivors (demo)

Survivor top-down en el navegador (Phaser + React). Fan game **sin afiliación a Riot Games**.

## Jugar en local

```bash
npm install
npm run dev
```

Build de producción (misma que publicar):

```bash
npm run build
npm run preview
# o
npm run demo:preview
```

## Publicar la demo

Salida estática en `dist/` después de `npm run build`.

- **Netlify:** conectar el repo o arrastrar `dist/`; este repo incluye `netlify.toml` (comando y carpeta).
- **Vercel / Cloudflare Pages:** build `npm run build`, directorio de salida `dist`.
- **Cualquier hosting estático:** subir el contenido de `dist/`.

## Controles

- WASD / flechas — movimiento  
- Ataque automático  
- `1`–`4` — Q/W/E/R cuando las desbloqueás al subir de nivel  

## Meta

Jinx gratis al inicio; monedas al terminar una partida para desbloquear más campeones (progreso en `localStorage`).
