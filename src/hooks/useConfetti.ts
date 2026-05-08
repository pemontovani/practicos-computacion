import { useRef } from 'react'

export function useConfetti() {
  const prevProgressRef = useRef<Map<string, number>>(new Map())

  function checkMilestone(alumnoId: string, newProgress: number): 25 | 50 | 75 | 100 | null {
    const prev = prevProgressRef.current.get(alumnoId) ?? 0
    const milestones: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100]
    for (const m of milestones) {
      if (prev < m && newProgress >= m) {
        prevProgressRef.current.set(alumnoId, newProgress)
        return m
      }
    }
    prevProgressRef.current.set(alumnoId, newProgress)
    return null
  }

  return { checkMilestone }
}
