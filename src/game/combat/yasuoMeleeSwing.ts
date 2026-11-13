export type YasuoMeleeSwingKind = 'basic' | 'q'

export type YasuoMeleeSwing = {
  kind: YasuoMeleeSwingKind
  nx: number
  ny: number
  startX: number
  startY: number
  endX: number
  endY: number
  elapsedMs: number
  windupMs: number
  lungeMs: number
  recoverMs: number
  strikeAtMs: number
  hitApplied: boolean
}

export function createYasuoMeleeSwing(
  kind: YasuoMeleeSwingKind,
  px: number,
  py: number,
  nx: number,
  ny: number,
  lungePx: number,
  windupMs: number,
  lungeMs: number,
  recoverMs: number,
): YasuoMeleeSwing {
  return {
    kind,
    nx,
    ny,
    startX: px,
    startY: py,
    endX: px + nx * lungePx,
    endY: py + ny * lungePx,
    elapsedMs: 0,
    windupMs,
    lungeMs,
    recoverMs,
    strikeAtMs:
      lungeMs > 0 ? windupMs + Math.round(lungeMs * 0.62) : Math.max(12, windupMs - 6),
    hitApplied: false,
  }
}

export function yasuoMeleeSwingTotalMs(swing: YasuoMeleeSwing): number {
  return swing.windupMs + swing.lungeMs + swing.recoverMs
}
