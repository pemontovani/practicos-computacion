import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateProgress, getColorTier } from '@/lib/calculations/progress'
import { z } from 'zod'

const cursoSchema = z.object({
  nombre: z.string().min(1).max(100),
  anio: z.number().int().min(1).max(6),
  division: z.string().min(1).max(5),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = cursoSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

    const curso = await prisma.curso.create({ data: parsed.data })
    return NextResponse.json({ data: curso }, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: `El curso ${body?.anio}°${body?.division} ya existe` }, { status: 409 })
    return NextResponse.json({ error: 'Error al crear curso' }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const cursos = await prisma.curso.findMany({
      where: { activo: true },
      orderBy: [{ anio: 'asc' }, { division: 'asc' }],
      include: {
        alumnos: { where: { activo: true }, select: { id: true } },
        tps: { where: { activo: true }, select: { id: true } },
      },
    })

    const cursosConStats = await Promise.all(
      cursos.map(async (curso) => {
        const alumnoIds = curso.alumnos.map((a) => a.id)
        const totalTPs = curso.tps.length

        let promedioGeneral = 0
        let destacados = 0
        let atrasados = 0
        let enProgreso = 0

        if (alumnoIds.length > 0 && totalTPs > 0) {
          const entregas = await prisma.entrega.groupBy({
            by: ['alumnoId'],
            where: { alumnoId: { in: alumnoIds } },
            _count: { id: true },
          })

          const progressValues = alumnoIds.map((id) => {
            const count = entregas.find((e) => e.alumnoId === id)?._count.id ?? 0
            return calculateProgress(count, totalTPs)
          })

          promedioGeneral = Math.round(
            progressValues.reduce((a, b) => a + b, 0) / progressValues.length
          )
          destacados = progressValues.filter((p) => p >= 70).length
          atrasados = progressValues.filter((p) => p < 40).length
          enProgreso = progressValues.filter((p) => p >= 40 && p < 70).length
        }

        return {
          id: curso.id,
          nombre: curso.nombre,
          anio: curso.anio,
          division: curso.division,
          color: curso.color,
          activo: curso.activo,
          createdAt: curso.createdAt,
          updatedAt: curso.updatedAt,
          totalAlumnos: alumnoIds.length,
          totalTPs,
          promedioGeneral,
          destacados,
          atrasados,
          enProgreso,
        }
      })
    )

    return NextResponse.json({ data: cursosConStats })
  } catch {
    return NextResponse.json({ error: 'Error al obtener cursos' }, { status: 500 })
  }
}
