/**
 * DEV / testing flags — no afectan builds de producción si se dejan en false.
 * Desactivar `DEV_ABILITY_TESTING` antes de release.
 */
/** true = W/E/R usables al nivel 0 (solo pruebas locales). Partida normal: false. */
export const DEV_ABILITY_TESTING = false

/**
 * Métricas de balance en partida. Solo con `?balance=1` en la URL (dev).
 * Así el HUD normal queda limpio.
 */
export function isBalanceRunDebugEnabled(): boolean {
  if (!import.meta.env.DEV) return false
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('balance')
}
