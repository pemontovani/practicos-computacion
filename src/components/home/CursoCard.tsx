'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, BookOpen, TrendingUp, ArrowRight } from 'lucide-react'
import { getTierColors, getColorTier } from '@/lib/calculations/progress'
import type { CursoConStats } from '@/types/models'

interface CursoCardProps {
  curso: CursoConStats
  index: number
}

export function CursoCard({ curso, index }: CursoCardProps) {
  const tier = getColorTier(curso.promedioGeneral)
  const tierColors = getTierColors(tier)
  const cursoCode = `${curso.anio}${curso.division}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/curso/${cursoCode}`}>
        <div className="group relative bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden">
          {/* Background gradient accent */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8 transition-transform duration-300 group-hover:scale-150"
            style={{ backgroundColor: curso.color }}
          />

          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2"
                  style={{ backgroundColor: `${curso.color}25`, color: curso.color, border: `1px solid ${curso.color}40` }}
                >
                  🏁 {curso.nombre}
                </div>
                <h3 className="text-xl font-bold text-white">{curso.nombre}</h3>
              </div>
              <div className={`text-2xl font-black ${tierColors.text}`}>
                {curso.promedioGeneral}%
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: tierColors.hex }}
                  initial={{ width: 0 }}
                  animate={{ width: `${curso.promedioGeneral}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{curso.totalAlumnos}</div>
                <div className="text-xs text-slate-500">Alumnos</div>
              </div>
              <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                <BookOpen className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{curso.totalTPs}</div>
                <div className="text-xs text-slate-500">TPs</div>
              </div>
              <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                <TrendingUp className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{curso.destacados}</div>
                <div className="text-xs text-slate-500">Destac.</div>
              </div>
            </div>

            {/* Mini distribution */}
            <div className="flex gap-2 text-xs mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400">{curso.destacados} avanzados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-400">{curso.enProgreso} en progreso</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-slate-400">{curso.atrasados} atrasados</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium group-hover:text-white transition-colors" style={{ color: curso.color }}>
              Ver carrera
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
