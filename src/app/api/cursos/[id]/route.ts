import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const curso = await prisma.curso.findUnique({
      where: { id: params.id },
      include: {
        alumnos: { where: { activo: true }, orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }] },
        tps: { where: { activo: true }, orderBy: { numero: 'asc' } },
      },
    })

    if (!curso) return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })

    const alumnoIds = curso.alumnos.map((a) => a.id)
    const entregas = alumnoIds.length > 0
      ? await prisma.entrega.findMany({ where: { alumnoId: { in: alumnoIds } } })
      : []

    return NextResponse.json({ data: { ...curso, entregas } })
  } catch {
    return NextResponse.json({ error: 'Error al obtener curso' }, { status: 500 })
  }
}
