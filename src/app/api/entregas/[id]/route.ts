import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  estado: z.enum(['ENTREGADO', 'INCOMPLETO', 'REENTREGA']).optional(),
  nota: z.number().min(0).max(10).nullable().optional(),
  comentario: z.string().max(500).nullable().optional(),
})

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const entrega = await prisma.entrega.update({ where: { id: params.id }, data: parsed.data })
    return NextResponse.json({ data: entrega })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar entrega' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await prisma.entrega.delete({ where: { id: params.id } })
    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar entrega' }, { status: 500 })
  }
}
