export function RaceLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
        <span>Avanzado (≥70%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-amber-500" />
        <span>En progreso (40–70%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span>Atrasado (&lt;40%)</span>
      </div>
      <div className="ml-auto text-slate-500">Click en un auto para ver detalles</div>
    </div>
  )
}
