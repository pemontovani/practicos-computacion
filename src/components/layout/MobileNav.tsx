'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Users, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/curso/2A', icon: BookOpen, label: 'Cursos' },
  { href: '/admin/alumnos', icon: Users, label: 'Alumnos' },
  { href: '/admin/tps', icon: ClipboardList, label: 'TPs' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-700/50 flex">
      {items.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <div className={cn(
              'flex flex-col items-center gap-1 py-3 text-xs transition-all',
              active ? 'text-indigo-400' : 'text-slate-500'
            )}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
