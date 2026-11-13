/** 8 filas Run — mismo orden que WALK8_OCTANT_SUFFIX en playerFacing.ts (E → NE). */
export const WALK8_ROWS = [
  { label: 'walk-right', rot: Math.PI / 2 },
  { label: 'walk-down-right', rot: Math.PI / 4 },
  { label: 'walk-down', rot: 0 },
  { label: 'walk-down-left', rot: -Math.PI / 4 },
  { label: 'walk-left', rot: -Math.PI / 2 },
  { label: 'walk-up-left', rot: (-3 * Math.PI) / 4 },
  { label: 'walk-up', rot: Math.PI },
  { label: 'walk-up-right', rot: (3 * Math.PI) / 4 },
]

export const ROT4 = {
  down: 0,
  up: Math.PI,
  side: Math.PI / 2,
}

/**
 * @param {object} opts
 * @param {4|8} opts.directionMode
 * @param {string} opts.idleClip
 * @param {string} opts.runClip
 * @param {number[]} opts.idleTimes
 * @param {number[]} opts.runTimes
 */
export function buildChampionWalkRowSpecs(opts) {
  const { directionMode, idleClip, runClip, idleTimes, runTimes } = opts
  if (directionMode === 8) {
    return [
      { clip: idleClip, rot: ROT4.down, times: idleTimes, label: 'idle' },
      ...WALK8_ROWS.map((w) => ({
        clip: runClip,
        rot: w.rot,
        times: runTimes,
        label: w.label,
      })),
    ]
  }
  return [
    { clip: idleClip, rot: ROT4.down, times: idleTimes, label: 'idle' },
    { clip: runClip, rot: ROT4.down, times: runTimes, label: 'walk-down' },
    { clip: runClip, rot: ROT4.up, times: runTimes, label: 'walk-up' },
    { clip: runClip, rot: ROT4.side, times: runTimes, label: 'walk-side' },
  ]
}

/** Minions: idle + 8 walk (+ attack opcional al final). */
export function buildMinionWalkRowSpecs(opts) {
  const { idleClip, runClip, idleTimes, runTimes, attackClip, attackTimes, directionMode } = opts
  const rows =
    directionMode === 8
      ? [
          { clip: idleClip, rot: ROT4.down, times: idleTimes, label: 'idle' },
          ...WALK8_ROWS.map((w) => ({
            clip: runClip,
            rot: w.rot,
            times: runTimes,
            label: w.label,
          })),
        ]
      : [
          { clip: idleClip, rot: ROT4.down, times: idleTimes, label: 'idle' },
          { clip: runClip, rot: ROT4.down, times: runTimes, label: 'walk-down' },
          { clip: runClip, rot: ROT4.up, times: runTimes, label: 'walk-up' },
          { clip: runClip, rot: ROT4.side, times: runTimes, label: 'walk-side' },
        ]
  if (attackClip && attackTimes) {
    rows.push({
      clip: attackClip,
      rot: ROT4.down,
      times: attackTimes,
      label: 'attack-down',
    })
  }
  return rows
}
