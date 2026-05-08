'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Settings, LogOut, Flag, Users, ClipboardList,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/curso/cursos', icon: BookOpen, label: 'Cursos', isGroup: true },
  { href: '/admin/alumnos', icon: Users, label: 'Alumnos' },
  { href: '/admin/tps', icon: ClipboardList, label: 'TPs' },
  { href: '/admin/entregas', icon: Flag, label: 'Entregas' },
]

const CURSO_LINKS = [
  { href: '/curso/2A', label: '2° A', color: '#6366f1' },
  { href: '/curso/2B', label: '2° B', color: '#ec4899' },
  { href: '/curso/3A', label: '3° A', color: '#f97316' },
  { href: '/curso/3B', label: '3° B', color: '#22c55e' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-700/50 py-6">
      <div className="px-6 mb-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-500/25">
            🏎️
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">Prácticos Computación</h1>
            <p className="text-slate-500 text-xs">CIEU</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          if (item.isGroup) {
            return (
              <div key={item.href} className="pt-4 pb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Cursos</p>
                <div className="space-y-0.5">
                  {CURSO_LINKS.map((cl) => {
                    const active = pathname.startsWith(cl.href)
                    return (
                      <Link key={cl.href} href={cl.href}>
                        <div className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                          active
                            ? 'bg-slate-700/60 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}>
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cl.color }} />
                          {cl.label}
                        </div>
                      </Link>
                    )
                  })}
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mt-4 mb-2">Admin</p>
              </div>
            )
          }

          const active = pathname.startsWith(item.href) && item.href !== '/dashboard'
            ? true
            : pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                active
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 mt-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
