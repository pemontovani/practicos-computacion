'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Minus, Loader2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Entrega } from '@/types/models'

interface DeliveryCellProps {
  alumnoId: string
  tpId: string
  entrega?: Entrega
  onToggle: () => void
  isPending: boolean
  readOnly?: boolean
  conNota?: boolean
  onNota?: (nota: number | null) => void
}

export function DeliveryCell({ entrega, onToggle, isPending, readOnly, conNota, onNota }: DeliveryCellProps) {
  const [editingNota, setEditingNota] = useState(false)
  const [notaInput, setNotaInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const hasEntrega = !!entrega
  const isIncompleto = entrega?.estado === 'INCOMPLETO'
  const isEntregado = entrega?.estado === 'ENTREGADO'
  const nota = entrega?.nota ?? null

  const Tag = readOnly ? 'div' : 'button'

  function handleNotaClick(e: React.MouseEvent) {
    if (readOnly || !isEntregado || !onNota) return
    e.stopPropagation()
    setNotaInput(nota != null ? String(nota) : '')
    setEditingNota(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleNotaSubmit() {
    const val = notaInput.trim()
    if (val === '') {
      onNota?.(null)
    } else {
      const num = parseFloat(val)
      if (!isNaN(num) && num >= 0 && num <= 10) {
        onNota?.(Math.round(num * 10) / 10)
      }
    }
    setEditingNota(false)
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Tag
        {...(!readOnly && { onClick: onToggle, disabled: isPending })}
        className={cn(
          'w-8 h-8 rounded-lg border transition-all duration-200 flex items-center justify-center mx-auto',
          hasEntrega
            ? isIncompleto
              ? readOnly ? 'bg-amber-500/20 border-amber-500/40' : 'bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30'
              : readOnly ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30'
            : readOnly ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/60 hover:border-slate-500',
          !readOnly && isPending && 'opacity-50 cursor-wait'
        )}
      >
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
            </motion.div>
          ) : hasEntrega ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {isIncompleto
                ? <Clock className="w-3.5 h-3.5 text-amber-400" />
                : <Check className="w-3.5 h-3.5 text-emerald-400" />
              }
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Minus className="w-3.5 h-3.5 text-slate-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </Tag>

      {/* Badge de nota — solo TPs con conNota y estado ENTREGADO */}
      {conNota && isEntregado && (
        <div className="h-4 flex items-center">
          {editingNota && !readOnly ? (
            <input
              ref={inputRef}
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={notaInput}
              onChange={(e) => setNotaInput(e.target.value)}
              onBlur={handleNotaSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNotaSubmit()
                if (e.key === 'Escape') setEditingNota(false)
              }}
              className="w-10 text-center text-[10px] bg-slate-800 border border-violet-500 rounded text-white outline-none px-0.5 py-0"
            />
          ) : (
            <span
              onClick={handleNotaClick}
              title={!readOnly ? 'Click para editar nota' : undefined}
              className={cn(
                'text-[11px] font-bold rounded px-1 leading-none',
                nota != null
                  ? 'text-violet-400'
                  : 'text-slate-600',
                !readOnly && 'cursor-pointer hover:text-violet-300'
              )}
            >
              {nota != null ? nota : '·'}
            </span>
          )}
        </div>
      )}

      {/* Espacio reservado para TPs sin nota (mantiene altura consistente) */}
      {conNota && !isEntregado && (
        <div className="h-4" />
      )}
    </div>
  )
}
