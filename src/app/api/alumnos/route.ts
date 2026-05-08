import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { alumnoSchema } from '@/lib/validations'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cursoId = searchParams.get('cursoId')

  try {
    const alumnos = await prisma.alumno.findMany({
      where: { activo: true, ...(cursoId ? { cursoId } : {}) },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
      include: { curso: { select: { nombre: true, color: true } } },
    })
    return NextResponse.json({ data: alumnos })
  } catch {
    return NextResponse.json({ error: 'Error al obtener alumnos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = alumnoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const alumno = await prisma.alumno.create({ data: parsed.data })
    return NextResponse.json({ data: alumno }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear alumno' }, { status: 500 })
  }
}
