'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ConfettiExplosion } from '@/components/gamification/ConfettiExplosion'
import { ProgressBar } from '@/components/course/ProgressBar'
import { PercentageBadge } from '@/components/shared/PercentageBadge'
import type { AlumnoConProgreso, TP, Entrega } from '@/types/models'

interface RaceTrackProps {
  alumnos: AlumnoConProgreso[]
  cursoColor: string
  tps?: TP[]
  entregas?: Entrega[]
}

export function RaceTrack({ alumnos, tps = [], entregas = [] }: RaceTrackProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confettiTrigger, setConfettiTrigger] = useState(false)

  const handleCarClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const selectedAlumno = alumnos.find((a) => a.id === selectedId)

  return (
    <div className="space-y-4">
      <ConfettiExplosion
        trigger={confettiTrigger}
        milestone={100}
        onComplete={() => setConfettiTrigger(false)}
      />

      {/* ── Lanes ── */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
          <span className="text-base">🏁</span>
          <span className="text-white font-bold text-sm">Pista de Carreras</span>
          <span className="text-slate-500 text-xs ml-1">· tocá un alumno para ver su detalle</span>
        </div>

        {/* Column labels */}
        <div className="flex items-center gap-2 px-4 py-1.5 border-b border-slate-700/30">
          <div className="w-6 shrink-0" />
          <div className="w-36 shrink-0 hidden sm:block" />
          <div className="w-24 shrink-0 sm:hidden" />
          <div className="flex-1 flex justify-between text-[10px] text-slate-600 pr-1">
            <span>INICIO</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>META 🏁</span>
          </div>
          <div className="w-10 shrink-0" />
        </div>

        {/* One lane per student */}
        <div className="divide-y divide-slate-700/20">
          {alumnos.map((alumno) => {
            const isSelected = selectedId === alumno.id
            const pct = Math.round(alumno.progreso)
            return (
              <motion.button
                key={alumno.id}
                onClick={() => handleCarClick(alumno.id)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 transition-colors text-left ${
                  isSelected ? 'bg-slate-700/40' : 'hover:bg-slate-700/20'
                }`}
                whileTap={{ scale: 0.99 }}
              >
                <span className="text-slate-500 text-xs w-6 text-right font-mono shrink-0">
                  {alumno.rank}
                </span>
                <span className="text-xs text-white w-36 text-left truncate shrink-0 hidden sm:block">
                  {alumno.apellido}, {alumno.nombre}
                </span>
                <span className="text-xs text-white w-24 text-left truncate shrink-0 sm:hidden">
                  {alumno.apellido}
                </span>

                {/* Track lane */}
                <div className="flex-1 relative h-5 bg-slate-700/40 rounded-full overflow-visible">
                  {[25, 50, 75].map((m) => (
                    <div
                      key={m}
                      className="absolute top-0 bottom-0 w-px bg-slate-600/50"
                      style={{ left: `${m}%` }}
                    />
                  ))}
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: alumno.carColor, opacity: 0.35 }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center shadow-lg transition-all duration-500"
                    style={{
                      left: pct === 0 ? '2px' : `${pct}%`,
                      transform: pct === 0 ? 'translateY(-50%)' : 'translateX(-50%) translateY(-50%)',
                      backgroundColor: alumno.carColor,
                      boxShadow: isSelected ? `0 0 10px ${alumno.carColor}` : undefined,
                    }}
                  >
                    <span className="text-[8px] font-bold text-white leading-none">{alumno.rank}</span>
                  </div>
                </div>

                <span className="text-xs font-bold w-10 text-right shrink-0" style={{ color: alumno.carColor }}>
                  {pct}%
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Bottom sheet (fixed) ── */}
      <AnimatePresence>
        {selectedAlumno && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedId(null)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
              style={{ borderColor: `${selectedAlumno.carColor}50` }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-700" />
              </div>

              <div className="px-5 pb-8 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: selectedAlumno.carColor }}
                  >
                    #{selectedAlumno.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white">
                      {selectedAlumno.apellido}, {selectedAlumno.nombre}
                    </div>
                    <div className="text-sm text-slate-400">
                      {selectedAlumno.entregasCount} de {selectedAlumno.totalTPs} TPs entregados
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PercentageBadge percent={selectedAlumno.progreso} size="lg" />
                    <button
                      onClick={() => setSelectedId(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <ProgressBar percent={selectedAlumno.progreso} size="lg" />

                {/* TP list */}
                {tps.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {tps.map((tp) => {
                      const entrega = entregas.find(
                        (e) => e.alumnoId === selectedAlumno.id && e.tpId === tp.id
                      )
                      const [, desc] = tp.titulo.split(' — ')
                      return (
                        <div
                          key={tp.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                            entrega
                              ? entrega.estado === 'INCOMPLETO'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-700/30 border-slate-600/30 text-slate-500'
                          }`}
                        >
                          <span className="text-base leading-none">
                            {entrega ? entrega.estado === 'INCOMPLETO' ? '⏰' : '✓' : '✗'}
                          </span>
                          <span className="font-medium text-xs opacity-70 shrink-0">TP {tp.numero}</span>
                          <span className="truncate text-xs">{desc ?? tp.titulo}</span>
                          {tp.conNota && entrega?.estado === 'ENTREGADO' && (
                            <span className="ml-auto shrink-0 text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/30 rounded px-1.5 py-0.5">
                              {entrega.nota != null ? `${entrega.nota}/10` : '—/10'}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {selectedAlumno.progreso === 100 && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs text-amber-400 font-medium flex items-center gap-1"
                    onClick={() => setConfettiTrigger(true)}
                  >
                    🎉 ¡Completó todos los TPs! ¡Celebrar!
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
