import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const alumnoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  apellido: z.string().min(1, 'El apellido es requerido').max(100),
  cursoId: z.string().cuid('Curso inválido'),
  carColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido').default('#3b82f6'),
  legajo: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

export const tpSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido').max(200),
  descripcion: z.string().optional(),
  numero: z.number().int().positive('El número debe ser positivo'),
  cursoId: z.string().cuid('Curso inválido'),
  fechaEntrega: z.string().datetime().optional().nullable(),
  peso: z.number().min(0).max(10).default(1.0),
  conNota: z.boolean().default(false),
})

export const entregaSchema = z.object({
  alumnoId: z.string().cuid('Alumno inválido'),
  tpId: z.string().cuid('TP inválido'),
  estado: z.enum(['ENTREGADO', 'INCOMPLETO', 'REENTREGA']).default('ENTREGADO'),
  nota: z.number().min(0).max(10).optional().nullable(),
  comentario: z.string().max(500).optional(),
  fechaEntrega: z.string().datetime().optional(),
})

export const cursoSchema = z.object({
  nombre: z.string().min(1).max(100),
  anio: z.number().int().min(1).max(6),
  division: z.string().min(1).max(5),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type AlumnoInput = z.infer<typeof alumnoSchema>
export type TPInput = z.infer<typeof tpSchema>
export type EntregaInput = z.infer<typeof entregaSchema>
export type CursoInput = z.infer<typeof cursoSchema>
