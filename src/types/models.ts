import type { ColorTier } from '@/lib/calculations/progress'

export interface Curso {
  id: string
  nombre: string
  anio: number
  division: string
  color: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface Alumno {
  id: string
  nombre: string
  apellido: string
  legajo?: string | null
  email?: string | null
  cursoId: string
  carColor: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface TP {
  id: string
  titulo: string
  descripcion?: string | null
  numero: number
  cursoId: string
  fechaEntrega?: string | null
  peso: number
  conNota: boolean
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface Entrega {
  id: string
  alumnoId: string
  tpId: string
  estado: 'ENTREGADO' | 'INCOMPLETO' | 'REENTREGA'
  fechaEntrega: string
  nota?: number | null
  comentario?: string | null
  createdAt: string
  updatedAt: string
}

export interface AlumnoConProgreso extends Alumno {
  progreso: number
  entregasCount: number
  totalTPs: number
  colorTier: ColorTier
  rank?: number
  curso?: Curso
}

export interface CursoConStats extends Curso {
  totalAlumnos: number
  totalTPs: number
  promedioGeneral: number
  destacados: number
  atrasados: number
  enProgreso: number
}

export interface CursoDetalle extends Curso {
  alumnos: Alumno[]
  tps: TP[]
  entregas: Entrega[]
}

export interface DashboardStats {
  totalAlumnos: number
  totalCursos: number
  totalTPs: number
  promedioGlobal: number
  cursosStats: CursoConStats[]
  topAlumnos: AlumnoConProgreso[]
  atrasados: AlumnoConProgreso[]
  destacados: AlumnoConProgreso[]
}
