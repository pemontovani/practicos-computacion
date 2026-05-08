import useSWR from 'swr'
import { api } from '@/lib/api/client'
import type { CursoDetalle } from '@/types/models'

export function useCourseData(cursoCode: string | null) {
  const { data, isLoading, error, mutate } = useSWR<CursoDetalle>(
    cursoCode ? `/api/cursos/by-code/${cursoCode}` : null,
    (url: string) => api.get<CursoDetalle>(url)
  )

  return { curso: data, isLoading, error, mutate }
}

export function useCourseStats(cursoId: string | null) {
  return useSWR(
    cursoId ? `/api/cursos/${cursoId}/stats` : null,
    (url: string) => api.get(url)
  )
}
