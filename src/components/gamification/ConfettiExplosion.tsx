'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiExplosionProps {
  trigger: boolean
  milestone?: 25 | 50 | 75 | 100
  onComplete?: () => void
}

export function ConfettiExplosion({ trigger, milestone = 100, onComplete }: ConfettiExplosionProps) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (!trigger || firedRef.current) return
    firedRef.current = true

    if (milestone === 100) {
      const duration = 3000
      const end = Date.now() + duration
      const colors = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#22c55e']

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        })
        if (Date.now() < end) requestAnimationFrame(frame)
        else onComplete?.()
      }
      frame()
    } else {
      confetti({
        particleCount: milestone === 75 ? 80 : milestone === 50 ? 50 : 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#22c55e'],
      })
      setTimeout(() => onComplete?.(), 1000)
    }
  }, [trigger, milestone, onComplete])

  useEffect(() => {
    if (!trigger) firedRef.current = false
  }, [trigger])

  return null
}
