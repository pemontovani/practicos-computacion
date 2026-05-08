import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { LogIn } from 'lucide-react'

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  const cursos = await prisma.curso.findMany({
    where: { activo: true },
    orderBy: [{ anio: 'asc' }, { division: 'asc' }],
  })

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="h-14 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur flex items-center px-6 gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-base shadow-lg shadow-indigo-500/25">
            🏎️
          </div>
          <span className="font-bold text-white text-sm">Prácticos Computación</span>
          <span className="text-slate-500 text-xs hidden sm:block">· CIEU</span>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Acceso docente</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🏎️</div>
          <h1 className="text-3xl font-bold text-white mb-2">Prácticos Computación</h1>
          <p className="text-slate-400 text-sm">Elegí tu curso para ver tu progreso en los TPs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          {cursos.map((curso) => (
            <Link key={curso.id} href={`/curso/${curso.anio}${curso.division}`}>
              <div className="bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all hover:bg-slate-800 group cursor-pointer">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: curso.color }}
                >
                  {curso.anio}°{curso.division}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-white text-sm">{curso.nombre}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{curso.anio}° año · División {curso.division}</div>
                </div>
                <span className="text-xs text-indigo-400 group-hover:text-indigo-300 transition-colors font-medium">
                  Ver carrera →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
