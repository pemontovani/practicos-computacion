'use client'

import { motion } from 'framer-motion'
import { MedalBadge } from '@/components/gamification/MedalBadge'
import { PercentageBadge } from '@/components/shared/PercentageBadge'
import type { AlumnoConProgreso } from '@/types/models'

interface RankingPodiumProps {
  top3: AlumnoConProgreso[]
}

const HEIGHTS = ['h-20', 'h-28', 'h-16']
const ORDER = [1, 0, 2]

export function RankingPodium({ top3 }: RankingPodiumProps) {
  if (top3.length < 3) return null

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
      <h3 className="font-semibold text-white text-sm mb-5 flex items-center gap-2">
        🏆 Podio del día
      </h3>
      <div className="flex items-end justify-center gap-3">
        {ORDER.map((idx) => {
          const alumno = top3[idx]
          const pos = (idx + 1) as 1 | 2 | 3
          const podiumHeights = { 1: 'h-20', 2: 'h-28', 0: 'h-20' }

          return (
            <motion.div
              key={alumno.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div className="text-center">
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: alumno.carColor }}
                >
                  {alumno.nombre[0]}{alumno.apellido[0]}
                </div>
                <div className="text-xs text-white font-medium leading-tight">
                  {alumno.apellido.length > 8 ? alumno.apellido.slice(0, 8) + '.' : alumno.apellido}
                </div>
                <div className="text-xs text-slate-400">{alumno.nombre}</div>
              </div>
              <PercentageBadge percent={alumno.progreso} size="sm" />
              <div className={`w-full rounded-t-lg bg-gradient-to-t ${
                pos === 1 ? 'from-yellow-500/40 to-yellow-400/20 border-yellow-500/30' :
                pos === 2 ? 'from-slate-500/40 to-slate-400/20 border-slate-400/30' :
                'from-amber-700/40 to-amber-600/20 border-amber-600/30'
              } border border-b-0 ${
                pos === 1 ? 'h-20' : pos === 2 ? 'h-28' : 'h-14'
              } flex items-center justify-center`}>
                <MedalBadge position={pos} size="sm" animated={false} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
