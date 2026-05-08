'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import type { TrackCoords } from '@/lib/calculations/racePosition'

interface CarTokenProps {
  nombre: string
  apellido: string
  color: string
  position: TrackCoords
  rank: number
  progreso: number
  isHighlighted: boolean
  onClick: () => void
}

export function CarToken({ nombre, apellido, color, position, rank, progreso, isHighlighted, onClick }: CarTokenProps) {
  const { x, y } = position
  const gRef = useRef<SVGGElement>(null)

  const xMv = useMotionValue(x)
  const yMv = useMotionValue(y)

  const springX = useSpring(xMv, { stiffness: 60, damping: 20 })
  const springY = useSpring(yMv, { stiffness: 60, damping: 20 })

  useEffect(() => {
    xMv.set(x)
    yMv.set(y)
  }, [x, y, xMv, yMv])

  useEffect(() => {
    const update = () => {
      gRef.current?.setAttribute('transform', `translate(${springX.get()}, ${springY.get()})`)
    }
    const unsubX = springX.on('change', update)
    const unsubY = springY.on('change', update)
    update()
    return () => { unsubX(); unsubY() }
  }, [springX, springY])

  return (
    <g ref={gRef} onClick={onClick} style={{ cursor: 'pointer' }}>
      {isHighlighted && (
        <motion.circle
          cx={0} cy={0} r={20}
          fill="none" stroke={color} strokeWidth={2} opacity={0.6}
          animate={{ r: [16, 20, 16] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {/* Car body — landscape, facing right */}
      <rect x={-14} y={-7} width={28} height={14} rx={3} fill={color} opacity={0.9} />
      <rect x={7}   y={-4} width={5}  height={8}  rx={2} fill="white" opacity={0.5} />
      <rect x={-12} y={-3} width={4}  height={6}  rx={1} fill="white" opacity={0.3} />
      <rect x={13}  y={-5} width={2}  height={3}  rx={0.5} fill="#fef08a" opacity={0.9} />
      <rect x={13}  y={2}  width={2}  height={3}  rx={0.5} fill="#fef08a" opacity={0.9} />
      {/* Front wheels */}
      <rect x={5}   y={-11} width={7} height={4} rx={1} fill="#1e293b" />
      <rect x={5}   y={7}   width={7} height={4} rx={1} fill="#1e293b" />
      {/* Rear wheels */}
      <rect x={-12} y={-11} width={7} height={4} rx={1} fill="#1e293b" />
      <rect x={-12} y={7}   width={7} height={4} rx={1} fill="#1e293b" />
      {/* Rank badge */}
      <circle cx={-2} cy={0} r={5.5} fill="white" opacity={0.9} />
      <text x={-2} y={3.5} textAnchor="middle" fontSize={6.5} fontWeight="bold" fill={color}>
        {rank}
      </text>

      {/* Name label below */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: isHighlighted ? 1 : 0.65 }}>
        <rect x={-26} y={14} width={52} height={13} rx={3} fill="rgba(15,23,42,0.88)" />
        <text x={0} y={24} textAnchor="middle" fontSize={7.5} fill="white">
          {apellido.length > 7 ? apellido.slice(0, 7) + '.' : apellido}
        </text>
      </motion.g>

      {/* Progress badge above (highlighted only) */}
      {isHighlighted && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <rect x={-18} y={-30} width={36} height={14} rx={3} fill={color} opacity={0.95} />
          <text x={0} y={-20} textAnchor="middle" fontSize={8.5} fill="white" fontWeight="bold">
            {Math.round(progreso)}%
          </text>
        </motion.g>
      )}
    </g>
  )
}
