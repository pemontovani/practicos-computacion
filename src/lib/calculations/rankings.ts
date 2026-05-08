import type { AlumnoConProgreso } from '@/types/models'

export function computeRankings(alumnos: AlumnoConProgreso[]): AlumnoConProgreso[] {
  return [...alumnos]
    .sort((a, b) => b.progreso - a.progreso || a.apellido.localeCompare(b.apellido))
    .map((a, i) => ({ ...a, rank: i + 1 }))
}

export function getPodium(ranked: AlumnoConProgreso[]): AlumnoConProgreso[] {
  return ranked.slice(0, 3)
}

export function getAtrasados(alumnos: AlumnoConProgreso[]): AlumnoConProgreso[] {
  return alumnos.filter((a) => a.progreso < 40).sort((a, b) => a.progreso - b.progreso)
}

export function getDestacados(alumnos: AlumnoConProgreso[]): AlumnoConProgreso[] {
  return alumnos.filter((a) => a.progreso >= 70).sort((a, b) => b.progreso - a.progreso)
}
