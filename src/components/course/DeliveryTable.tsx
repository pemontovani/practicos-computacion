'use client'

import { useState, useMemo } from 'react'
import { Search, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { DeliveryCell } from './DeliveryCell'
import { ProgressBar } from './ProgressBar'
import { PercentageBadge } from '@/components/shared/PercentageBadge'
import { calculateProgress } from '@/lib/calculations/progress'
import { useDeliveries } from '@/hooks/useDeliveries'
import { useDebounce } from '@/hooks/useDebounce'
import type { Alumno, TP, Entrega } from '@/types/models'

interface DeliveryTableProps {
  cursoId: string
  alumnos: Alumno[]
  tps: TP[]
  initialEntregas: Entrega[]
  readOnly?: boolean
}

export function DeliveryTable({ cursoId, alumnos, tps, initialEntregas, readOnly }: DeliveryTableProps) {
  const [search, setSearch] = useState('')
  const [entregasMap, setEntregasMap] = useState<Map<string, Entrega>>(() => {
    const map = new Map<string, Entrega>()
    initialEntregas.forEach((e) => map.set(`${e.alumnoId}:${e.tpId}`, e))
    return map
  })

  const debouncedSearch = useDebounce(search, 200)
  const { toggleEntrega, isPending } = useDeliveries(cursoId)

  const filteredAlumnos = useMemo(() => {
    if (!debouncedSearch) return alumnos
    const q = debouncedSearch.toLowerCase()
    return alumnos.filter(
      (a) => a.nombre.toLowerCase().includes(q) || a.apellido.toLowerCase().includes(q)
    )
  }, [alumnos, debouncedSearch])

  function handleOptimisticUpdate(alumnoId: string, tpId: string, newEntrega: Entrega | null) {
    setEntregasMap((prev) => {
      const next = new Map(prev)
      const key = `${alumnoId}:${tpId}`
      if (newEntrega) {
        next.set(key, newEntrega)
      } else {
        next.delete(key)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar alumno..."
          className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
        />
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <span className="text-emerald-400">✓</span>
          </div>
          Entregado
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <span className="text-amber-400">⏰</span>
          </div>
          Incompleto
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-slate-700/30 border border-slate-600/50" />
          Pendiente
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="min-w-max w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80">
              <th className="sticky left-0 z-20 bg-slate-800/80 text-left px-3 py-3 text-slate-400 font-medium w-[180px] min-w-[180px]">
                Alumno
              </th>
              <th className="sticky left-[180px] z-20 bg-slate-800/80 text-left px-2 py-3 text-slate-400 font-medium w-[200px] min-w-[200px]">Progreso</th>
              {tps.map((tp) => {
                const [prefix, desc] = tp.titulo.split(' — ')
                return (
                  <th key={tp.id} className="px-3 py-3 text-slate-400 font-medium min-w-[120px] text-left align-bottom">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-300">{tp.numero}</span>
                      {tp.conNota && (
                        <Star className="w-3 h-3 text-violet-400 fill-violet-400 shrink-0" />
                      )}
                    </div>
                    {desc && (
                      <div className="text-[10px] text-slate-500 leading-snug mt-0.5 whitespace-normal">
                        {desc}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {filteredAlumnos.map((alumno, i) => {
              const alumnoEntregas = tps.map((tp) => entregasMap.get(`${alumno.id}:${tp.id}`))
              const entregasCount = alumnoEntregas.filter((e) => e?.estado === 'ENTREGADO').length
              const progress = calculateProgress(entregasCount, tps.length)

              return (
                <motion.tr
                  key={alumno.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="sticky left-0 z-10 bg-slate-900 px-3 py-2.5 w-[140px]">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: alumno.carColor }}
                      />
                      <span className="text-white text-xs font-medium truncate">
                        {alumno.apellido}, {alumno.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="sticky left-[180px] z-10 bg-slate-900 px-2 py-2.5 w-[80px]">
                    <div className="space-y-0.5">
                      <ProgressBar percent={progress} size="sm" animate={false} showLabel={false} />
                      <PercentageBadge percent={progress} size="sm" />
                    </div>
                  </td>
                  {tps.map((tp, j) => (
                    <td key={tp.id} className="px-2 py-3 text-center">
                      <DeliveryCell
                        alumnoId={alumno.id}
                        tpId={tp.id}
                        entrega={alumnoEntregas[j]}
                        isPending={isPending(alumno.id, tp.id)}
                        readOnly={readOnly}
                        onToggle={() =>
                          toggleEntrega(alumno.id, tp.id, alumnoEntregas[j], handleOptimisticUpdate)
                        }
                      />
                    </td>
                  ))}
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
