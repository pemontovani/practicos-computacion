import { COLOR_THRESHOLDS } from '@/lib/constants'

export type ColorTier = 'verde' | 'amarillo' | 'rojo'

export function calculateProgress(entregasCount: number, totalTPs: number): number {
  if (totalTPs === 0) return 0
  return Math.min(100, Math.round((entregasCount / totalTPs) * 100))
}

export function getColorTier(percent: number): ColorTier {
  if (percent >= COLOR_THRESHOLDS.verde) return 'verde'
  if (percent >= COLOR_THRESHOLDS.amarillo) return 'amarillo'
  return 'rojo'
}

export function getTierColors(tier: ColorTier) {
  const map = {
    verde: {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-300',
      hex: '#22c55e',
    },
    amarillo: {
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      bar: 'bg-amber-500',
      badge: 'bg-amber-500/20 text-amber-300',
      hex: '#eab308',
    },
    rojo: {
      bg: 'bg-red-500/15',
      border: 'border-red-500/30',
      text: 'text-red-400',
      bar: 'bg-red-500',
      badge: 'bg-red-500/20 text-red-300',
      hex: '#ef4444',
    },
  }
  return map[tier]
}
