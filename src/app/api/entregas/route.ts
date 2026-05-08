import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { entregaSchema } from '@/lib/validations'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const alumnoId = searchParams.get('alumnoId')
  const tpId = searchParams.get('tpId')
  const cursoId = searchParams.get('cursoId')

  try {
    const entregas = await prisma.entrega.findMany({
      where: {
        ...(alumnoId ? { alumnoId } : {}),
        ...(tpId ? { tpId } : {}),
        ...(cursoId ? { alumno: { cursoId } } : {}),
      },
      orderBy: { fechaEntrega: 'desc' },
      include: {
        alumno: { select: { nombre: true, apellido: true } },
        tp: { select: { titulo: true, numero: true } },
      },
    })
    return NextResponse.json({ data: entregas })
  } catch {
    return NextResponse.json({ error: 'Error al obtener entregas' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = entregaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { fechaEntrega, ...rest } = parsed.data
    const entrega = await prisma.entrega.upsert({
      where: { alumnoId_tpId: { alumnoId: rest.alumnoId, tpId: rest.tpId } },
      create: {
        ...rest,
        nota: rest.nota ?? null,
        comentario: rest.comentario ?? null,
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : new Date(),
      },
      update: {
        estado: rest.estado,
        nota: rest.nota ?? null,
        comentario: rest.comentario ?? null,
        ...(fechaEntrega ? { fechaEntrega: new Date(fechaEntrega) } : {}),
      },
    })
    return NextResponse.json({ data: entrega }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear entrega' }, { status: 500 })
  }
}
