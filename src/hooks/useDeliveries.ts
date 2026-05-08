import { useState } from 'react'
import { mutate } from 'swr'
import { api } from '@/lib/api/client'
import { toast } from '@/hooks/use-toast'
import type { Entrega } from '@/types/models'

export function useDeliveries(cursoId: string) {
  const [pending, setPending] = useState<Set<string>>(new Set())

  function getCellKey(alumnoId: string, tpId: string) {
    return `${alumnoId}:${tpId}`
  }

  async function toggleEntrega(
    alumnoId: string,
    tpId: string,
    currentEntrega: Entrega | undefined,
    onOptimisticUpdate: (alumnoId: string, tpId: string, newEntrega: Entrega | null) => void
  ) {
    const key = getCellKey(alumnoId, tpId)
    if (pending.has(key)) return

    setPending((prev) => new Set(prev).add(key))

    if (!currentEntrega) {
      // Sin entrega → ENTREGADO
      const tempEntrega: Entrega = {
        id: 'temp-' + Date.now(),
        alumnoId,
        tpId,
        estado: 'ENTREGADO',
        fechaEntrega: new Date().toISOString(),
        nota: null,
        comentario: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      onOptimisticUpdate(alumnoId, tpId, tempEntrega)
      try {
        const real = await api.post<Entrega>('/api/entregas', { alumnoId, tpId })
        onOptimisticUpdate(alumnoId, tpId, real)
        mutate(`/api/cursos/${cursoId}/stats`)
      } catch {
        onOptimisticUpdate(alumnoId, tpId, null)
        toast({ title: 'Error al registrar entrega', variant: 'destructive' })
      }
    } else if (currentEntrega.estado === 'ENTREGADO') {
      // ENTREGADO → INCOMPLETO
      const updated: Entrega = { ...currentEntrega, estado: 'INCOMPLETO' }
      onOptimisticUpdate(alumnoId, tpId, updated)
      try {
        const real = await api.put<Entrega>(`/api/entregas/${currentEntrega.id}`, { estado: 'INCOMPLETO' })
        onOptimisticUpdate(alumnoId, tpId, real)
        mutate(`/api/cursos/${cursoId}/stats`)
      } catch {
        onOptimisticUpdate(alumnoId, tpId, currentEntrega)
        toast({ title: 'Error al actualizar entrega', variant: 'destructive' })
      }
    } else {
      // INCOMPLETO (o cualquier otro estado) → eliminar
      onOptimisticUpdate(alumnoId, tpId, null)
      try {
        await api.delete(`/api/entregas/${currentEntrega.id}`)
        mutate(`/api/cursos/${cursoId}/stats`)
      } catch {
        onOptimisticUpdate(alumnoId, tpId, currentEntrega)
        toast({ title: 'Error al quitar entrega', variant: 'destructive' })
      }
    }

    setPending((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  function isPending(alumnoId: string, tpId: string) {
    return pending.has(getCellKey(alumnoId, tpId))
  }

  return { toggleEntrega, isPending }
}
