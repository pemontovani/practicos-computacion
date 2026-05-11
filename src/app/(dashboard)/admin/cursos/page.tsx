import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CursosClient } from './CursosClient'

export default async function CursosPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const cursos = await prisma.curso.findMany({
    orderBy: [{ anio: 'asc' }, { division: 'asc' }],
    include: {
      _count: { select: { alumnos: true, tps: true } },
    },
  })

  return <CursosClient initialCursos={cursos} />
}
