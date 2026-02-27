'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, LayoutDashboard, Database, Target, Settings } from 'lucide-react'

export default function Nav() {
    const pathname = usePathname()
    const links = [
        { href: '/today', label: 'TODAY', icon: Activity },
        { href: '/dashboard', label: 'DASH', icon: LayoutDashboard },
        { href: '/learn', label: 'LEARN', icon: Database },
        { href: '/log', label: 'LOG', icon: Target },
        { href: '/config', label: 'SYS', icon: Settings },
    ]

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95vw] sm:w-auto max-w-[400px]">
            <div className="bg-surface/80 backdrop-blur-md border border-[rgba(255,255,255,0.055)] rounded-full p-[6px] flex items-center justify-between gap-1 shadow-2xl overflow-x-auto no-scrollbar">
                {links.map((link) => {
                    const isActive = pathname.startsWith(link.href)
                    const Icon = link.icon
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full a-transition ${isActive ? 'bg-white/10 text-white' : 'text-muted2 hover:text-white hover:bg-white/5'}`}
                        >
                            <Icon size={14} className={isActive ? 'text-accent' : ''} />
                            <span className="font-mono text-[10px] tracking-wider hidden sm:block">{link.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
