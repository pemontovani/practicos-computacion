'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Users, BookOpen, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api/client'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4',
]

interface Curso {
  id: string
  nombre: string
  anio: number
  division: string
  color: string
  activo: boolean
  _count: { alumnos: number; tps: number }
}

interface FormData {
  nombre: string
  anio: string
  division: string
  color: string
}

const EMPTY_FORM: FormData = { nombre: '', anio: '', division: '', color: COLORS[0] }

export function CursosClient({ initialCursos }: { initialCursos: Curso[] }) {
  const { toast } = useToast()
  const [cursos, setCursos] = useState(initialCursos)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(curso: Curso) {
    setEditingId(curso.id)
    setForm({
      nombre: curso.nombre,
      anio: String(curso.anio),
      division: curso.division,
      color: curso.color,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      nombre: form.nombre,
      anio: parseInt(form.anio),
      division: form.division.toUpperCase(),
      color: form.color,
    }
    try {
      if (editingId) {
        const updated = await api.put<Curso>(`/api/cursos/${editingId}`, payload)
        setCursos((prev) => prev.map((c) => c.id === editingId ? { ...c, ...updated } : c))
        toast({ title: 'Curso actualizado' })
      } else {
        const created = await api.post<Curso>('/api/cursos', payload)
        setCursos((prev) => [...prev, { ...created, _count: { alumnos: 0, tps: 0 } }])
        toast({ title: 'Curso creado' })
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
      await api.delete(`/api/cursos/${deletingId}`)
      setCursos((prev) => prev.filter((c) => c.id !== deletingId))
      toast({ title: 'Curso eliminado' })
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
          <h2 className="text-xl font-bold text-white">Cursos</h2>
          <p className="text-slate-400 text-sm">{cursos.length} cursos registrados</p>
        </div>
        <Button onClick={openCreate} variant="gradient">
          <Plus className="w-4 h-4" />
          Nuevo curso
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {cursos.map((curso, i) => {
            const cursoCode = `${curso.anio}${curso.division}`
            return (
              <motion.div
                key={curso.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: curso.color }}
                    >
                      {curso.anio}°{curso.division}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{curso.nombre}</div>
                      <a
                        href={`/curso/${cursoCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5"
                      >
                        /curso/{cursoCode}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(curso)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setDeletingId(curso.id); setDeleteDialogOpen(true) }}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {curso._count.alumnos} alumnos
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {curso._count.tps} TPs
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {cursos.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No hay cursos. Creá el primero.</p>
          </div>
        )}
      </div>

      {/* Dialog: crear / editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar curso' : 'Nuevo curso'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Año</Label>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: e.target.value })}
                  placeholder="2"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>División</Label>
                <Input
                  value={form.division}
                  onChange={(e) => setForm({ ...form, division: e.target.value.toUpperCase() })}
                  placeholder="A"
                  maxLength={3}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Nombre del curso</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Computación 2°A"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: form.color === color ? 'white' : 'transparent',
                      transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="gradient" disabled={loading}>
                {loading ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear curso'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: confirmar eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar curso?</DialogTitle>
            <DialogDescription>
              Esta acción elimina el curso y todos sus alumnos, TPs y entregas asociadas. No se puede deshacer.
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
