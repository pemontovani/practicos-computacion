import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { tpSchema } from '@/lib/validations'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cursoId = searchParams.get('cursoId')

  try {
    const tps = await prisma.tP.findMany({
      where: { activo: true, ...(cursoId ? { cursoId } : {}) },
      orderBy: [{ cursoId: 'asc' }, { numero: 'asc' }],
      include: { _count: { select: { entregas: true } } },
    })
    return NextResponse.json({ data: tps })
  } catch {
    return NextResponse.json({ error: 'Error al obtener TPs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = tpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const { fechaEntrega, ...rest } = parsed.data
    const tp = await prisma.tP.create({
      data: {
        ...rest,
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
      },
    })
    return NextResponse.json({ data: tp }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear TP' }, { status: 500 })
  }
}
