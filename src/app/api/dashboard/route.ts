import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateProgress, getColorTier } from '@/lib/calculations/progress'
import { computeRankings, getAtrasados, getDestacados } from '@/lib/calculations/rankings'
import type { AlumnoConProgreso } from '@/types/models'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const cursos = await prisma.curso.findMany({
      where: { activo: true },
      include: {
        alumnos: { where: { activo: true } },
        tps: { where: { activo: true } },
      },
      orderBy: [{ anio: 'asc' }, { division: 'asc' }],
    })

    let totalAlumnos = 0
    let totalTPs = 0
    const allAlumnosConProgreso: AlumnoConProgreso[] = []
    const cursosStats = []

    for (const curso of cursos) {
      const alumnoIds = curso.alumnos.map((a) => a.id)
      const totalTPsCurso = curso.tps.length
      totalTPs += totalTPsCurso
      totalAlumnos += alumnoIds.length

      const entregasAgrupadas = alumnoIds.length > 0
        ? await prisma.entrega.groupBy({
            by: ['alumnoId'],
            where: { alumnoId: { in: alumnoIds } },
            _count: { id: true },
          })
        : []

      const alumnosCP: AlumnoConProgreso[] = curso.alumnos.map((alumno) => {
        const count = entregasAgrupadas.find((e) => e.alumnoId === alumno.id)?._count.id ?? 0
        const progreso = calculateProgress(count, totalTPsCurso)
        return {
          ...alumno,
          legajo: alumno.legajo ?? null,
          email: alumno.email ?? null,
          createdAt: alumno.createdAt.toISOString(),
          updatedAt: alumno.updatedAt.toISOString(),
          progreso,
          entregasCount: count,
          totalTPs: totalTPsCurso,
          colorTier: getColorTier(progreso),
          curso: {
            id: curso.id,
            nombre: curso.nombre,
            anio: curso.anio,
            division: curso.division,
            color: curso.color,
            activo: curso.activo,
            createdAt: curso.createdAt.toISOString(),
            updatedAt: curso.updatedAt.toISOString(),
          },
        }
      })

      allAlumnosConProgreso.push(...alumnosCP)

      const promedioGeneral = alumnosCP.length
        ? Math.round(alumnosCP.reduce((s, a) => s + a.progreso, 0) / alumnosCP.length)
        : 0

      cursosStats.push({
        id: curso.id,
        nombre: curso.nombre,
        anio: curso.anio,
        division: curso.division,
        color: curso.color,
        activo: curso.activo,
        createdAt: curso.createdAt.toISOString(),
        updatedAt: curso.updatedAt.toISOString(),
        totalAlumnos: alumnoIds.length,
        totalTPs: totalTPsCurso,
        promedioGeneral,
        destacados: alumnosCP.filter((a) => a.progreso >= 70).length,
        atrasados: alumnosCP.filter((a) => a.progreso < 40).length,
        enProgreso: alumnosCP.filter((a) => a.progreso >= 40 && a.progreso < 70).length,
      })
    }

    const ranked = computeRankings(allAlumnosConProgreso)
    const promedioGlobal = ranked.length
      ? Math.round(ranked.reduce((s, a) => s + a.progreso, 0) / ranked.length)
      : 0

    return NextResponse.json({
      data: {
        totalAlumnos,
        totalCursos: cursos.length,
        totalTPs,
        promedioGlobal,
        cursosStats,
        topAlumnos: ranked.slice(0, 10),
        atrasados: getAtrasados(ranked).slice(0, 10),
        destacados: getDestacados(ranked).slice(0, 10),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener dashboard' }, { status: 500 })
  }
}
