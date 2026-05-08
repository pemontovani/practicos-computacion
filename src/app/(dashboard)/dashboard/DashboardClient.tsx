'use client'

import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Users, BookOpen, Trophy, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api/client'
import { CursoCard } from '@/components/home/CursoCard'
import { RankingPodium } from '@/components/dashboard/RankingPodium'
import { AtrasadosPanel } from '@/components/dashboard/AtrasadosPanel'
import { DestacadosPanel } from '@/components/dashboard/DestacadosPanel'
import { CourseComparisonChart } from '@/components/dashboard/CourseComparisonChart'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import type { DashboardStats, CursoConStats } from '@/types/models'

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  )
}

export function DashboardClient() {
  const { data: cursos, isLoading: loadingCursos, error: errorCursos } = useSWR<CursoConStats[]>(
    '/api/cursos',
    (url: string) => api.get<CursoConStats[]>(url)
  )

  const { data: stats, isLoading: loadingStats } = useSWR<DashboardStats>(
    '/api/dashboard',
    (url: string) => api.get<DashboardStats>(url)
  )

  if (loadingCursos) return <LoadingSpinner />
  if (errorCursos) return <ErrorState />

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">¡Buen día! 👋</h1>
        <p className="text-slate-400">Resumen general del progreso de los cursos</p>
      </motion.div>

      {/* Global Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total alumnos" value={stats.totalAlumnos} color="bg-indigo-600" />
          <StatCard icon={BookOpen} label="TPs activos" value={stats.totalTPs} color="bg-violet-600" />
          <StatCard icon={TrendingUp} label="Promedio global" value={`${stats.promedioGlobal}%`} color="bg-emerald-600" />
          <StatCard icon={Trophy} label="Destacados" value={stats.destacados.length} color="bg-amber-600" />
        </div>
      )}

      {/* Courses Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Cursos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cursos?.map((curso, i) => (
            <CursoCard key={curso.id} curso={curso} index={i} />
          ))}
        </div>
      </div>

      {/* Rankings and chart */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CourseComparisonChart courses={stats.cursosStats} />
          </div>
          <div className="space-y-4">
            {stats.topAlumnos.length >= 3 && (
              <RankingPodium top3={stats.topAlumnos.slice(0, 3)} />
            )}
          </div>
        </div>
      )}

      {/* Atrasados + Destacados */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AtrasadosPanel alumnos={stats.atrasados} />
          <DestacadosPanel alumnos={stats.destacados} />
        </div>
      )}
    </div>
  )
}
