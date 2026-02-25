'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
    const pathname = usePathname();

    const tabs = [
        { name: 'Today', path: '/today' },
        { name: 'Track', path: '/track' },
        { name: 'Learn', path: '/learn' },
        { name: 'Log', path: '/log' },
        { name: 'Config', path: '/config' },
    ];

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-bg/90 border-b border-border h-[52px] flex items-center justify-between px-4 sm:px-6">
            <div className="font-display text-xl tracking-[4px] bg-gradient-to-r from-accent to-acid bg-clip-text text-transparent">
                INTEL·OS
            </div>
            <div className="flex space-x-1">
                {tabs.map(t => {
                    const active = pathname === t.path;
                    return (
                        <Link key={t.name} href={t.path}
                            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${active ? 'bg-accent text-white' : 'text-muted2 hover:text-text'}`}>
                            {t.name}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
