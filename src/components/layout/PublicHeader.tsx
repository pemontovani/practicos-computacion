'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { LogIn, LayoutDashboard } from 'lucide-react'

interface PublicHeaderProps {
  title?: string
  cursoCode?: string
  cursoColor?: string
}

export function PublicHeader({ title, cursoCode, cursoColor }: PublicHeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="h-16 border-b border-slate-700/50 bg-slate-900/90 backdrop-blur flex items-center px-4 gap-4 sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-base shadow-lg shadow-indigo-500/25">
          🏎️
        </div>
        <span className="font-bold text-white text-sm hidden md:block">Prácticos Computación</span>
      </Link>

      <div className="flex-1 flex justify-center">
        {title && (
          <div className="flex items-center gap-2.5">
            {cursoCode && cursoColor && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow"
                style={{ backgroundColor: cursoColor }}
              >
                {cursoCode}
              </div>
            )}
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium hidden sm:block">Curso</span>
              <h2 className="font-bold text-white text-base leading-tight truncate">{title}</h2>
            </div>
          </div>
        )}
      </div>

      {session ? (
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:border-indigo-400/50 shrink-0"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Panel docente</span>
        </Link>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 shrink-0"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Acceso docente</span>
        </Link>
      )}
    </header>
  )
}
