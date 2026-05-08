'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MedalBadgeProps {
  position: 1 | 2 | 3
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const MEDALS = {
  1: { emoji: '🥇', color: 'from-yellow-400 to-amber-500', ring: 'ring-yellow-500/40' },
  2: { emoji: '🥈', color: 'from-slate-300 to-slate-400', ring: 'ring-slate-400/40' },
  3: { emoji: '🥉', color: 'from-amber-600 to-amber-700', ring: 'ring-amber-600/40' },
}

const SIZES = {
  sm: 'w-8 h-8 text-base',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl',
}

export function MedalBadge({ position, size = 'md', animated = true }: MedalBadgeProps) {
  const medal = MEDALS[position]
  const Wrapper = animated ? motion.div : 'div'

  return (
    <Wrapper
      {...(animated ? {
        initial: { scale: 0, rotate: -20 },
        animate: { scale: 1, rotate: 0 },
        transition: { type: 'spring', stiffness: 300, damping: 20, delay: (position - 1) * 0.1 },
      } : {})}
      className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center ring-2',
        medal.color,
        medal.ring,
        SIZES[size]
      )}
    >
      {medal.emoji}
    </Wrapper>
  )
}
