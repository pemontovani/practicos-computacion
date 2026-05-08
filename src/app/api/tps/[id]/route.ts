import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { tpSchema } from '@/lib/validations'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const tp = await prisma.tP.findUnique({
      where: { id: params.id },
      include: { _count: { select: { entregas: true } } },
    })
    if (!tp) return NextResponse.json({ error: 'TP no encontrado' }, { status: 404 })
    return NextResponse.json({ data: tp })
  } catch {
    return NextResponse.json({ error: 'Error al obtener TP' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = tpSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const { fechaEntrega, ...rest } = parsed.data
    const tp = await prisma.tP.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(fechaEntrega !== undefined ? { fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null } : {}),
      },
    })
    return NextResponse.json({ data: tp })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar TP' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await prisma.tP.delete({ where: { id: params.id } })
    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar TP' }, { status: 500 })
  }
}
