import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { alumnoSchema } from '@/lib/validations'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const alumno = await prisma.alumno.findUnique({
      where: { id: params.id },
      include: {
        curso: true,
        entregas: { include: { tp: true }, orderBy: { tp: { numero: 'asc' } } },
      },
    })
    if (!alumno) return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    return NextResponse.json({ data: alumno })
  } catch {
    return NextResponse.json({ error: 'Error al obtener alumno' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = alumnoSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const alumno = await prisma.alumno.update({ where: { id: params.id }, data: parsed.data })
    return NextResponse.json({ data: alumno })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar alumno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await prisma.alumno.update({ where: { id: params.id }, data: { activo: false } })
    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar alumno' }, { status: 500 })
  }
}
