'use client'

import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { ProgressBar } from '@/components/course/ProgressBar'
import type { AlumnoConProgreso } from '@/types/models'

interface AtrasadosPanelProps {
  alumnos: AlumnoConProgreso[]
}

export function AtrasadosPanel({ alumnos }: AtrasadosPanelProps) {
  return (
    <div className="bg-slate-800/60 border border-red-500/20 rounded-2xl p-5">
      <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        Alumnos atrasados
        <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
          {alumnos.length}
        </span>
      </h3>

      {alumnos.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">
          🎉 ¡Ningún alumno atrasado!
        </p>
      ) : (
        <div className="space-y-3">
          {alumnos.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: a.carColor }}
              >
                {a.nombre[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{a.apellido}, {a.nombre}</div>
                {a.curso && <div className="text-xs text-slate-500">{a.curso.nombre}</div>}
                <ProgressBar percent={a.progreso} size="sm" showLabel={false} animate={false} className="mt-1" />
              </div>
              <span className="text-red-400 text-xs font-bold shrink-0">{Math.round(a.progreso)}%</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
