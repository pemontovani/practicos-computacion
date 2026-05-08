export interface TrackCoords {
  x: number
  y: number
  angle: number
}

export interface RaceCar {
  alumnoId: string
  nombre: string
  apellido: string
  color: string
  progreso: number
  position: TrackCoords
  rank: number
}

export interface AnimationState {
  isAnimating: boolean
  triggeredMilestone?: 25 | 50 | 75 | 100
}
