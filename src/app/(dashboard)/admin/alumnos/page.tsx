import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AlumnosClient } from './AlumnosClient'

export default async function AlumnosPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [alumnos, cursos] = await Promise.all([
    prisma.alumno.findMany({
      where: { activo: true },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
      include: { curso: { select: { nombre: true, color: true } } },
    }),
    prisma.curso.findMany({ where: { activo: true }, orderBy: [{ anio: 'asc' }, { division: 'asc' }] }),
  ])

  const serialized = alumnos.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }))

  const cursosSerial = cursos.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return <AlumnosClient initialAlumnos={serialized} cursos={cursosSerial} />
}
