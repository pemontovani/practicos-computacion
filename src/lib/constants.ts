export const COLOR_THRESHOLDS = {
  verde: 70,
  amarillo: 40,
} as const

export const CAR_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#f97316', // orange
  '#ec4899', // pink
  '#06b6d4', // cyan
] as const

export const CURSO_COLORS: Record<string, string> = {
  '2A': '#6366f1',
  '2B': '#ec4899',
  '3A': '#f97316',
  '3B': '#22c55e',
}

export const ESTADO_LABELS = {
  ENTREGADO: 'Entregado',
  INCOMPLETO: 'Incompleto',
  REENTREGA: 'Reentrega',
} as const

export const ESTADO_COLORS = {
  ENTREGADO: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  INCOMPLETO: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  REENTREGA: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
} as const
