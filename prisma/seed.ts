import { PrismaClient, EstadoEntrega } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const CAR_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#ec4899', '#06b6d4']

const CURSOS_DATA = [
  { nombre: '2° Año A', anio: 2, division: 'A', color: '#6366f1' },
  { nombre: '2° Año B', anio: 2, division: 'B', color: '#ec4899' },
  { nombre: '3° Año A', anio: 3, division: 'A', color: '#f97316' },
  { nombre: '3° Año B', anio: 3, division: 'B', color: '#22c55e' },
]

const ALUMNOS_2 = [
  ['Valentina', 'García'], ['Lucía', 'Rodríguez'], ['Martina', 'González'],
  ['Sofía', 'López'], ['Camila', 'Martínez'], ['Isabella', 'Sánchez'],
  ['Emilia', 'Pérez'], ['Daniela', 'Ramírez'], ['Valeria', 'Torres'],
  ['Natalia', 'Flores'], ['Tomás', 'Díaz'], ['Santiago', 'Moreno'],
  ['Mateo', 'Jiménez'], ['Sebastián', 'Ruiz'], ['Lucas', 'Hernández'],
  ['Benjamín', 'López'], ['Nicolás', 'González'], ['Agustín', 'Martín'],
  ['Facundo', 'Romero'], ['Ignacio', 'Alvarez'], ['Thiago', 'Torres'],
  ['Axel', 'Vargas'], ['Brian', 'Castro'], ['Franco', 'Ríos'],
]

const ALUMNOS_3 = [
  ['Ana', 'Fernández'], ['Paula', 'Guerrero'], ['Florencia', 'Medina'],
  ['Micaela', 'Castillo'], ['Julieta', 'Ortega'], ['Romina', 'Mendoza'],
  ['Aldana', 'Herrera'], ['Brenda', 'Morales'], ['Vanesa', 'Delgado'],
  ['Carolina', 'Núñez'], ['Ezequiel', 'Paredes'], ['Rodrigo', 'Vega'],
  ['Leandro', 'Cruz'], ['Gustavo', 'Reyes'], ['Darío', 'Molina'],
  ['Mauricio', 'Silva'], ['Pablo', 'Romero'], ['Cristian', 'Navarro'],
  ['Damián', 'Ramos'], ['Jorge', 'Soto'], ['Marcos', 'Arias'],
  ['Andrés', 'Aguilar'], ['Federico', 'Cabrera'], ['Diego', 'Suárez'],
]

const TPS_2 = [
  { titulo: 'TP 1 — Funciones básicas Excel', numero: 1 },
  { titulo: 'TP 2 — Gráficos y formato condicional', numero: 2 },
  { titulo: 'TP 3 — BUSCAR y SUMAR.SI', numero: 3 },
  { titulo: 'TP 4 — Redes y ciberseguridad', numero: 4 },
  { titulo: 'TP 5 — Presentación multimedia', numero: 5 },
  { titulo: 'TP 6 — Algoritmos con Scratch I', numero: 6 },
  { titulo: 'TP 7 — Algoritmos con Scratch II', numero: 7 },
  { titulo: 'TP 8 — Ciudadanía digital', numero: 8 },
  { titulo: 'TP 9 — Proyecto integrador (parte 1)', numero: 9 },
  { titulo: 'TP 10 — Proyecto integrador (parte 2)', numero: 10 },
]

const TPS_3 = [
  { titulo: 'TP 1 — Tablas dinámicas Excel', numero: 1 },
  { titulo: 'TP 2 — BUSCARV y funciones avanzadas', numero: 2 },
  { titulo: 'TP 3 — Inteligencia Artificial: conceptos', numero: 3 },
  { titulo: 'TP 4 — IA: ética y sesgo algorítmico', numero: 4 },
  { titulo: 'TP 5 — Programación con Scratch', numero: 5 },
  { titulo: 'TP 6 — Robótica: sensores y actuadores', numero: 6 },
  { titulo: 'TP 7 — Big Data: datos abiertos Ushuaia', numero: 7 },
  { titulo: 'TP 8 — Visualización de datos', numero: 8 },
  { titulo: 'TP 9 — Ciberseguridad avanzada', numero: 9 },
  { titulo: 'TP 10 — Proyecto integrador final', numero: 10 },
]

function randomProgress(seed: number): number {
  return ((seed * 37 + 13) % 11) / 10
}

async function main() {
  console.log('🌱 Iniciando seed...')

  await prisma.entrega.deleteMany()
  await prisma.tP.deleteMany()
  await prisma.alumno.deleteMany()
  await prisma.curso.deleteMany()
  await prisma.teacher.deleteMany()

  const passwordHash = await bcrypt.hash('cieu2026', 12)
  const teacher = await prisma.teacher.create({
    data: {
      email: 'pablo@cieu.edu.ar',
      name: 'Pablo Montovani',
      passwordHash,
      role: 'TEACHER',
    },
  })
  console.log(`✅ Docente creado: ${teacher.email}`)

  for (const [cursoIndex, cursoData] of CURSOS_DATA.entries()) {
    const curso = await prisma.curso.create({ data: cursoData })
    console.log(`📚 Curso creado: ${curso.nombre}`)

    const alumnosBase = cursoData.anio === 2 ? ALUMNOS_2 : ALUMNOS_3
    const alumnosData = alumnosBase.map(([nombre, apellido], i) => ({
      nombre,
      apellido,
      cursoId: curso.id,
      carColor: CAR_COLORS[i % CAR_COLORS.length],
      activo: true,
    }))
    await prisma.alumno.createMany({ data: alumnosData })

    const tpsBase = cursoData.anio === 2 ? TPS_2 : TPS_3
    const tpsData = tpsBase.map((tp) => ({ ...tp, cursoId: curso.id }))
    await prisma.tP.createMany({ data: tpsData })

    const alumnos = await prisma.alumno.findMany({ where: { cursoId: curso.id } })
    const tps = await prisma.tP.findMany({ where: { cursoId: curso.id } })

    const entregas = []
    for (const [alumnoIndex, alumno] of alumnos.entries()) {
      const progressFactor = randomProgress(cursoIndex * 100 + alumnoIndex)
      const entregasCount = Math.round(tps.length * progressFactor)

      const shuffled = [...tps].sort(() => ((alumnoIndex * 7 + cursoIndex * 3) % 3) - 1)
      const tpsAEntregar = shuffled.slice(0, entregasCount)

      for (const tp of tpsAEntregar) {
        const dayOffset = (alumnoIndex * 3 + tp.numero * 7) % 14
        entregas.push({
          alumnoId: alumno.id,
          tpId: tp.id,
          estado: dayOffset > 10 ? ('INCOMPLETO' as EstadoEntrega) : ('ENTREGADO' as EstadoEntrega),
          fechaEntrega: new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000),
        })
      }
    }
    await prisma.entrega.createMany({ data: entregas })
    console.log(`   👥 ${alumnos.length} alumnos, ${tps.length} TPs, ${entregas.length} entregas`)
  }

  console.log('\n✅ Seed completado!')
  console.log('🔑 Login: pablo@cieu.edu.ar / cieu2026')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
