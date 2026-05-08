'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api/client'
import type { TP, Curso } from '@/types/models'

interface TPsClientProps {
  initialTPs: (TP & { curso: { nombre: string; color: string } | null; _count: { entregas: number } })[]
  cursos: Curso[]
}

interface FormData {
  titulo: string
  descripcion: string
  numero: string
  cursoId: string
  fechaEntrega: string
  peso: string
  conNota: boolean
}

const EMPTY_FORM: FormData = { titulo: '', descripcion: '', numero: '', cursoId: '', fechaEntrega: '', peso: '1', conNota: false }

export function TPsClient({ initialTPs, cursos }: TPsClientProps) {
  const { toast } = useToast()
  const [tps, setTPs] = useState(initialTPs)
  const [filterCurso, setFilterCurso] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const filtered = filterCurso === 'all' ? tps : tps.filter((t) => t.cursoId === filterCurso)

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(tp: typeof tps[0]) {
    setEditingId(tp.id)
    setForm({
      titulo: tp.titulo,
      descripcion: tp.descripcion ?? '',
      numero: String(tp.numero),
      cursoId: tp.cursoId,
      fechaEntrega: tp.fechaEntrega ? tp.fechaEntrega.slice(0, 10) : '',
      peso: String(tp.peso),
      conNota: tp.conNota,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion || undefined,
      numero: parseInt(form.numero),
      cursoId: form.cursoId,
      fechaEntrega: form.fechaEntrega ? new Date(form.fechaEntrega).toISOString() : null,
      peso: parseFloat(form.peso),
      conNota: form.conNota,
    }
    try {
      if (editingId) {
        const updated = await api.put<TP & { curso: any; _count: any }>(`/api/tps/${editingId}`, payload)
        setTPs((prev) => prev.map((t) => t.id === editingId ? { ...t, ...updated } : t))
        toast({ title: 'TP actualizado' })
      } else {
        const created = await api.post<TP & { curso: any; _count: any }>('/api/tps', payload)
        const curso = cursos.find((c) => c.id === payload.cursoId)
        setTPs((prev) => [...prev, { ...created, curso: curso ? { nombre: curso.nombre, color: curso.color } : null, _count: { entregas: 0 } }])
        toast({ title: 'TP creado' })
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
      await api.delete(`/api/tps/${deletingId}`)
      setTPs((prev) => prev.filter((t) => t.id !== deletingId))
      toast({ title: 'TP eliminado' })
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
          <h2 className="text-xl font-bold text-white">Trabajos Prácticos</h2>
          <p className="text-slate-400 text-sm">{tps.length} TPs registrados</p>
        </div>
        <Button onClick={openCreate} variant="gradient">
          <Plus className="w-4 h-4" />
          Nuevo TP
        </Button>
      </div>

      <Select value={filterCurso} onValueChange={setFilterCurso}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Todos los cursos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los cursos</SelectItem>
          {cursos.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((tp, i) => (
            <motion.div
              key={tp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: tp.curso?.color ?? '#6366f1' }}
                  >
                    {tp.numero}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium leading-tight">{tp.titulo}</div>
                    {tp.curso && (
                      <div className="text-xs text-slate-400">{tp.curso.nombre}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => openEdit(tp)}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setDeletingId(tp.id); setDeleteDialogOpen(true) }}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {tp.descripcion && (
                <p className="text-xs text-slate-400 mb-2 line-clamp-2">{tp.descripcion}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <FileText className="w-3 h-3" />
                {tp._count.entregas} entregas
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                  tp.conNota
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                    : 'bg-slate-700/50 text-slate-400 border-slate-600/40'
                }`}>
                  {tp.conNota ? 'Con nota' : 'Solo entrega'}
                </span>
                {tp.fechaEntrega && (
                  <span className="ml-auto">
                    Vence: {new Date(tp.fechaEntrega).toLocaleDateString('es-AR')}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar TP' : 'Nuevo TP'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Número</Label>
                <Input
                  type="number"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  placeholder="1"
                  required
                  className="mt-1"
                  min={1}
                />
              </div>
              <div>
                <Label>Curso</Label>
                <Select value={form.cursoId} onValueChange={(v) => setForm({ ...form, cursoId: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Título</Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="TP 1 — Excel básico"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Descripción (opcional)</Label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Descripción del TP..."
                className="w-full mt-1 bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500 resize-none h-20"
              />
            </div>
            <div>
              <Label>Fecha límite (opcional)</Label>
              <Input
                type="date"
                value={form.fechaEntrega}
                onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/40">
              <div>
                <div className="text-sm font-medium text-white">Lleva nota</div>
                <div className="text-xs text-slate-400">Si está activo, el TP tiene calificación numérica</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, conNota: !form.conNota })}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.conNota ? 'bg-violet-600' : 'bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.conNota ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="gradient" disabled={loading}>
                {loading ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear TP'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar TP?</DialogTitle>
            <DialogDescription>Esta acción elimina el TP y todas sus entregas asociadas. No se puede deshacer.</DialogDescription>
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
