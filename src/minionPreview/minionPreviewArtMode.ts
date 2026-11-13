export type MinionPreviewArtMode = 'riot' | 'inspired' | 'baked'

export const MINION_PREVIEW_REGISTRY_ART = 'minionPreviewArtMode'

export function parseMinionArtMode(search: string): MinionPreviewArtMode {
  const v = new URLSearchParams(search).get('minionArt')
  if (v === 'inspired') return 'inspired'
  if (v === 'riot') return 'riot'
  if (v === 'inspired') return 'inspired'
  return 'baked'
}
