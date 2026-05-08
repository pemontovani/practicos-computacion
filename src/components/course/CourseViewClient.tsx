'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flag, Table2 } from 'lucide-react'
import { CourseStats } from '@/components/course/CourseStats'
import { DeliveryTable } from '@/components/course/DeliveryTable'
import { RaceTrack } from '@/components/race/RaceTrack'
import { calculateProgress, getColorTier } from '@/lib/calculations/progress'
import { computeRankings } from '@/lib/calculations/rankings'
import type { CursoDetalle, AlumnoConProgreso } from '@/types/models'

interface CourseViewClientProps {
  curso: CursoDetalle
  cursoCode: string
}

type Tab = 'carrera' | 'tabla'

export function CourseViewClient({ curso, cursoCode }: CourseViewClientProps) {
  const [tab, setTab] = useState<Tab>('carrera')

  const totalTPs = curso.tps.length

  const alumnosConProgreso: AlumnoConProgreso[] = curso.alumnos.map((alumno) => {
    const entregasCount = curso.entregas.filter((e) => e.alumnoId === alumno.id && e.estado === 'ENTREGADO').length
    const progreso = calculateProgress(entregasCount, totalTPs)
    return {
      ...alumno,
      progreso,
      entregasCount,
      totalTPs,
      colorTier: getColorTier(progreso),
    }
  })

  const ranked = computeRankings(alumnosConProgreso)

  const promedioGeneral = ranked.length
    ? Math.round(ranked.reduce((s, a) => s + a.progreso, 0) / ranked.length)
    : 0

  const destacados = ranked.filter((a) => a.progreso >= 70).length
  const atrasados = ranked.filter((a) => a.progreso < 40).length
  const enProgreso = ranked.filter((a) => a.progreso >= 40 && a.progreso < 70).length

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'carrera', icon: Flag, label: 'Carrera' },
    { id: 'tabla', icon: Table2, label: 'Entregas' },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: curso.color }}
          >
            {curso.anio}°{curso.division}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{curso.nombre}</h1>
            <p className="text-slate-400 text-sm">{totalTPs} TPs · {curso.alumnos.length} alumnos</p>
          </div>
        </div>
        <CourseStats
          totalAlumnos={curso.alumnos.length}
          totalTPs={totalTPs}
          promedioGeneral={promedioGeneral}
          destacados={destacados}
          atrasados={atrasados}
          enProgreso={enProgreso}
        />
      </motion.div>

      <div className="flex gap-1 p-1 bg-slate-800/60 border border-slate-700/50 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'carrera' ? (
        <motion.div key="carrera" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <RaceTrack alumnos={ranked} cursoColor={curso.color} tps={curso.tps} entregas={curso.entregas} />
        </motion.div>
      ) : (
        <motion.div key="tabla" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <DeliveryTable
            cursoId={curso.id}
            alumnos={curso.alumnos}
            tps={curso.tps}
            initialEntregas={curso.entregas}
            readOnly
          />
        </motion.div>
      )}
    </div>
  )
}
