/** En DEV, `?fullkit=1` inicia con Q/W/E/R desbloqueados (VFX y balance). */
export function devFullAbilityKit(): boolean {
  if (!import.meta.env?.DEV) return false
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('fullkit')
}
