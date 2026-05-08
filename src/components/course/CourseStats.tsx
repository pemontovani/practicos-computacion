import { Users, BookOpen, TrendingUp, AlertTriangle, Star } from 'lucide-react'

interface CourseStatsProps {
  totalAlumnos: number
  totalTPs: number
  promedioGeneral: number
  destacados: number
  atrasados: number
  enProgreso: number
}

export function CourseStats({
  totalAlumnos, totalTPs, promedioGeneral, destacados, atrasados, enProgreso
}: CourseStatsProps) {
  const stats = [
    { icon: Users, label: 'Alumnos', value: totalAlumnos, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: BookOpen, label: 'TPs', value: totalTPs, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { icon: TrendingUp, label: 'Promedio', value: `${promedioGeneral}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Star, label: 'Destac.', value: destacados, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: AlertTriangle, label: 'Atras.', value: atrasados, color: 'text-red-400', bg: 'bg-red-500/10' },
  ]

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {stats.map((s) => (
        <div key={s.label} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl ${s.bg} border border-slate-700/50 shrink-0`}>
          <s.icon className={`w-4 h-4 ${s.color}`} />
          <div>
            <div className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
