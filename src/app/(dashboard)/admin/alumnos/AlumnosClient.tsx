'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api/client'
import { CAR_COLORS } from '@/lib/constants'
import type { Alumno, Curso } from '@/types/models'

interface AlumnosClientProps {
  initialAlumnos: (Alumno & { curso: { nombre: string; color: string } | null })[]
  cursos: Curso[]
}

interface FormData {
  nombre: string
  apellido: string
  cursoId: string
  carColor: string
  legajo: string
}

const EMPTY_FORM: FormData = { nombre: '', apellido: '', cursoId: '', carColor: CAR_COLORS[0], legajo: '' }

export function AlumnosClient({ initialAlumnos, cursos }: AlumnosClientProps) {
  const { toast } = useToast()
  const [alumnos, setAlumnos] = useState(initialAlumnos)
  const [search, setSearch] = useState('')
  const [filterCurso, setFilterCurso] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const filtered = alumnos.filter((a) => {
    const matchSearch = !search ||
      `${a.nombre} ${a.apellido}`.toLowerCase().includes(search.toLowerCase())
    const matchCurso = filterCurso === 'all' || a.cursoId === filterCurso
    return matchSearch && matchCurso
  })

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(alumno: typeof alumnos[0]) {
    setEditingId(alumno.id)
    setForm({
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      cursoId: alumno.cursoId,
      carColor: alumno.carColor,
      legajo: alumno.legajo ?? '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        const updated = await api.put<Alumno & { curso: any }>(`/api/alumnos/${editingId}`, form)
        setAlumnos((prev) => prev.map((a) => a.id === editingId ? { ...a, ...updated } : a))
        toast({ title: 'Alumno actualizado' })
      } else {
        const created = await api.post<Alumno & { curso: any }>('/api/alumnos', form)
        const curso = cursos.find((c) => c.id === form.cursoId)
        setAlumnos((prev) => [...prev, { ...created, curso: curso ? { nombre: curso.nombre, color: curso.color } : null }])
        toast({ title: 'Alumno creado' })
      }
      setDialogOpen(false)
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    setLoading(true)
    try {
      await api.delete(`/api/alumnos/${deletingId}`)
      setAlumnos((prev) => prev.filter((a) => a.id !== deletingId))
      toast({ title: 'Alumno eliminado' })
      setDeleteDialogOpen(false)
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Alumnos</h2>
          <p className="text-slate-400 text-sm">{alumnos.length} alumnos registrados</p>
        </div>
        <Button onClick={openCreate} variant="gradient">
          <UserPlus className="w-4 h-4" />
          Nuevo alumno
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar alumno..."
            className="pl-10"
          />
        </div>
        <Select value={filterCurso} onValueChange={setFilterCurso}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos los cursos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cursos</SelectItem>
            {cursos.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700/50">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Alumno</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Curso</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Legajo</th>
              <th className="px-4 py-3 text-slate-400 font-medium w-20">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            <AnimatePresence>
              {filtered.map((alumno, i) => (
                <motion.tr
                  key={alumno.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: alumno.carColor }}
                      >
                        {alumno.nombre[0]}{alumno.apellido[0]}
                      </div>
                      <span className="text-white font-medium">
                        {alumno.apellido}, {alumno.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {alumno.curso && (
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: `${alumno.curso.color}20`,
                          color: alumno.curso.color,
                          border: `1px solid ${alumno.curso.color}30`,
                        }}
                      >
                        {alumno.curso.nombre}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                    {alumno.legajo ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(alumno)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setDeletingId(alumno.id); setDeleteDialogOpen(true) }}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">No se encontraron alumnos</div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar alumno' : 'Nuevo alumno'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Juan"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Apellido</Label>
                <Input
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                  placeholder="Pérez"
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Curso</Label>
              <Select value={form.cursoId} onValueChange={(v) => setForm({ ...form, cursoId: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Color del auto</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {CAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, carColor: color })}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: form.carColor === color ? 'white' : 'transparent',
                      transform: form.carColor === color ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Legajo (opcional)</Label>
              <Input
                value={form.legajo}
                onChange={(e) => setForm({ ...form, legajo: e.target.value })}
                placeholder="12345"
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" disabled={loading}>
                {loading ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear alumno'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar alumno?</DialogTitle>
            <DialogDescription>
              Esta acción desactiva al alumno pero conserva su historial de entregas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
