import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  anio: z.number().int().min(1).max(6).optional(),
  division: z.string().min(1).max(5).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  activo: z.boolean().optional(),
})

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

    const curso = await prisma.curso.update({ where: { id: params.id }, data: parsed.data })
    return NextResponse.json({ data: curso })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar curso' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await prisma.curso.delete({ where: { id: params.id } })
    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar curso' }, { status: 500 })
  }
}

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
