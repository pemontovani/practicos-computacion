export interface TrackCoords {
  x: number
  y: number
  angle: number
}

export const TRACK_VIEWBOX = { width: 1000, height: 400 }

export const TRACK_X_START = 60   // 0% progress — left (inicio)
export const TRACK_X_END   = 940  // 100% progress — right (meta)
export const TRACK_Y_CENTER = 200

export function getTrackPoint(progressPercent: number): TrackCoords {
  const clamped = Math.max(0, Math.min(100, progressPercent))
  const x = TRACK_X_START + (clamped / 100) * (TRACK_X_END - TRACK_X_START)
  return { x, y: TRACK_Y_CENTER, angle: 0 }
}

export function progressToPercent(entregasCount: number, totalTPs: number): number {
  if (totalTPs === 0) return 0
  return Math.min(100, (entregasCount / totalTPs) * 100)
}
