'use client'

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
}

export function DeliveryCell({ entrega, onToggle, isPending, readOnly }: DeliveryCellProps) {
  const hasEntrega = !!entrega
  const isTardio = entrega?.estado === 'INCOMPLETO'

  const Tag = readOnly ? 'div' : 'button'

  return (
    <Tag
      {...(!readOnly && { onClick: onToggle, disabled: isPending })}
      className={cn(
        'w-8 h-8 rounded-lg border transition-all duration-200 flex items-center justify-center mx-auto',
        hasEntrega
          ? isTardio
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
            {isTardio
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
  )
}
