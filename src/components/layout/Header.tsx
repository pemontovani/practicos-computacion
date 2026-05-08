'use client'

import { useSession } from 'next-auth/react'
import { Menu } from 'lucide-react'

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="h-14 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur flex items-center px-4 gap-4 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1">
        {title && <h2 className="font-semibold text-white text-sm">{title}</h2>}
      </div>

      {session?.user && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {session.user.name?.[0]?.toUpperCase() ?? 'P'}
          </div>
          <span className="hidden sm:block text-sm text-slate-300">
            {session.user.name}
          </span>
        </div>
      )}
    </header>
  )
}
