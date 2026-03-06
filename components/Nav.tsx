'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, LayoutDashboard, Database, Target, Settings, Brain, Moon } from 'lucide-react'
import { useDay } from '@/hooks/useDay'
import { getExpectedTaskIds } from '@/lib/dayEngine'
import { useState, useEffect } from 'react'

export default function Nav() {
    const pathname = usePathname()
    const { data: day } = useDay()
    const [isFocusTime, setIsFocusTime] = useState(false)

    useEffect(() => {
        const checkTime = () => {
            const hour = new Date().getHours()
            // 9 PM (21) to 1 AM (1)
            setIsFocusTime(hour >= 21 || hour < 1)
        }
        checkTime()
        const interval = setInterval(checkTime, 60000) // check every minute
        return () => clearInterval(interval)
    }, [])

    const links = [
        { href: '/today', label: 'COMMAND', icon: Activity },
        { href: '/intel', label: 'INTEL', icon: Target },
        { href: '/map', label: 'MAP', icon: Brain },
        { href: '/config', label: 'SYS', icon: Settings },
    ]


    // Global progress
    let pct = 0;
    if (day) {
        const total = getExpectedTaskIds(day.dayN, day).length;
        const complete = day.completedTaskIds.filter((id: string) => getExpectedTaskIds(day.dayN, day).includes(id)).length;
        pct = total > 0 ? Math.round((complete / total) * 100) : 0;
    }

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95vw] sm:w-auto max-w-[500px]">
            <div className="bg-surface/90 backdrop-blur-md border border-borderHi rounded-full p-[6px] flex items-center justify-between gap-1 shadow-2xl overflow-x-auto no-scrollbar">
                {links.map((link) => {
                    const isActive = pathname.startsWith(link.href)
                    const Icon = link.icon
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full a-transition ${isActive ? 'bg-muted/10 text-text font-bold' : 'text-muted2 hover:text-text hover:bg-muted/5'}`}
                        >
                            <Icon size={14} className={isActive ? 'text-accent' : ''} />
                            <span className="font-mono text-[10px] tracking-wider hidden sm:block">{link.label}</span>
                        </Link>
                    )
                })}

                {/* Global Progress Indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 ml-2 border-l border-borderHi">
                    {isFocusTime && (
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/20 animate-pulse" title="Focus Block Active">
                            <Moon size={12} className="text-accent" />
                        </div>
                    )}
                    <div className="relative w-5 h-5 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="10" cy="10" r="8" fill="none" className="stroke-surface2" strokeWidth="2" />
                            <circle cx="10" cy="10" r="8" fill="none" className="stroke-accent transition-all duration-1000 ease-out" strokeWidth="2" strokeDasharray="50.2" strokeDashoffset={50.2 - (50.2 * pct) / 100} strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="font-mono text-[10px] text-text min-w-[3ch]">{pct}%</span>
                </div>
            </div>
        </nav>
    )
}
