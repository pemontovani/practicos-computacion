import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { CourseViewClient } from '@/components/course/CourseViewClient'

export default async function PublicCursoPage({ params }: { params: { cursoCode: string } }) {
  const code = params.cursoCode
  const anio = parseInt(code[0])
  const division = code.slice(1)

  if (isNaN(anio)) notFound()

  const curso = await prisma.curso.findFirst({
    where: { anio, division, activo: true },
    include: {
      alumnos: { where: { activo: true }, orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }] },
      tps: { where: { activo: true }, orderBy: { numero: 'asc' } },
    },
  })

  if (!curso) notFound()

  const alumnoIds = curso.alumnos.map((a) => a.id)
  const entregas = alumnoIds.length > 0
    ? await prisma.entrega.findMany({ where: { alumnoId: { in: alumnoIds } } })
    : []

  const serialized = {
    ...curso,
    createdAt: curso.createdAt.toISOString(),
    updatedAt: curso.updatedAt.toISOString(),
    alumnos: curso.alumnos.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    tps: curso.tps.map((t) => ({
      ...t,
      fechaEntrega: t.fechaEntrega?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    entregas: entregas.map((e) => ({
      ...e,
      fechaEntrega: e.fechaEntrega.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <PublicHeader title={curso.nombre} cursoCode={`${curso.anio}°${curso.division}`} cursoColor={curso.color} />
      <main className="flex-1 px-4 py-6 w-full">
        <CourseViewClient curso={serialized} cursoCode={code} />
      </main>
    </div>
  )
}
