import { useMemo } from 'react'
import { getTrackPoint } from '@/lib/calculations/racePosition'
import type { TrackCoords } from '@/lib/calculations/racePosition'

export function useRaceTrack(progressValues: { id: string; progress: number }[]) {
  const positions = useMemo(() => {
    const map = new Map<string, TrackCoords>()
    for (const { id, progress } of progressValues) {
      map.set(id, getTrackPoint(progress))
    }
    return map
  }, [progressValues])

  return { positions }
}
