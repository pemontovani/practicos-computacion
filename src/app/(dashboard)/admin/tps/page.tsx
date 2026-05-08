import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TPsClient } from './TPsClient'

export default async function TPsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [tps, cursos] = await Promise.all([
    prisma.tP.findMany({
      where: { activo: true },
      orderBy: [{ cursoId: 'asc' }, { numero: 'asc' }],
      include: {
        curso: { select: { nombre: true, color: true } },
        _count: { select: { entregas: true } },
      },
    }),
    prisma.curso.findMany({ where: { activo: true }, orderBy: [{ anio: 'asc' }, { division: 'asc' }] }),
  ])

  const serialized = tps.map((t) => ({
    ...t,
    fechaEntrega: t.fechaEntrega?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))

  const cursosSerial = cursos.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return <TPsClient initialTPs={serialized} cursos={cursosSerial} />
}
