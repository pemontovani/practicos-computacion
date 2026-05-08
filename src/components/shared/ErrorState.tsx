import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Ocurrió un error al cargar los datos', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
      <p className="text-slate-300 mb-4">{message}</p>
      {onRetry && <Button onClick={onRetry} variant="outline" size="sm">Reintentar</Button>}
    </div>
  )
}
