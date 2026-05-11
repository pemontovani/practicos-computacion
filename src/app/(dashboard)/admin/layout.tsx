import Link from 'next/link'
import { Header } from '@/components/layout/Header'

const adminLinks = [
  { href: '/admin/cursos', label: 'Cursos' },
  { href: '/admin/alumnos', label: 'Alumnos' },
  { href: '/admin/tps', label: 'TPs' },
  { href: '/admin/entregas', label: 'Entregas' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Administración" />
      <div className="border-b border-slate-700/50 bg-slate-900/80">
        <div className="px-6 flex gap-1">
          {adminLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-3 text-sm text-slate-400 hover:text-white border-b-2 border-transparent hover:border-indigo-500 transition-all"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
