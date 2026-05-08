import { cn } from '@/lib/utils'
import { getColorTier, getTierColors } from '@/lib/calculations/progress'

interface PercentageBadgeProps {
  percent: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PercentageBadge({ percent, size = 'md', className }: PercentageBadgeProps) {
  const tier = getColorTier(percent)
  const colors = getTierColors(tier)

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-3 py-1',
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-semibold border',
      colors.badge,
      colors.border,
      sizeClasses[size],
      className
    )}>
      {Math.round(percent)}%
    </span>
  )
}
