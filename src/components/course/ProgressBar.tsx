'use client'

import { motion } from 'framer-motion'
import { getColorTier, getTierColors } from '@/lib/calculations/progress'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  percent: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
  className?: string
}

export function ProgressBar({ percent, showLabel = true, size = 'md', animate = true, className }: ProgressBarProps) {
  const tier = getColorTier(percent)
  const colors = getTierColors(tier)

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 bg-slate-700 rounded-full overflow-hidden', heights[size])}>
        {animate ? (
          <motion.div
            className={cn('h-full rounded-full', colors.bar)}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ) : (
          <div className={cn('h-full rounded-full', colors.bar)} style={{ width: `${percent}%` }} />
        )}
      </div>
      {showLabel && (
        <span className={cn('text-xs font-semibold w-10 text-right', colors.text)}>
          {Math.round(percent)}%
        </span>
      )}
    </div>
  )
}
