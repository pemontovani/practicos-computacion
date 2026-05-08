import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateProgress, getColorTier } from '@/lib/calculations/progress'
import { computeRankings } from '@/lib/calculations/rankings'
import type { AlumnoConProgreso } from '@/types/models'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const curso = await prisma.curso.findUnique({
      where: { id: params.id },
      include: {
        alumnos: { where: { activo: true } },
        tps: { where: { activo: true } },
      },
    })

    if (!curso) return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })

    const totalTPs = curso.tps.length
    const alumnoIds = curso.alumnos.map((a) => a.id)

    const entregasAgrupadas = await prisma.entrega.groupBy({
      by: ['alumnoId'],
      where: { alumnoId: { in: alumnoIds } },
      _count: { id: true },
    })

    const alumnosConProgreso: AlumnoConProgreso[] = curso.alumnos.map((alumno) => {
      const count = entregasAgrupadas.find((e) => e.alumnoId === alumno.id)?._count.id ?? 0
      const progreso = calculateProgress(count, totalTPs)
      return {
        ...alumno,
        legajo: alumno.legajo ?? null,
        email: alumno.email ?? null,
        createdAt: alumno.createdAt.toISOString(),
        updatedAt: alumno.updatedAt.toISOString(),
        progreso,
        entregasCount: count,
        totalTPs,
        colorTier: getColorTier(progreso),
      }
    })

    const ranked = computeRankings(alumnosConProgreso)
    const promedioGeneral = ranked.length
      ? Math.round(ranked.reduce((s, a) => s + a.progreso, 0) / ranked.length)
      : 0

    return NextResponse.json({
      data: {
        alumnos: ranked,
        totalAlumnos: ranked.length,
        totalTPs,
        promedioGeneral,
        destacados: ranked.filter((a) => a.progreso >= 70).length,
        atrasados: ranked.filter((a) => a.progreso < 40).length,
        enProgreso: ranked.filter((a) => a.progreso >= 40 && a.progreso < 70).length,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener stats' }, { status: 500 })
  }
}
