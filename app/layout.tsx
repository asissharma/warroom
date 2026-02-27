import type { Metadata } from 'next'
import { Bebas_Neue, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-body' })
const jbMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
    title: 'INTEL·OS',
    description: '180-Day Elite Engineering Protocol',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${bebas.variable} ${outfit.variable} ${jbMono.variable} dark`}>
            <body className="bg-bg text-text min-h-screen flex flex-col antialiased">
                <Nav />
                <main className="flex-1 overflow-x-hidden relative pb-24">
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(124, 92, 252, 0.05), transparent 40%)' }} />
                    {children}
                </main>
            </body>
        </html>
    )
}
