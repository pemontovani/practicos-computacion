'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/lib/api/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DeliveryTable } from '@/components/course/DeliveryTable'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Curso, CursoDetalle } from '@/types/models'

interface EntregasClientProps {
  cursos: Curso[]
}

export function EntregasClient({ cursos }: EntregasClientProps) {
  const [selectedCursoCode, setSelectedCursoCode] = useState<string>('')

  const code = selectedCursoCode
    ? cursos.find((c) => c.id === selectedCursoCode)
      ? `${cursos.find((c) => c.id === selectedCursoCode)?.anio}${cursos.find((c) => c.id === selectedCursoCode)?.division}`
      : null
    : null

  const { data: cursoData, isLoading } = useSWR<CursoDetalle>(
    code ? `/api/cursos/by-code/${code}` : null,
    (url: string) => api.get<CursoDetalle>(url)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Gestión de Entregas</h2>
        <p className="text-slate-400 text-sm">Marcar entregas de TPs por curso</p>
      </div>

      <Select value={selectedCursoCode} onValueChange={setSelectedCursoCode}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Seleccionar curso" />
        </SelectTrigger>
        <SelectContent>
          {cursos.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
        </SelectContent>
      </Select>

      {!selectedCursoCode && (
        <EmptyState icon="📋" title="Seleccioná un curso" description="Elegí un curso para ver y editar las entregas." />
      )}

      {isLoading && <LoadingSpinner />}

      {cursoData && !isLoading && (
        <DeliveryTable
          cursoId={cursoData.id}
          alumnos={cursoData.alumnos}
          tps={cursoData.tps}
          initialEntregas={cursoData.entregas}
        />
      )}
    </div>
  )
}
