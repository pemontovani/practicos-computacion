import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EntregasClient } from './EntregasClient'

export default async function EntregasPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const cursos = await prisma.curso.findMany({
    where: { activo: true },
    orderBy: [{ anio: 'asc' }, { division: 'asc' }],
  })

  return <EntregasClient cursos={cursos.map((c) => ({ ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() }))} />
}
